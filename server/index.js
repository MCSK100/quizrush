import http from 'node:http';
import { WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 8787);
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const ALLOWED_DIFFS = new Set(['easy', 'medium', 'hard', 'mixed']);
const ALLOWED_CATS = new Set([
  'mixed', 'sports', 'history', 'science', 'geography', 'tech', 'movies',
  'music', 'kids', 'tamil', 'gk', 'maths', 'literature', 'animals', 'space',
  'gaming', 'world',
]);

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
  player.ws = ws;
  player.connected = true;
  touch(room);
}

function sweepDisconnected(room) {
  if (!rooms.get(room.code)) return;
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
  if (!p) return;
  p.connected = false;
  p.ws = null;
  touch(room);
  if (room.status === 'LOBBY' || room.status === 'FINISHED') {
    cast(room, { t: 'room', room: pubRoom(room) });
  }
  later(room, 45000, () => sweepDisconnected(room));
}

function validName(name) {
  return typeof name === 'string' && name.trim().length >= 2 && name.trim().length <= 16;
}

async function handleStart(room, byId) {
  const by = room.players.find((p) => p.id === byId);
  if (!by || !by.isHost) return;
  if (room.status !== 'LOBBY' && room.status !== 'FINISHED') return;
  if (!GEMINI_API_KEY && !process.env.QUIZUSH_STUB_QS) {
    cast(room, { t: 'error', msg: 'AI is not configured on the server yet.' });
    return;
  }
  room.status = 'COUNTDOWN';
  cast(room, { t: 'room', room: pubRoom(room) });
  try {
    const stub = process.env.QUIZUSH_STUB_QS;
    const fetched = stub
      ? JSON.parse(stub)
      : await geminiQuestions({
        category: room.config.category || 'mixed',
        count: Math.max(3, Math.min(40, Number(room.config.count) || 10)),
        difficulty: room.config.difficulty || 'mixed',
      });
    const qs = fetched.slice(0, Math.max(3, Math.min(40, Number(room.config.count) || 10)));
    if (qs.length < 3) throw new Error('too few questions');
    if (room.status !== 'COUNTDOWN') return;
    room.questions = qs;
    room.qi = 0;
    cast(room, { t: 'count', n: 3 }, true);
    later(room, 700, () => room.status === 'COUNTDOWN' && cast(room, { t: 'count', n: 2 }, true));
    later(room, 1400, () => room.status === 'COUNTDOWN' && cast(room, { t: 'count', n: 1 }, true));
    later(room, 2100, () => room.status === 'COUNTDOWN' && cast(room, { t: 'count', n: 0 }, true));
    later(room, 2600, () => room.status === 'COUNTDOWN' && askQuestion(room));
  } catch {
    room.status = 'LOBBY';
    cast(room, { t: 'room', room: pubRoom(room) });
    cast(room, { t: 'error', msg: 'AI question generation failed. Try again.' });
  }
}

function askQuestion(room) {
  const q = room.questions[room.qi];
  if (!q) return finishRoom(room);
  room.status = 'QUESTION';
  room.answers = {};
  room.endsAt = Date.now() + (room.config.timer || 10) * 1000;
  touch(room);
  cast(room, {
    t: 'question', qi: room.qi, total: room.questions.length,
    question: q.question, options: q.options, category: q.category,
    endsAt: room.endsAt, timer: room.config.timer || 10, rows: rowsOf(room),
  }, true);
  later(room, (room.config.timer || 10) * 1000 + 500, () => {
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
      const pts = calcPoints(room.config.timer || 10, a.elapsed, p.streak, room.config.mode);
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
  cast(room, { t: 'finished', rows: room.rows }, true);
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
    const timer = [10, 30, 60].includes(Number(m.config?.timer)) ? Number(m.config.timer) : 10;
    const category = ALLOWED_CATS.has(String(m.config?.category)) ? String(m.config.category) : 'mixed';
    const difficulty = ALLOWED_DIFFS.has(String(m.config?.difficulty)) ? String(m.config.difficulty) : 'mixed';
    const mode = ['classic', 'speed', 'elimination'].includes(m.config?.mode) ? m.config.mode : 'classic';
    const maxPlayers = [2, 4, 8, 16, 32].includes(Number(m.config?.maxPlayers)) ? Number(m.config.maxPlayers) : 8;
    let code = roomCode(5);
    while (rooms.has(code)) code = roomCode(5);
    const player = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      name: m.name.trim(), avatar: String(m.avatar || '⚡').slice(0, 4),
      score: 0, correct: 0, streak: 0, bestStreak: 0, ready: true,
      isHost: true, connected: true, ws: null,
    };
    const room = {
      code, config: { category, count, timer, difficulty, mode, maxPlayers },
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
    if (room.players.length >= (room.config.maxPlayers || 8)) return sendWs(ws, { t: 'error', msg: 'Room is full.' });
    if (room.status !== 'LOBBY') return sendWs(ws, { t: 'error', msg: 'Game already started. Wait for the next battle.' });
    if (room.players.some((p) => p.name.toLowerCase() === String(m.name).trim().toLowerCase())) {
      return sendWs(ws, { t: 'error', msg: 'Name already taken in this room.' });
    }
    const player = {
      id: `p-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      name: String(m.name).trim(), avatar: String(m.avatar || '🎯').slice(0, 4),
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
    if (![0, 1, 2, 3].includes(pick)) return;
    const elapsed = Math.max(0, (Date.now() - (room.endsAt - (room.config.timer || 10) * 1000)) / 1000);
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
    send(res, 200, { ok: true, ai: Boolean(GEMINI_API_KEY), model: MODEL, rooms: rooms.size, multiplayer: true });
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/questions') {
    if (!GEMINI_API_KEY && !process.env.QUIZUSH_STUB_QS) {
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
      const stub = process.env.QUIZUSH_STUB_QS;
      const fetched = stub
        ? JSON.parse(stub)
        : await geminiQuestions({ category, count, difficulty });
      const questions = fetched
        .map((r) => (r && r.id ? r : normalize(r, category)))
        .filter(Boolean)
        .slice(0, count);
      if (questions.length < Math.min(3, count)) throw new Error('too few valid questions');
      send(res, 200, { questions });
    } catch (e) {
      send(res, 502, { error: 'AI generation failed, use question bank', detail: String(e?.message || e) });
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
  console.log(`QuizRush server on :${PORT} (ai=${GEMINI_API_KEY ? 'on' : 'OFF — set GEMINI_API_KEY'}, multiplayer=on)`);
});
