import http from 'node:http';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 8787);
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const GEMINI_MODELS = String(process.env.GEMINI_MODEL || 'gemini-2.5-flash,gemini-2.5-flash-lite,gemini-2.0-flash')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const OPENROUTER_API_KEY = (process.env.OPENROUTER_API_KEY || '').trim();
const OPENROUTER_MODELS = String(process.env.OPENROUTER_MODEL || 'openai/gpt-oss-20b:free,openai/gpt-oss-120b:free,google/gemma-4-31b-it:free')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const OPENROUTER_SITE = (process.env.OPENROUTER_SITE || '').trim();
const GROQ_API_KEY = (process.env.GROQ_API_KEY || '').trim();
const GROQ_MODELS = String(process.env.GROQ_MODEL || 'openai/gpt-oss-20b,openai/gpt-oss-120b,llama-3.1-8b-instant')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
function aiConfigured() { return Boolean(GEMINI_API_KEY || OPENROUTER_API_KEY || GROQ_API_KEY); }
const ALLOWED_DIFFS = new Set(['easy', 'medium', 'hard', 'mixed']);
const ALLOWED_CATS = new Set([
  'mixed', 'sports', 'history', 'science', 'geography', 'tech', 'movies',
  'music', 'kids', 'tamil', 'gk', 'maths', 'literature', 'animals', 'space',
  'gaming', 'world', 'india', 'custom',
]);
const ALLOWED_LANGS = new Set(['en', 'ta', 'both']);
const ALLOWED_QTYPES = new Set(['mcq', 'tf', 'mixed']);
const ALLOWED_FOCUS = new Set(['global', 'india', 'topic']);
function cleanLang(v) { const s = String(v || 'en').toLowerCase(); return ALLOWED_LANGS.has(s) ? s : 'en'; }
function cleanQType(v) { const s = String(v || 'mcq').toLowerCase(); return ALLOWED_QTYPES.has(s) ? s : 'mcq'; }
const STATE_IDS = new Set([
  'tamil-nadu', 'kerala', 'karnataka', 'andhra-pradesh', 'telangana',
  'maharashtra', 'gujarat', 'rajasthan', 'punjab', 'delhi',
  'uttar-pradesh', 'west-bengal',
]);
const STATE_NAMES = {
  'tamil-nadu': 'Tamil Nadu', kerala: 'Kerala', karnataka: 'Karnataka',
  'andhra-pradesh': 'Andhra Pradesh', telangana: 'Telangana', maharashtra: 'Maharashtra',
  gujarat: 'Gujarat', rajasthan: 'Rajasthan', punjab: 'Punjab', delhi: 'Delhi',
  'uttar-pradesh': 'Uttar Pradesh', 'west-bengal': 'West Bengal',
};
function cleanRegion(v) {
  const r = String(v || 'global').toLowerCase();
  if (r === 'global' || r === 'india' || STATE_IDS.has(r)) return r;
  return 'global';
}
function regionPrompt(region) {
  if (region === 'india') return ' Focus on India: its states, history, geography, culture, sports, cinema and current affairs.';
  if (STATE_IDS.has(region)) return ` Focus on ${STATE_NAMES[region]}, India: its districts and cities, history, geography, culture, festivals, sports, cinema and famous people.`;
  return '';
}

/* ---------------- helpers ---------------- */
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

function normalize(raw, cat, qtype = 'mcq') {
  if (!raw || typeof raw !== 'object') return null;
  const options = Array.isArray(raw.options) ? raw.options.map(String) : [];
  if (options.length !== 4 && options.length !== 2) return null;
  if (options.some((o) => !o.trim())) return null;
  if (new Set(options.map((o) => o.trim().toLowerCase())).size !== options.length) return null;
  if (qtype === 'tf' && options.length !== 2) return null;
  const correct = coerceIndex(raw.correctAnswer ?? raw.answer ?? raw.correct);
  if (correct < 0 || correct > options.length - 1) return null;
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

function calcPoints(timer, elapsed, streak, mode = 'classic') {
  if (elapsed >= timer) return 0;
  const frac = 1 - elapsed / timer;
  let speed = 30;
  if (frac > 0.85) speed = 100;
  else if (frac > 0.5) speed = 70;
  let pts = 100 + speed;
  if (mode === 'speed') pts += Math.round(frac * 50);
  if (streak + 1 >= 10) pts += 250;
  else if (streak + 1 >= 5) pts += 100;
  else if (streak + 1 >= 3) pts += 50;
  return pts;
}

function roomCode(len = 5) {
  const c = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
}

const CATEGORY_FOCUS = {
  sports: 'ONLY sports: cricket, football, Olympics, tennis, athletes, rules, scores, tournaments. NEVER science, history or movies.',
  history: 'ONLY history: ancient/medieval/modern events, empires (Chola, Mughal, Roman), wars, independence movements, dates, historical figures. NEVER science, physics, chemistry or biology.',
  science: 'ONLY science: physics, chemistry, biology, human body, elements, experiments. NEVER history or sports.',
  geography: 'ONLY geography: countries, capitals, rivers, mountains, maps, flags. NEVER history dates or science formulas.',
  tech: 'ONLY technology: computers, AI, internet, gadgets, programming, inventors. NEVER history or biology.',
  movies: 'ONLY movies: films, directors, actors, Oscars, blockbusters. NEVER science or history.',
  music: 'ONLY music: songs, bands, instruments, composers, genres. NEVER sports or science.',
  kids: 'ONLY fun kid-friendly general questions with very simple words. NEVER hard history or science.',
  tamil: 'ONLY Tamil Nadu / Tamil language, culture, temples, cinema, literature, festivals. NEVER generic science.',
  gk: 'general knowledge spanning many topics (one question per topic is fine).',
  maths: 'ONLY mathematics: arithmetic, algebra, geometry, numbers, logic puzzles with a single numeric answer. NEVER history or science facts.',
  literature: 'ONLY literature: books, authors, poets, plays, novels. NEVER science or sports.',
  animals: 'ONLY animals & nature: species, habitats, wildlife facts. NEVER history or tech.',
  space: 'ONLY space: planets, stars, ISRO/NASA missions, astronauts, universe. NEVER sports or movies.',
  gaming: 'ONLY video games, esports, consoles, game characters. NEVER history or biology.',
  world: 'ONLY world cultures, countries, food, festivals, landmarks. NEVER maths formulas or physics.',
  india: 'ONLY India: states, history, geography, culture, sports, cinema, current affairs. NEVER generic non-India facts.',
  mixed: 'mixed general knowledge across many topics.',
};
function buildPrompt({ category, count, difficulty, region, language, questionType, customTopic, focus }) {
  const isCustom = category === 'custom' && String(customTopic || '').trim();
  const catLabel = isCustom ? `CUSTOM TOPIC "${String(customTopic).trim().toUpperCase()}"` : category === 'mixed' ? 'mixed general knowledge' : category.toUpperCase();
  const focusRule = isCustom
    ? `Every question MUST be strictly about "${String(customTopic).trim()}". NEVER drift to other topics.`
    : (CATEGORY_FOCUS[category] || CATEGORY_FOCUS.mixed);
  const langBit = language === 'ta' || category === 'tamil'
    ? ' Write the question AND all options AND explanation in Tamil (தமிழ்).'
    : language === 'both'
      ? ' Alternate languages: odd-numbered questions fully in English, even-numbered fully in Tamil (தமிழ்).'
      : ' Write everything in English.';
  const regionBit = focus === 'topic' ? '' : regionPrompt(region || 'global');
  const diffBit = difficulty === 'mixed' ? 'a mix of easy, medium and hard' : `difficulty=${difficulty} for EVERY question`;
  const typeBit = questionType === 'tf'
    ? 'TYPE: True/False ONLY. Each item MUST have exactly options ["True","False"] and correctAnswer 0 or 1.'
    : questionType === 'mixed'
      ? 'TYPE: alternate — odd questions 4-option MCQ, even questions True/False with options ["True","False"].'
      : 'TYPE: 4-option multiple choice ONLY. Each item MUST have exactly 4 distinct options, correctAnswer 0-3.';
  const schema = questionType === 'tf'
    ? '{"question":string,"options":["True","False"],"correctAnswer":0-1,"explanation":one short sentence}'
    : '{"question":string,"options":[4 distinct plausible strings, or ["True","False"] for True/False items],"correctAnswer":index of the correct option,"explanation":one short sentence}';
  return (
    `You are a strict quiz generator. Generate EXACTLY ${count} quiz questions. ` +
    `CATEGORY (strict): ${catLabel}. Topic rule: ${focusRule}${langBit}${regionBit} ` +
    `Difficulty: ${diffBit}. ${typeBit} ` +
    `CRITICAL: 100% of questions MUST be about ${catLabel}. Off-topic questions are a FAILURE. ` +
    `Return ONLY a JSON array, no markdown, no commentary. Each item: ${schema}. ` +
    `Rules: exactly 1 correct answer, no duplicate options, no duplicate questions, family-friendly, factually correct, options shuffled so the correct answer is evenly spread.`
  );
}
function parseJsonArray(text) {
  try { return JSON.parse(text); } catch { /* fall through */ }
  const m = String(text || '').match(/\[[\s\S]*\]/);
  if (!m) throw new Error('unparseable AI response');
  return JSON.parse(m[0]);
}
function isQuotaError(status, snippet) {
  if (status === 429) return true;
  if (status !== 400 && status !== 403) return false;
  const s = String(snippet || '').toLowerCase();
  return s.includes('quota') || s.includes('rate') || s.includes('resource_exhausted') || s.includes('too many requests');
}
function isModelNotFound(status, snippet) {
  if (status !== 404) return false;
  return /not_found|is not found|not supported/i.test(String(snippet || ''));
}
async function callGemini(model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', temperature: 0.7, maxOutputTokens: 6000 },
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!res.ok) {
    const snippet = (await res.text().catch(() => '')).slice(0, 300);
    const err = new Error(`gemini ${res.status} model=${model} ${snippet}`);
    err.quota = isQuotaError(res.status, snippet);
    err.notFound = isModelNotFound(res.status, snippet);
    throw err;
  }
  const data = await res.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  if (!text.trim()) throw new Error(`empty gemini response model=${model}`);
  return parseJsonArray(text);
}
async function callOpenRouter(model, prompt) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      ...(OPENROUTER_SITE ? { 'HTTP-Referer': OPENROUTER_SITE, 'X-Title': 'Quizlly' } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You output ONLY valid JSON arrays. No markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 6000,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const snippet = (await res.text().catch(() => '')).slice(0, 300);
    const err = new Error(`openrouter ${res.status} model=${model} ${snippet}`);
    err.quota = res.status === 429;
    throw err;
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error(`empty openrouter response model=${model}`);
  let parsed = parseJsonArray(text);
  if (!Array.isArray(parsed) && parsed && Array.isArray(parsed.questions)) parsed = parsed.questions;
  if (!Array.isArray(parsed)) throw new Error(`unparseable openrouter response model=${model}`);
  return parsed;
}
const aiStats = { lastOk: null, lastFail: null };
function noteOk(provider, n, cat) {
  aiStats.lastOk = { at: new Date().toISOString(), provider, n, cat };
  console.log(`[ai] ${provider} ok n=${n} cat=${cat}`);
}
function noteFail(err) {
  const msg = err instanceof Error ? err.message : String(err);
  aiStats.lastFail = { at: new Date().toISOString(), message: msg.slice(0, 200) };
  console.error(`[ai] ${msg}`);
  return err instanceof Error ? err : new Error(String(err));
}
async function callGroq(model, prompt) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You output ONLY valid JSON arrays. No markdown.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) {
    const snippet = (await res.text().catch(() => '')).slice(0, 300);
    const err = new Error(`groq ${res.status} model=${model} ${snippet}`);
    err.quota = res.status === 429;
    throw err;
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || '';
  if (!text.trim()) throw new Error(`empty groq response model=${model}`);
  let parsed = parseJsonArray(text);
  if (!Array.isArray(parsed) && parsed && Array.isArray(parsed.questions)) parsed = parsed.questions;
  if (!Array.isArray(parsed)) throw new Error(`unparseable groq response model=${model}`);
  return parsed;
}
async function generateAIQuestions({ category, count, difficulty, region, language, questionType, customTopic, focus }) {
  const prompt = buildPrompt({ category, count, difficulty, region, language, questionType, customTopic, focus });
  let lastErr = new Error('no AI providers configured (set GEMINI_API_KEY, OPENROUTER_API_KEY and/or GROQ_API_KEY)');
  const tryParse = (parsed, tag, qtype) => {
    const arr = Array.isArray(parsed) ? parsed : parsed.questions;
    if (!Array.isArray(arr)) throw new Error(`unparseable ${tag} response`);
    const out = arr.map((r) => normalize(r, category, qtype)).filter(Boolean);
    if (out.length < Math.min(3, count)) throw new Error(`zero valid questions ${tag}`);
    return out;
  };
  if (GEMINI_API_KEY) {
    for (const model of GEMINI_MODELS) {
      try {
        const out = tryParse(await callGemini(model, prompt), `gemini:${model}`, questionType);
        noteOk(`gemini:${model}`, out.length, category);
        return { questions: out, provider: `gemini:${model}` };
      } catch (e) {
        lastErr = noteFail(e);
      }
    }
  }
  if (OPENROUTER_API_KEY) {
    for (const model of OPENROUTER_MODELS) {
      try {
        const out = tryParse(await callOpenRouter(model, prompt), `openrouter:${model}`, questionType);
        noteOk(`openrouter:${model}`, out.length, category);
        return { questions: out, provider: `openrouter:${model}` };
      } catch (e) {
        lastErr = noteFail(e);
      }
    }
  }
  if (GROQ_API_KEY) {
    for (const model of GROQ_MODELS) {
      try {
        const out = tryParse(await callGroq(model, prompt), `groq:${model}`, questionType);
        noteOk(`groq:${model}`, out.length, category);
        return { questions: out, provider: `groq:${model}` };
      } catch (e) {
        lastErr = noteFail(e);
      }
    }
  }
  throw lastErr;
}

/* ---------------- realtime rooms ---------------- */
const rooms = new Map(); // code -> room
const sockets = new Map(); // ws -> { code, playerId }

function pubPlayer(p) {
  return {
    id: p.id, name: p.name, avatar: p.avatar, score: p.score, correct: p.correct,
    streak: p.streak, bestStreak: p.bestStreak, rank: 1, ready: true,
    isHost: p.isHost, connected: p.connected,
  };
}

function pubRoom(room) {
  return {
    code: room.code, config: room.config, status: room.status,
    players: room.players.map(pubPlayer), hostId: room.hostId,
  };
}

function rowsOf(room) {
  return [...room.players].map(pubPlayer).sort((a, b) => b.score - a.score);
}

function sendWs(ws, msg) {
  try {
    if (ws.readyState === 1) ws.send(JSON.stringify(msg));
  } catch { /* ignore */ }
}

function roomSockets(room) {
  const out = [];
  for (const [ws, ref] of sockets) {
    if (ref.code === room.code) out.push(ws);
  }
  return out;
}

function cast(room, msg, remember = false) {
  if (remember) room.lastMsg = msg;
  for (const ws of roomSockets(room)) sendWs(ws, msg);
}

function clearRoomTimers(room) {
  for (const t of room.timers) clearTimeout(t);
  room.timers = [];
}
function later(room, ms, fn) {
  const t = setTimeout(() => {
    room.timers = room.timers.filter((x) => x !== t);
    fn();
  }, ms);
  room.timers.push(t);
}

function touch(room) {
  room.touchedAt = Date.now();
}

function destroyRoom(code) {
  const room = rooms.get(code);
  if (!room) return;
  clearRoomTimers(room);
  rooms.delete(code);
}

setInterval(() => {
  const now = Date.now();
  for (const [code, room] of rooms) {
    if (room.players.length === 0 || now - room.touchedAt > 2 * 3600 * 1000) destroyRoom(code);
  }
}, 5 * 60 * 1000).unref?.();

function attach(ws, room, player) {
  sockets.set(ws, { code: room.code, playerId: player.id });
  if (player.leaveTimer) { clearTimeout(player.leaveTimer); player.leaveTimer = null; }
  player.ws = ws;
  const wasGone = !player.connected;
  player.connected = true;
  touch(room);
  if (wasGone && (room.status === 'LOBBY' || room.status === 'FINISHED')) {
    cast(room, { t: 'room', room: pubRoom(room) });
  }
}

function sweepDisconnected(room) {
  if (!rooms.get(room.code)) return;
  if (room.status === 'COUNTDOWN' || room.status === 'QUESTION' || room.status === 'REVEAL') return;
  const gone = room.players.filter((p) => !p.connected);
  if (!gone.length) return;
  room.players = room.players.filter((p) => p.connected);
  if (room.players.length && !room.players.some((p) => p.isHost)) room.players[0].isHost = true;
  if (room.players.length) room.hostId = room.players.find((p) => p.isHost)?.id || room.players[0].id;
  touch(room);
  if (room.players.length === 0) {
    destroyRoom(room.code);
  } else if (room.status === 'LOBBY' || room.status === 'FINISHED') {
    cast(room, { t: 'room', room: pubRoom(room) });
  }
}

function detach(ws) {
  const ref = sockets.get(ws);
  if (!ref) return;
  sockets.delete(ws);
  const room = rooms.get(ref.code);
  if (!room) return;
  const p = room.players.find((x) => x.id === ref.playerId);
  if (!p || p.ws !== ws) return;
  p.ws = null;
  touch(room);
  if (p.leaveTimer) clearTimeout(p.leaveTimer);
  p.leaveTimer = setTimeout(() => {
    p.leaveTimer = null;
    if (!rooms.get(room.code)) return;
    if (p.ws) return;
    p.connected = false;
    touch(room);
    if (room.status === 'LOBBY' || room.status === 'FINISHED') {
      cast(room, { t: 'room', room: pubRoom(room) });
    }
    later(room, 45000, () => sweepDisconnected(room));
  }, 8000);
  if (p.leaveTimer.unref) p.leaveTimer.unref();
}

function validName(name) {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 16;
}

async function handleStart(room, byId) {
  const by = room.players.find((p) => p.id === byId);
  if (!by || !by.isHost) return;
  if (room.status !== 'LOBBY' && room.status !== 'FINISHED') return;
  if (!aiConfigured() && !process.env.QUIZUSH_STUB_QS) {
    cast(room, { t: 'error', msg: 'AI is not configured on the server yet.' });
    return;
  }
  room.status = 'COUNTDOWN';
  cast(room, { t: 'room', room: pubRoom(room) });
  try {
    const stub = process.env.QUIZUSH_STUB_QS;
    const want = Math.max(3, Math.min(40, Number(room.config.count) || 10));
    if (room.config.category === 'custom' && !String(room.config.customTopic || '').trim()) {
      room.status = 'LOBBY';
      cast(room, { t: 'room', room: pubRoom(room) });
      cast(room, { t: 'error', msg: 'Custom topic needs a name.' });
      return;
    }
    const { questions: fetched, provider } = stub
      ? { questions: JSON.parse(stub), provider: 'stub' }
      : await generateAIQuestions({
        category: room.config.category || 'mixed',
        count: want,
        difficulty: room.config.difficulty || 'mixed',
        region: room.config.focus === 'india' ? 'india' : room.config.region || 'global',
        language: cleanLang(room.config.language),
        questionType: cleanQType(room.config.questionType),
        customTopic: String(room.config.customTopic || '').slice(0, 80),
        focus: ALLOWED_FOCUS.has(room.config.focus) ? room.config.focus : 'global',
      });
    room.provider = provider;
    const qs = fetched.slice(0, want);
    if (qs.length < 3) throw new Error('too few questions');
    if (room.status !== 'COUNTDOWN') return;
    room.questions = qs;
    room.qi = 0;
    cast(room, { t: 'count', n: 3 }, true);
    later(room, 700, () => room.status === 'COUNTDOWN' && cast(room, { t: 'count', n: 2 }, true));
    later(room, 1400, () => room.status === 'COUNTDOWN' && cast(room, { t: 'count', n: 1 }, true));
    later(room, 2100, () => room.status === 'COUNTDOWN' && cast(room, { t: 'count', n: 0 }, true));
    later(room, 2600, () => room.status === 'COUNTDOWN' && askQuestion(room));
  } catch (e) {
    room.status = 'LOBBY';
    cast(room, { t: 'room', room: pubRoom(room) });
    const raw = String(e?.message || e);
    const quota = Boolean(e?.quota) || /(^|\s)429(\s|$)|quota|resource_exhausted|too many requests/i.test(raw);
    const detail = raw.slice(0, 200);
    console.error(`[ai] start failed: ${detail}`);
    cast(room, { t: 'error', msg: quota ? 'AI limit reached — please try again later.' : 'AI question generation failed. Try again.', detail });
  }
}

function roomTimer(room) { const t = Number(room.config.timer); return [10, 20, 30, 60].includes(t) ? t : 10; }
function askQuestion(room) {
  const q = room.questions[room.qi];
  if (!q) return finishRoom(room);
  room.status = 'QUESTION';
  room.answers = {};
  const timer = roomTimer(room);
  room.endsAt = Date.now() + timer * 1000;
  touch(room);
  cast(room, {
    t: 'question', qi: room.qi, total: room.questions.length,
    question: q.question, options: q.options, category: q.category,
    endsAt: room.endsAt, timer, rows: rowsOf(room), provider: room.provider || 'ai',
  }, true);
  later(room, timer * 1000 + 500, () => {
    if (room.status === 'QUESTION') reveal(room);
  });
}

function reveal(room) {
  const q = room.questions[room.qi];
  if (!q) return finishRoom(room);
  room.status = 'REVEAL';
  const gains = {};
  for (const p of room.players) {
    const a = room.answers[p.id];
    if (a && a.pick === q.correctAnswer) {
      const pts = calcPoints(roomTimer(room), a.elapsed, p.streak, room.config.mode);
      p.score += pts;
      p.correct += 1;
      p.streak += 1;
      p.bestStreak = Math.max(p.bestStreak, p.streak);
      gains[p.id] = pts;
    } else {
      p.streak = 0;
      gains[p.id] = 0;
    }
  }
  touch(room);
  cast(room, { t: 'reveal', correct: q.correctAnswer, explanation: q.explanation, gains, rows: rowsOf(room) }, true);
  later(room, 2800, () => {
    if (room.status !== 'REVEAL') return;
    room.qi += 1;
    if (room.qi >= room.questions.length) finishRoom(room);
    else askQuestion(room);
  });
}

function finishRoom(room) {
  room.status = 'FINISHED';
  room.rows = rowsOf(room);
  touch(room);
  cast(room, { t: 'finished', rows: room.rows, total: room.questions.length }, true);
  later(room, 60000, () => sweepDisconnected(room));
}

function onMessage(ws, raw) {
  let m;
  try {
    m = JSON.parse(String(raw));
  } catch {
    return sendWs(ws, { t: 'error', msg: 'bad message' });
  }

  if (m.t === 'hello') {
    const room = rooms.get(String(m.code || '').toUpperCase());
    const p = room?.players.find((x) => x.id === m.playerId);
    if (!room || !p) return sendWs(ws, { t: 'error', msg: 'room gone' });
    attach(ws, room, p);
    sendWs(ws, { t: 'room', room: pubRoom(room), you: p.id });
    if (room.lastMsg) sendWs(ws, room.lastMsg);
    return;
  }

  if (m.t === 'create') {
    if (!validName(m.name)) return sendWs(ws, { t: 'error', msg: 'Enter a display name (2+ characters).' });
    const count = Math.max(3, Math.min(40, Number(m.config?.count) || 10));
    const timer = [10, 20, 30, 60].includes(Number(m.config?.timer)) ? Number(m.config.timer) : 10;
    const category = ALLOWED_CATS.has(String(m.config?.category)) ? String(m.config.category) : 'mixed';
    const difficulty = ALLOWED_DIFFS.has(String(m.config?.difficulty)) ? String(m.config.difficulty) : 'mixed';
    const mode = ['classic', 'speed', 'elimination'].includes(m.config?.mode) ? m.config.mode : 'classic';
    const maxPlayers = [2, 4, 8, 16, 32].includes(Number(m.config?.maxPlayers)) ? Number(m.config.maxPlayers) : 8;
    const region = cleanRegion(m.config?.region);
    const language = cleanLang(m.config?.language);
    const questionType = cleanQType(m.config?.questionType);
    const focus = ALLOWED_FOCUS.has(m.config?.focus) ? m.config.focus : 'global';
    const customTopic = String(m.config?.customTopic || '').slice(0, 80);
    let code = roomCode(5);
    while (rooms.has(code)) code = roomCode(5);
    const player = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      name: m.name.trim(), avatar: String(m.avatar || 'https://api.dicebear.com/9.x/adventurer/svg?seed=Aria').slice(0, 300),
      score: 0, correct: 0, streak: 0, bestStreak: 0, ready: true,
      isHost: true, connected: true, ws: null,
    };
    const room = {
      code, config: { category, count, timer, difficulty, mode, maxPlayers, region, language, questionType, customTopic, focus },
      players: [player], hostId: player.id, status: 'LOBBY',
      questions: [], qi: 0, answers: {}, endsAt: 0, timers: [],
      lastMsg: null, rows: [], touchedAt: Date.now(),
    };
    rooms.set(code, room);
    attach(ws, room, player);
    sendWs(ws, { t: 'room', room: pubRoom(room), you: player.id });
    return;
  }

  if (m.t === 'join') {
    const room = rooms.get(String(m.code || '').toUpperCase());
    if (!room) return sendWs(ws, { t: 'error', msg: "Couldn't find that room. Check the code." });
    if (!validName(m.name)) return sendWs(ws, { t: 'error', msg: 'Enter a display name (2+ characters).' });
    if (room.players.filter((p) => p.connected).length >= (room.config.maxPlayers || 8)) return sendWs(ws, { t: 'error', msg: 'Room is full.' });
    if (room.status !== 'LOBBY') return sendWs(ws, { t: 'error', msg: 'Game already started. Wait for the next match.' });
    if (room.players.some((p) => p.connected && p.name.toLowerCase() === String(m.name).trim().toLowerCase())) {
      return sendWs(ws, { t: 'error', msg: 'Name already taken in this room.' });
    }
    const player = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      name: String(m.name).trim(), avatar: String(m.avatar || 'https://api.dicebear.com/9.x/adventurer/svg?seed=Leo').slice(0, 300),
      score: 0, correct: 0, streak: 0, bestStreak: 0, ready: true,
      isHost: false, connected: true, ws: null,
    };
    room.players.push(player);
    attach(ws, room, player);
    touch(room);
    sendWs(ws, { t: 'room', room: pubRoom(room), you: player.id });
    cast(room, { t: 'room', room: pubRoom(room) });
    return;
  }

  const ref = sockets.get(ws);
  const room = ref && rooms.get(ref.code);
  const me = room?.players.find((p) => p.id === ref?.playerId);
  if (!room || !me) return sendWs(ws, { t: 'error', msg: 'not in a room' });
  touch(room);

  if (m.t === 'start') {
    handleStart(room, me.id);
    return;
  }

  if (m.t === 'answer') {
    if (room.status !== 'QUESTION') return;
    if (room.answers[me.id]) return;
    const pick = Number(m.pick);
    const q = room.questions[room.qi];
    const maxPick = q && Array.isArray(q.options) ? q.options.length - 1 : 3;
    if (!Number.isInteger(pick) || pick < 0 || pick > maxPick) return;
    const elapsed = Math.max(0, (Date.now() - (room.endsAt - roomTimer(room) * 1000)) / 1000);
    room.answers[me.id] = { pick, elapsed };
    sendWs(ws, { t: 'locked' });
    cast(room, { t: 'answered', ids: Object.keys(room.answers) });
    return;
  }
}

/* ---------------- http + ws server ---------------- */
const server = http.createServer(async (req, res) => {
  if (withCors(req, res)) return;
  const url = new URL(req.url || '/', 'http://localhost');

  if (req.method === 'GET' && url.pathname === '/api/health') {
    send(res, 200, { ok: true, ai: aiConfigured(), gemini: Boolean(GEMINI_API_KEY), openrouter: Boolean(OPENROUTER_API_KEY), groq: Boolean(GROQ_API_KEY), models: GEMINI_MODELS, orModels: OPENROUTER_MODELS, groqModels: GROQ_MODELS, rooms: rooms.size, multiplayer: true, lastOk: aiStats.lastOk, lastFail: aiStats.lastFail });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/questions') {
    if (!aiConfigured() && !process.env.QUIZUSH_STUB_QS) {
      send(res, 503, { error: 'AI not configured on server (set GEMINI_API_KEY, OPENROUTER_API_KEY and/or GROQ_API_KEY)' });
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
    const region = cleanRegion(body.region);
    const count = Math.max(3, Math.min(40, Number(body.count) || 10));
    const language = cleanLang(body.language);
    const questionType = cleanQType(body.questionType);
    const focus = ALLOWED_FOCUS.has(body.focus) ? body.focus : 'global';
    const customTopic = String(body.customTopic || '').slice(0, 80);
    if (!ALLOWED_CATS.has(category) || !ALLOWED_DIFFS.has(difficulty)) {
      send(res, 400, { error: 'invalid category or difficulty' });
      return;
    }
    if (category === 'custom' && !customTopic.trim()) {
      send(res, 400, { error: 'customTopic is required when category=custom' });
      return;
    }
    try {
      const stub = process.env.QUIZUSH_STUB_QS;
      const { questions: fetched, provider } = stub
        ? { questions: JSON.parse(stub), provider: 'stub' }
        : await generateAIQuestions({ category, count, difficulty, region, language, questionType, customTopic, focus });
      const questions = fetched
        .map((r) => (r && r.id ? r : normalize(r, category, questionType)))
        .filter(Boolean)
        .slice(0, count);
      if (questions.length < Math.min(3, count)) throw new Error('too few valid questions');
      send(res, 200, { questions, provider, model: provider });
    } catch (e) {
      const msg = String(e?.message || e);
      const quota = Boolean(e?.quota) || /(^|\s)429(\s|$)|quota|resource_exhausted|too many requests/i.test(msg);
      const notFound = Boolean(e?.notFound) || /not_found|is not found/i.test(msg);
      const status = quota ? 429 : 502;
      const error = quota
        ? 'AI limit reached — please try again later.'
        : notFound
          ? 'AI model not found — update GEMINI_MODEL to a current id (e.g. gemini-2.5-flash)'
          : 'AI generation failed. Please try again.';
      send(res, status, { error, detail: msg });
    }
    return;
  }

  send(res, 404, { error: 'not found' });
});

const wss = new WebSocketServer({ server, path: '/socket' });
wss.on('connection', (ws) => {
  ws.on('message', (raw) => onMessage(ws, raw));
  ws.on('close', () => detach(ws));
  ws.on('error', () => detach(ws));
});

server.listen(PORT, () => {
  console.log(`Quizlly server on :${PORT} (gemini=${GEMINI_API_KEY ? 'on' : 'off'} openrouter=${OPENROUTER_API_KEY ? 'on' : 'off'} multiplayer=on)`);
});
