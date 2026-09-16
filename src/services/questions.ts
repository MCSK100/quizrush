import type { Question, QuizConfig } from '../types';
import { getBackupQuestions } from '../data/bank';
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
export type AiErrorCode = 'quota' | 'setup' | 'failed';
export class AiError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) { super(message); this.code = code; }
}
export function aiErrorMessage(code: AiErrorCode): string {
  if (code === 'quota') return 'AI limit reached — please try again later.';
  if (code === 'setup') return 'AI backend is not connected. Set VITE_AI_ENDPOINT and try again.';
  return 'AI question generation failed. Please try again.';
}
let n = 0;
function qKey(q: { question: string }): string {
  return q.question.toLowerCase().replace(/[^a-z0-9\u0B80-\u0BFF]+/g, ' ').trim().replace(/\s+/g, ' ');
}
function loadKeys(key: string): string[] {
  try {
    const a = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(a) ? a.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}
function recentTexts(): Set<string> { return new Set(loadKeys('qr-recent-text')); }
function sessionTexts(): Set<string> {
  try {
    const a = JSON.parse(sessionStorage.getItem('qr-used-q') || '[]');
    return new Set(Array.isArray(a) ? a.filter((x) => typeof x === 'string') : []);
  } catch {
    return new Set();
  }
}
function rememberQuestions(qs: Question[]) {
  try {
    const texts = qs.map(qKey);
    localStorage.setItem('qr-recent-text', JSON.stringify([...texts, ...loadKeys('qr-recent-text')].slice(0, 300)));
    const used = sessionTexts();
    texts.forEach((t) => used.add(t));
    sessionStorage.setItem('qr-used-q', JSON.stringify([...used].slice(-500)));
  } catch { /* ignore */ }
}
function dedupeFresh<T extends Question>(qs: T[]): T[] {
  const seen = new Set<string>();
  return qs.filter((q) => {
    const k = qKey(q);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
function coerceIndex(v: unknown): number {
  if (typeof v === 'number' && v >= 0 && v <= 3) return v;
  if (typeof v === 'number' && v >= 1 && v <= 4) return v - 1;
  if (typeof v === 'string') { const t = v.trim().toUpperCase(); const li = 'ABCD'.indexOf(t); if (li >= 0) return li; const num = parseInt(t, 10); if (num >= 1 && num <= 4) return num - 1 }
  return -1;
}
function normalize(raw: unknown, cat: string, maxIdx = 3, lang = 'en'): Question | null {
  if (!raw || typeof raw !== 'object') return null; const o = raw as Record<string, unknown>;
  const options = Array.isArray(o.options) ? o.options.map((x) => String(x ?? '').trim()) : [];
  if (options.length !== 4 && options.length !== 2) return null;
  if (options.some((x) => !x || x.length > 140)) return null;
  if (new Set(options.map((s) => s.toLowerCase())).size !== options.length) return null;
  const correct = coerceIndex(o.correctAnswer ?? o.answer ?? o.correct);
  if (correct < 0 || correct > options.length - 1) return null;
  if (maxIdx === 1 && options.length !== 2) return null;
  if (maxIdx === 3 && options.length !== 4 && options.length !== 2) return null;
  const stem = String(o.question || '').trim();
  if (stem.length < 8 || stem.length > 320) return null;
  if (/^(question|q\d+|test|undefined|null)\b/i.test(stem)) return null;
  const diff = String(o.difficulty || 'medium').toLowerCase();
  return {
    id: `ai-${Date.now()}-${n++}`, category: cat, difficulty: (['easy', 'medium', 'hard'].includes(diff) ? diff : 'medium') as Question['difficulty'],
    question: stem, options, correctAnswer: correct,
    explanation: String(o.explanation || '').slice(0, 400), language: ['en', 'ta', 'both'].includes(String(o.language || lang)) ? String(o.language || lang) : lang,
  };
}
function bankFallback(cfg: QuizConfig, count: number, reason: string): { questions: Question[]; source: 'bank'; provider: string } {
  const banned = new Set([...recentTexts(), ...sessionTexts()]);
  const pool = getBackupQuestions(cfg).filter(validateQuestion);
  const fresh = dedupeFresh(pool.filter((q) => !banned.has(qKey(q))));
  const out = (fresh.length >= Math.min(3, count) ? fresh : dedupeFresh(pool)).slice(0, count);
  if (out.length < Math.min(3, count)) throw new AiError('failed', aiErrorMessage('failed'));
  rememberQuestions(out);
  console.log(`[quizlly] ${out.length} backup questions (${reason}) · ${cfg.category}/${cfg.difficulty}/${cfg.questionType || 'mcq'}/${cfg.language || 'en'}`);
  return { questions: out, source: 'bank', provider: 'bank' };
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
export async function generateQuestions(cfg: QuizConfig): Promise<{ questions: Question[]; source: 'ai' | 'bank'; provider: string }> {
  const wantType = cfg.questionType || 'mcq';
  const maxIdx = wantType === 'tf' ? 1 : 3;
  const base = endpoint();
  const count = Math.min(40, Math.max(3, cfg.count));
  // Full chain: Primary AI (backend, which itself tries gemini→openrouter→groq)
  // → local backup pool → graceful error. Never leave the user on a blank screen.
  if (!base) return bankFallback(cfg, count, 'no-backend');
  let res: Response;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 45000);
    res = await fetch(`${base}/api/questions`, {
      method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category: cfg.category, count,
        difficulty: cfg.difficulty, region: cfg.focus === 'india' ? 'india' : cfg.region || 'global',
        language: cfg.language || 'en', questionType: wantType,
        customTopic: (cfg.customTopic || '').slice(0, 80), focus: cfg.focus || 'global',
        jlptLevel: cfg.category === 'japanese' ? (cfg.jlptLevel || 'N5') : undefined,
      }),
    });
    clearTimeout(t);
  } catch (e) {
    console.error('[quizlly] AI request failed, using backup:', e);
    return bankFallback(cfg, count, 'network-timeout');
  }
  if (!res.ok) {
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch { /* ignore */ }
    console.error('[quizlly] AI endpoint error:', res.status, detail);
    // Rate-limited / failing backend still yields a playable quiz via backup.
    return bankFallback(cfg, count, `http-${res.status}`);
  }
  let data: unknown;
  try {
    data = await res.json();
  } catch {
    console.error('[quizlly] AI endpoint returned invalid JSON, using backup');
    return bankFallback(cfg, count, 'bad-json');
  }
  const arr = Array.isArray(data) ? data : (data as { questions?: unknown }).questions;
  const provider = !Array.isArray(data) && data && typeof (data as { provider?: unknown }).provider === 'string' ? String((data as { provider: string }).provider) : 'ai';
  // Backend may already have fallen back to its bank — honor it as AI-success.
  if (provider === 'bank' && Array.isArray(arr)) {
    const bannedB = new Set([...recentTexts(), ...sessionTexts()]);
    const allB = (arr as unknown[])
      .map((r) => normalize(r, cfg.category, maxIdx, cfg.language || 'en'))
      .filter((q): q is Question => !!q && validateQuestion(q));
    const freshB = dedupeFresh(allB.filter((q) => !bannedB.has(qKey(q))));
    const outB = (freshB.length >= Math.min(3, count) ? freshB : dedupeFresh(allB)).slice(0, count);
    if (outB.length >= Math.min(3, count)) {
      rememberQuestions(outB);
      return { questions: outB, source: 'bank', provider: 'bank' };
    }
    return bankFallback(cfg, count, 'bank-too-few');
  }
  if (!Array.isArray(arr)) {
    console.error('[quizlly] AI endpoint returned no question list');
    return bankFallback(cfg, count, 'no-list');
  }
  const banned = new Set([...recentTexts(), ...sessionTexts()]);
  const all = (arr as unknown[])
    .map((r: unknown) => normalize(r, cfg.category, maxIdx, cfg.language || 'en'))
    .filter((q): q is Question => !!q && validateQuestion(q));
  const fresh = dedupeFresh(all.filter((q) => !banned.has(qKey(q))));
  const out = (fresh.length >= Math.min(3, count) ? fresh : dedupeFresh(all)).slice(0, count);
  if (out.length < Math.min(3, count)) {
    console.error('[quizlly] AI endpoint returned too few valid questions');
    return bankFallback(cfg, count, 'too-few-valid');
  }
  rememberQuestions(out);
  console.log(`[quizlly] ${out.length} questions via ${provider} · ${cfg.category}/${cfg.difficulty}/${wantType}/${cfg.language || 'en'}`);
  return { questions: out, source: 'ai', provider };
}
