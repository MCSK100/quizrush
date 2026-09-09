import type { Question, QuizConfig } from '../types';
import { SEED_QUESTIONS } from '../data/questions';
export function shuffle<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]] } return a }
export function validateQuestion(q: unknown): q is Question {
  if (!q || typeof q !== 'object') return false; const o = q as Record<string, unknown>;
  if (typeof o.question !== 'string' || !o.question.trim()) return false;
  if (!Array.isArray(o.options) || (o.options.length !== 4 && o.options.length !== 2)) return false;
  if ((o.options as unknown[]).some((x) => typeof x !== 'string' || !(x as string).trim())) return false;
  if (new Set((o.options as string[]).map((s) => s.trim().toLowerCase())).size !== o.options.length) return false;
  if (typeof o.correctAnswer !== 'number' || o.correctAnswer < 0 || o.correctAnswer > o.options.length - 1) return false;
  return true;
}
let n = 0;
const RECENT_KEY = 'qr-recent-q';
function recentIds(): string[] {
  try {
    const a = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(a) ? a.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function rememberIds(ids: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify([...ids, ...recentIds()].slice(0, 80)));
  } catch { /* ignore */ }
}
function toTF(q: Question, i: number): Question {
  const useCorrect = i % 2 === 0;
  const wrong = q.options.find((o, idx) => idx !== q.correctAnswer) || 'None of these';
  const statement = `${q.question} — ${useCorrect ? q.options[q.correctAnswer] : wrong}.`;
  return {
    ...q, id: `${q.id}#tf${n++}`, question: statement,
    options: ['True', 'False'], correctAnswer: useCorrect ? 0 : 1,
    explanation: q.explanation,
  };
}
function fallbackQuestions(cfg: QuizConfig): Question[] {
  const cat = cfg.category || 'mixed';
  let pool = SEED_QUESTIONS.filter((q) => {
    if (cat === 'mixed' || cat === 'all' || cat === 'custom') return true;
    if (cat === 'india') return q.region === 'india' || q.category === 'gk';
    return q.category === cat;
  });
  if (cfg.difficulty !== 'mixed') pool = pool.filter((q) => q.difficulty === cfg.difficulty);
  if (!pool.length) pool = [...SEED_QUESTIONS];
  const region = cfg.focus === 'india' || cfg.region === 'india' ? 'india' : cfg.region || 'global';
  const isTagged = (q: Question) => region !== 'global' && (q.region === region || (q.region === 'india' && region !== 'india'));
  const seen = new Set(recentIds());
  const fresh = pool.filter((q) => !seen.has(q.id));
  const freshOrdered = [...shuffle(fresh.filter(isTagged)), ...shuffle(fresh.filter((q) => !isTagged(q)))];
  const base = fresh.length >= Math.min(cfg.count, pool.length) ? freshOrdered : shuffle(pool);
  let out = shuffle(base);
  while (out.length < cfg.count) { out = [...out, ...shuffle(base)] }
  out = out.slice(0, cfg.count).map((q) => ({ ...q, id: q.id + `#${n++}` }));
  rememberIds(out.map((q) => q.id.split('#')[0]));
  if (cfg.randomizeA !== false) {
    out = out.map((q) => {
      const order = shuffle(q.options.map((_, i) => i));
      const opts = order.map((i) => q.options[i]);
      return { ...q, options: opts, correctAnswer: order.indexOf(q.correctAnswer) };
    });
  }
  const qt = cfg.questionType || 'mcq';
  if (qt === 'tf') out = out.map((q, i) => toTF(q, i));
  else if (qt === 'mixed') out = out.map((q, i) => (i % 2 === 1 ? toTF(q, i) : q));
  const lang = cfg.language || 'en';
  out = out.map((q) => ({ ...q, language: lang === 'en' ? 'en' : lang === 'ta' ? 'ta' : q.language || 'en' }));
  return out;
}
function coerceIndex(v: unknown): number {
  if (typeof v === 'number' && v >= 0 && v <= 3) return v;
  if (typeof v === 'number' && v >= 1 && v <= 4) return v - 1;
  if (typeof v === 'string') { const t = v.trim().toUpperCase(); const li = 'ABCD'.indexOf(t); if (li >= 0) return li; const num = parseInt(t, 10); if (num >= 1 && num <= 4) return num - 1 }
  return -1;
}
function normalize(raw: unknown, cat: string, maxIdx = 3): Question | null {
  if (!raw || typeof raw !== 'object') return null; const o = raw as Record<string, unknown>;
  const options = Array.isArray(o.options) ? o.options.map(String) : [];
  if (options.length !== 4 && options.length !== 2) return null;
  const correct = coerceIndex(o.correctAnswer ?? o.answer ?? o.correct);
  if (correct < 0 || correct > options.length - 1) return null;
  if (maxIdx === 1 && options.length !== 2) return null;
  if (maxIdx === 3 && options.length !== 4 && options.length !== 2) return null;
  const diff = String(o.difficulty || 'medium').toLowerCase();
  return {
    id: `ai-${Date.now()}-${n++}`, category: cat, difficulty: (['easy', 'medium', 'hard'].includes(diff) ? diff : 'medium') as Question['difficulty'],
    question: String(o.question || '').trim(), options, correctAnswer: correct,
    explanation: String(o.explanation || ''), language: o.language ? String(o.language) : undefined,
  };
}
function endpoint(): string {
  return ((import.meta as unknown as { env: Record<string, string | undefined> }).env.VITE_AI_ENDPOINT || '').trim().replace(/\/$/, '');
}
export function aiBackendConfigured(): boolean {
  return endpoint().length > 0;
}
export async function aiBackendHealth(): Promise<'on' | 'off' | 'unknown'> {
  const base = endpoint();
  if (!base) return 'unknown';
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const res = await fetch(`${base}/api/health`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return 'off';
    const data = await res.json();
    return data?.ai ? 'on' : 'off';
  } catch {
    return 'off';
  }
}
export async function generateQuestions(cfg: QuizConfig): Promise<{ questions: Question[]; source: 'ai' | 'demo' }> {
  const wantType = cfg.questionType || 'mcq';
  const maxIdx = wantType === 'tf' ? 1 : 3;
  const base = endpoint();
  if (base) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 30000);
      const res = await fetch(`${base}/api/questions`, {
        method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: cfg.category, count: Math.min(40, Math.max(3, cfg.count)),
          difficulty: cfg.difficulty, region: cfg.focus === 'india' ? 'india' : cfg.region || 'global',
          language: cfg.language || 'en', questionType: wantType,
          customTopic: (cfg.customTopic || '').slice(0, 80), focus: cfg.focus || 'global',
        }),
      });
      clearTimeout(t);
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.questions;
        if (Array.isArray(arr)) {
          const out = arr.map((r: unknown) => normalize(r, cfg.category, maxIdx)).filter((q): q is Question => !!q && validateQuestion(q)).slice(0, cfg.count);
          if (out.length >= Math.min(3, cfg.count)) return { questions: out, source: 'ai' };
        }
        console.error('[quizrush] AI endpoint returned too few valid questions');
      } else {
        try {
          console.error('[quizrush] AI endpoint error:', await res.text());
        } catch { /* ignore */ }
      }
    } catch { /* fall through to bank */ }
  }
  await new Promise((r) => setTimeout(r, 600));
  return { questions: fallbackQuestions(cfg), source: 'demo' };
}
