import http from 'node:http';

const PORT = Number(process.env.PORT || 8787);
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const ALLOWED_DIFFS = new Set(['easy', 'medium', 'hard', 'mixed']);
const ALLOWED_CATS = new Set([
  'mixed', 'sports', 'history', 'science', 'geography', 'tech', 'movies',
  'music', 'kids', 'tamil', 'gk', 'maths', 'literature', 'animals', 'space',
  'gaming', 'world',
]);

function send(res, status, body) {
  const data = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

function withCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }
  return false;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
      if (raw.length > 200_000) {
        req.destroy();
        reject(new Error('payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error('invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function coerceIndex(v) {
  if (typeof v === 'number' && v >= 0 && v <= 3) return v;
  if (typeof v === 'number' && v >= 1 && v <= 4) return v - 1;
  if (typeof v === 'string') {
    const t = v.trim().toUpperCase();
    const li = 'ABCD'.indexOf(t);
    if (li >= 0) return li;
    const num = parseInt(t, 10);
    if (num >= 1 && num <= 4) return num - 1;
  }
  return -1;
}

function normalize(raw, cat) {
  if (!raw || typeof raw !== 'object') return null;
  const options = Array.isArray(raw.options) ? raw.options.map(String) : [];
  if (options.length !== 4 || options.some((o) => !o.trim())) return null;
  if (new Set(options.map((o) => o.trim().toLowerCase())).size !== 4) return null;
  const correct = coerceIndex(raw.correctAnswer ?? raw.answer ?? raw.correct);
  if (correct < 0) return null;
  const diff = String(raw.difficulty || 'medium').toLowerCase();
  if (typeof raw.question !== 'string' || !raw.question.trim()) return null;
  return {
    id: `ai-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
    category: cat,
    difficulty: ['easy', 'medium', 'hard'].includes(diff) ? diff : 'medium',
    question: raw.question.trim(),
    options,
    correctAnswer: correct,
    explanation: String(raw.explanation || ''),
  };
}

async function geminiQuestions({ category, count, difficulty }) {
  const catLabel = category === 'mixed' ? 'mixed general knowledge' : category;
  const tamil = category === 'tamil' ? ' Write questions AND options in Tamil (தமிழ்).' : '';
  const prompt =
    `Generate exactly ${count} ${difficulty === 'mixed' ? 'mixed-difficulty' : difficulty} multiple-choice quiz questions about ${catLabel}.${tamil} ` +
    `Return ONLY a JSON array, no markdown. Each item: {"question":string,"options":[exactly 4 distinct strings],"correctAnswer":0-3 index of the correct option,"explanation":one short sentence}. ` +
    `Rules: exactly 4 options, exactly 1 correct, no duplicates, family-friendly, factually correct.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.9, maxOutputTokens: 6000 },
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  if (!text.trim()) throw new Error('empty gemini response');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    const m = text.match(/\[[\s\S]*\]/);
    if (!m) throw new Error('unparseable gemini response');
    parsed = JSON.parse(m[0]);
  }
  const arr = Array.isArray(parsed) ? parsed : parsed.questions;
  if (!Array.isArray(arr)) throw new Error('unparseable gemini response');
  return arr.map((r) => normalize(r, category)).filter(Boolean);
}

const server = http.createServer(async (req, res) => {
  if (withCors(req, res)) return;
  const url = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/health') {
    send(res, 200, { ok: true, ai: Boolean(GEMINI_API_KEY), model: MODEL });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/questions') {
    if (!GEMINI_API_KEY) {
      send(res, 503, { error: 'AI not configured on server (GEMINI_API_KEY missing)' });
      return;
    }
    let body;
    try {
      body = await readJson(req);
    } catch {
      send(res, 400, { error: 'invalid JSON body' });
      return;
    }
    const category = String(body.category || 'mixed').toLowerCase();
    const difficulty = String(body.difficulty || 'mixed').toLowerCase();
    const count = Math.max(3, Math.min(40, Number(body.count) || 10));
    if (!ALLOWED_CATS.has(category) || !ALLOWED_DIFFS.has(difficulty)) {
      send(res, 400, { error: 'invalid category or difficulty' });
      return;
    }
    try {
      const questions = (await geminiQuestions({ category, count, difficulty })).slice(0, count);
      if (questions.length < Math.min(3, count)) throw new Error('too few valid questions');
      send(res, 200, { questions });
    } catch (e) {
      send(res, 502, { error: 'AI generation failed, use question bank', detail: String(e?.message || e) });
    }
    return;
  }

  send(res, 404, { error: 'not found' });
});

server.listen(PORT, () => {
  console.log(`QuizRush AI server on :${PORT} (ai=${GEMINI_API_KEY ? 'on' : 'OFF — set GEMINI_API_KEY'})`);
});
