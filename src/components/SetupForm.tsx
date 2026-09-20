import {
  BookOpen, Brain, Check, Cpu, Clapperboard, Crosshair, Flag, FlaskConical, Gamepad2, Gauge, Globe,
  Hash, Landmark, Languages, LayoutGrid, ListChecks, MapPin, Minus, Music, PawPrint, Plus, Rocket,
  Shuffle, Sigma, SlidersHorizontal, Smile, Sparkles, Timer, ToggleLeft, Flower, Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { Difficulty, JlptLevel, QuestionType, QuizConfig, QuizFocus, QuizLanguage } from '../types';
import { CATEGORIES } from '../data/categories';
import { sound } from '../services/engine';

const SOFT = { border: '1px solid rgba(120,100,180,0.10)' } as const;
export const ALLOWED_TIMERS = [0, 10, 20, 30, 60] as const;
export const ALLOWED_CATEGORIES = [
  'mixed', 'sports', 'science', 'history', 'tech', 'movies',
  'music', 'gaming', 'geography', 'gk', 'maths', 'literature',
  'animals', 'space', 'kids', 'tamil', 'india', 'world', 'japanese', 'custom',
] as const;
export const JLPT_LEVELS: { id: JlptLevel; label: string; sub: string }[] = [
  { id: 'N5', label: 'N5', sub: 'Beginner' },
  { id: 'N4', label: 'N4', sub: 'Elementary' },
  { id: 'N3', label: 'N3', sub: 'Intermediate' },
  { id: 'N2', label: 'N2', sub: 'Advanced' },
  { id: 'N1', label: 'N1', sub: 'Master' },
];
export function sanitizeJlpt(v: unknown): JlptLevel {
  const s = String(v || 'N5').toUpperCase();
  return (['N5', 'N4', 'N3', 'N2', 'N1'] as const).includes(s as JlptLevel) ? (s as JlptLevel) : 'N5';
}

/* Render-safe glyphs (no flag emoji — Windows shows them as "IN"/"GB" text). */
const ICONS: Record<string, string> = { Trophy: '🏆', Landmark: '🏛️', FlaskConical: '🧪', Globe: '🌍', Cpu: '💻', Clapperboard: '🎬', Music: '🎵', Smile: '😊', Languages: 'த', Brain: '🧠', Sigma: '∑', BookOpen: '📚', PawPrint: '🐾', Rocket: '🚀', Gamepad2: '🎮', Flag: '🌐', Torii: '⛩️' };
export function iconFor(icon: string) { return ICONS[icon] ?? '🎯'; }
export function isAllowedCategory(c: unknown): boolean {
  return typeof c === 'string' && (ALLOWED_CATEGORIES as readonly string[]).includes(c);
}
export function sanitizeTimer(t: unknown, allowZero = true): number {
  const n = Number(t);
  if (allowZero && n === 0) return 0;
  return ([10, 20, 30, 60] as number[]).includes(n) ? n : 10;
}
export function sanitizeCount(n: unknown): number {
  const v = Number(n);
  if (!Number.isFinite(v)) return 10;
  return Math.min(40, Math.max(3, Math.round(v)));
}
export function categoryLabel(id: string): string {
  if (id === 'custom') return 'Custom Topic';
  return CATEGORIES.find((c) => c.id === id)?.name ?? 'Mixed';
}

const TOPIC_ICONS: Record<string, LucideIcon> = {
  Brain, Trophy, Landmark, FlaskConical, Globe, Cpu, Clapperboard, Music,
  Smile, Flag, Languages, Sigma, BookOpen, PawPrint, Rocket, Gamepad2, Torii: Flower,
};
const GRADS = [
  'linear-gradient(135deg,#2E9BFF,#2563EB)',
  'linear-gradient(135deg,#7C5CFF,#5B3DF0)',
  'linear-gradient(135deg,#00C48C,#059669)',
  'linear-gradient(135deg,#FB7185,#E11D48)',
  'linear-gradient(135deg,#FFB020,#F97316)',
  'linear-gradient(135deg,#22D3EE,#2563EB)',
  'linear-gradient(135deg,#A78BFA,#7C3AED)',
  'linear-gradient(135deg,#F472B6,#DB2277)',
  'linear-gradient(135deg,#34D399,#0EA5E9)',
  'linear-gradient(135deg,#FBBF24,#F43F5E)',
];
const TOPIC_ORDER = (ALLOWED_CATEGORIES as readonly string[]).filter((id) => id !== 'custom');

const LANGS: { id: QuizLanguage; label: string; sub: string }[] = [
  { id: 'en', label: 'English', sub: 'EN' },
  { id: 'ta', label: 'தமிழ்', sub: 'TA' },
  { id: 'both', label: 'Both', sub: 'EN+TA' },
];
const QUICK_COUNTS = [5, 10, 15, 20, 25];
const DIFFS: { id: Difficulty; label: string; sub: string; dot: string }[] = [
  { id: 'easy', label: 'Easy', sub: 'Warm up', dot: '#58CC02' },
  { id: 'medium', label: 'Medium', sub: 'Fair fight', dot: '#FFB020' },
  { id: 'hard', label: 'Hard', sub: 'Brain burner', dot: '#FF4B5C' },
  { id: 'mixed', label: 'Mixed', sub: 'Surprise mix', dot: 'linear-gradient(135deg,#2E9BFF,#7C5CFF)' },
];
const QTYPES: { id: QuestionType; label: string; icon: LucideIcon }[] = [
  { id: 'mcq', label: 'Multiple choice', icon: ListChecks },
  { id: 'tf', label: 'True / False', icon: ToggleLeft },
  { id: 'mixed', label: 'Mixed', icon: Shuffle },
];
const FOCUS: { id: QuizFocus; label: string; icon: LucideIcon }[] = [
  { id: 'global', label: 'Global', icon: Globe },
  { id: 'india', label: 'India', icon: MapPin },
  { id: 'topic', label: 'Topic-only', icon: Crosshair },
];

function Step({ n, icon: Icon, title, hint, children }: { n: string; icon: LucideIcon; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[22px] bg-white p-4 shadow-sticker-sm sm:p-5" style={SOFT}>
      <header className="mb-3 flex items-center gap-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink text-[13px] font-extrabold text-white">{n}</span>
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#F1EBFF] text-grape"><Icon size={16} /></span>
        <h2 className="font-display text-[17px] font-semibold tracking-tight text-ink">{title}</h2>
        {hint && <span className="ml-auto hidden text-[11.5px] font-bold text-faint min-[420px]:block">{hint}</span>}
      </header>
      {children}
    </section>
  );
}

function Seg<T extends string | number>({ options, value, onPick, cols }: {
  options: { id: T; label: React.ReactNode; sub?: string }[];
  value: T;
  onPick: (id: T) => void;
  cols?: string;
}) {
  return (
    <div className={`grid gap-1 rounded-2xl bg-[#F3F0FF] p-1 ${cols ?? 'grid-cols-3'}`} role="group">
      {options.map((o) => {
        const on = o.id === value;
        return (
          <button key={String(o.id)} onClick={() => onPick(o.id)} aria-pressed={on}
            className={`btn-press min-w-0 rounded-xl px-2 py-2.5 text-center transition-all ${on ? 'bg-white text-ink shadow-sticker-sm' : 'text-muted hover:text-ink'}`}>
            <span className="block truncate text-[13px] font-extrabold">{o.label}</span>
            {o.sub && <span className={`mt-0.5 block text-[10px] font-bold tracking-wider ${on ? 'text-grape' : 'text-faint'}`}>{o.sub}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default function SetupForm({ value, onChange }: { value: QuizConfig; onChange: (c: QuizConfig) => void }) {
  const set = (p: Partial<QuizConfig>) => { sound.play('click'); onChange({ ...value, ...p }); };
  const applyFocus = (f: QuizFocus) => {
    if (f === 'india') set({ focus: f, region: 'india' });
    else set({ focus: f, region: 'global' });
  };
  const bump = (d: number) => set({ count: sanitizeCount(value.count + d) });
  const qtype = QTYPES.find((q) => q.id === (value.questionType || 'mcq'))!;
  const focusLabel = FOCUS.find((f) => f.id === (value.focus || 'global'))!.label;

  return (
    <div className="flex flex-col gap-4">
      <Step n="01" icon={LayoutGrid} title="Pick a topic" hint={`${TOPIC_ORDER.length + 1} playgrounds`}>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {TOPIC_ORDER.map((id, i) => {
            const cat = CATEGORIES.find((c) => c.id === id)!;
            const Icon = TOPIC_ICONS[cat.icon] ?? Brain;
            const grad = GRADS[i % GRADS.length];
            const on = value.category === id;
            return (
              <button key={id} onClick={() => set({ category: id })} aria-pressed={on}
                className="btn-press group relative min-w-0 overflow-hidden rounded-2xl p-2.5 text-left transition-all"
                style={on
                  ? { background: grad, boxShadow: '0 14px 28px -12px rgba(80,60,120,0.5)' }
                  : { background: '#fff', ...SOFT }}>
                {on && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white/95 text-ink"><Check size={12} strokeWidth={4} /></span>}
                <span className="grid h-9 w-9 place-items-center rounded-xl text-white" style={{ background: on ? 'rgba(255,255,255,0.22)' : grad }}>
                  <Icon size={18} />
                </span>
                <span className={`mt-1.5 block truncate text-[12.5px] font-extrabold ${on ? 'text-white' : 'text-ink'}`}>{cat.name}</span>
                <span className={`block text-[10.5px] font-bold ${on ? 'text-white/80' : 'text-faint'}`}>{cat.count} Qs</span>
              </button>
            );
          })}
          <button onClick={() => set({ category: 'custom' })} aria-pressed={value.category === 'custom'}
            className="btn-press relative min-w-0 overflow-hidden rounded-2xl p-2.5 text-left transition-all"
            style={value.category === 'custom'
              ? { background: 'linear-gradient(135deg,#211D2E,#4A3F75)', boxShadow: '0 14px 28px -12px rgba(33,29,46,0.6)' }
              : { background: '#fff', ...SOFT, borderStyle: 'dashed' }}>
            {value.category === 'custom' && <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-white/95 text-ink"><Check size={12} strokeWidth={4} /></span>}
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-grape/15 text-grape" style={value.category === 'custom' ? { background: 'rgba(255,255,255,0.22)', color: '#fff' } : undefined}>
              <Sparkles size={18} />
            </span>
            <span className={`mt-1.5 block truncate text-[12.5px] font-extrabold ${value.category === 'custom' ? 'text-white' : 'text-ink'}`}>Custom</span>
            <span className={`block text-[10.5px] font-bold ${value.category === 'custom' ? 'text-white/80' : 'text-faint'}`}>AI-made</span>
          </button>
        </div>
        {value.category === 'custom' && (
          <input
            value={value.customTopic || ''} onChange={(e) => onChange({ ...value, customTopic: e.target.value.slice(0, 80) })}
            placeholder="e.g. Chola dynasty, Chandrayaan, IPL…" maxLength={80} autoFocus
            className="mt-2.5 w-full rounded-2xl bg-[#F8F9FF] px-4 py-3.5 text-[14px] font-bold text-ink outline-none placeholder:text-faint focus:bg-white"
            style={{ ...SOFT, borderWidth: 1.5 }}
          />
        )}
      </Step>

      {value.category === 'japanese' && (
        <Step n="01+" icon={Flower} title="JLPT level" hint="Japanese test prep">
          <Seg cols="grid-cols-5"
            options={JLPT_LEVELS.map((l) => ({ id: l.id, label: l.label, sub: l.sub }))}
            value={value.jlptLevel || 'N5'} onPick={(id) => set({ jlptLevel: id })} />
        </Step>
      )}

      <Step n="02" icon={Languages} title="Language">
        <Seg options={LANGS} value={value.language || 'en'} onPick={(id) => set({ language: id })} />
      </Step>

      <Step n="03" icon={Hash} title="Questions" hint="3 – 40">
        <div className="flex items-center gap-2 rounded-2xl bg-[#F3F0FF] p-1.5">
          <button onClick={() => bump(-1)} disabled={value.count <= 3} aria-label="Fewer questions"
            className="btn-press grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-ink shadow-sticker-sm disabled:opacity-40">
            <Minus size={17} strokeWidth={3} />
          </button>
          <div className="min-w-0 flex-1 text-center">
            <span className="font-display font-num text-[26px] font-semibold leading-none text-ink">{value.count}</span>
            <span className="block text-[10.5px] font-extrabold tracking-[0.14em] text-muted">QUESTIONS</span>
          </div>
          <button onClick={() => bump(1)} disabled={value.count >= 40} aria-label="More questions"
            className="btn-press grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-ink text-white shadow-sticker-sm disabled:opacity-40">
            <Plus size={17} strokeWidth={3} />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {QUICK_COUNTS.map((n) => (
            <button key={n} onClick={() => set({ count: n })} aria-pressed={value.count === n}
              className={`btn-press rounded-full px-4 py-1.5 font-num text-[12.5px] font-extrabold transition-all ${value.count === n ? 'bg-ink text-white' : 'bg-[#F3F0FF] text-muted hover:text-ink'}`}>
              {n}
            </button>
          ))}
        </div>
      </Step>

      <Step n="04" icon={Gauge} title="Difficulty">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DIFFS.map((d) => {
            const on = value.difficulty === d.id;
            return (
              <button key={d.id} onClick={() => set({ difficulty: d.id as Difficulty })} aria-pressed={on}
                className="btn-press min-w-0 rounded-2xl p-3 text-left transition-all"
                style={on ? { background: '#F1EBFF', border: '1.5px solid #7C5CFF' } : { background: '#fff', ...SOFT }}>
                <span className="block h-2.5 w-2.5 rounded-full" style={{ background: d.dot }} />
                <span className="mt-2 block text-[13.5px] font-extrabold text-ink">{d.label}</span>
                <span className="block truncate text-[11px] font-bold text-muted">{d.sub}</span>
              </button>
            );
          })}
        </div>
      </Step>

      <details className="group rounded-[22px] bg-white shadow-sticker-sm" style={SOFT}>
        <summary className="flex cursor-pointer list-none items-center gap-2.5 p-4 sm:px-5 [&::-webkit-details-marker]:hidden">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#F1EBFF] text-grape"><SlidersHorizontal size={16} /></span>
          <span className="font-display text-[17px] font-semibold tracking-tight text-ink">Fine-tune</span>
          <span className="ml-auto truncate text-[12px] font-bold text-faint">{qtype.label} · {value.timer > 0 ? `${value.timer}s` : 'No timer'} · {focusLabel}</span>
        </summary>
        <div className="flex flex-col gap-4 px-4 pb-4 sm:px-5 sm:pb-5">
          <div>
            <div className="mb-1.5 text-[11px] font-extrabold tracking-[0.14em] text-muted">FORMAT</div>
            <Seg options={QTYPES.map((q) => ({ id: q.id, label: <span className="inline-flex items-center gap-1.5"><q.icon size={14} />{q.label}</span> }))} value={value.questionType || 'mcq'} onPick={(id) => set({ questionType: id })} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-extrabold tracking-[0.14em] text-muted"><Timer size={12} /> TIME PER QUESTION</div>
            <Seg cols="grid-cols-5"
              options={[...ALLOWED_TIMERS].map((t) => ({ id: t, label: t === 0 ? 'Off' : `${t}s` }))}
              value={value.timer} onPick={(id) => set({ timer: id })} />
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-extrabold tracking-[0.14em] text-muted">QUESTION FOCUS</div>
            <Seg options={FOCUS.map((f) => ({ id: f.id, label: <span className="inline-flex items-center gap-1.5"><f.icon size={14} />{f.label}</span> }))} value={value.focus || 'global'} onPick={applyFocus} />
          </div>
        </div>
      </details>
    </div>
  );
}
