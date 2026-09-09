import type { Question, QuizConfig } from '../types';
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
export async function generateQuestions(cfg: QuizConfig): Promise<{ questions: Question[]; source: 'ai'; provider: string }> {
  const wantType = cfg.questionType || 'mcq';
  const maxIdx = wantType === 'tf' ? 1 : 3;
  const base = endpoint();
  if (!base) throw new AiError('setup', aiErrorMessage('setup'));
  const count = Math.min(40, Math.max(3, cfg.count));
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
      }),
    });
    clearTimeout(t);
  } catch {
    throw new AiError('failed', aiErrorMessage('failed'));
  }
  if (!res.ok) {
    let detail = '';
    try { detail = JSON.stringify(await res.json()); } catch { /* ignore */ }
    console.error('[quizlly] AI endpoint error:', res.status, detail);
    if (res.status === 429) throw new AiError('quota', aiErrorMessage('quota'));
    if (res.status === 503) throw new AiError('setup', aiErrorMessage('setup'));
    throw new AiError('failed', aiErrorMessage('failed'));
  }
  const data = await res.json();
  const arr = Array.isArray(data) ? data : data.questions;
  const provider = !Array.isArray(data) && typeof data?.provider === 'string' ? data.provider : 'ai';
  if (!Array.isArray(arr)) {
    console.error('[quizlly] AI endpoint returned no question list');
    throw new AiError('failed', aiErrorMessage('failed'));
  }
  const banned = new Set([...recentTexts(), ...sessionTexts()]);
  const all = arr
    .map((r: unknown) => normalize(r, cfg.category, maxIdx))
    .filter((q): q is Question => !!q && validateQuestion(q));
  const fresh = dedupeFresh(all.filter((q) => !banned.has(qKey(q))));
  const out = (fresh.length >= Math.min(3, count) ? fresh : dedupeFresh(all)).slice(0, count);
  if (out.length < Math.min(3, count)) {
    console.error('[quizlly] AI endpoint returned too few valid questions');
    throw new AiError('failed', aiErrorMessage('failed'));
  }
  rememberQuestions(out);
  console.log(`[quizlly] ${out.length} questions via ${provider} · ${cfg.category}/${cfg.difficulty}/${wantType}/${cfg.language || 'en'}`);
  return { questions: out, source: 'ai', provider };
}
