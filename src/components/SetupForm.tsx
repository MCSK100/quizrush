import { CATEGORIES } from '../data/categories';
import { REGIONS, INDIAN_STATES } from '../data/regions';
import type { Difficulty, QuizConfig } from '../types';
import { sound } from '../services/engine';
const COUNTS = [10, 20, 30, 40]; const TIMERS = [10, 30, 60]; const DIFFS: ['easy', 'medium', 'hard', 'mixed'] = ['easy', 'medium', 'hard', 'mixed'];
const ICONS: Record<string, string> = { 'Trophy': '🏆', 'Landmark': '🏛️', 'FlaskConical': '🧪', 'Globe': '🌍', 'Cpu': '💻', 'Clapperboard': '🎬', 'Music': '🎵', 'Smile': '😊', 'Languages': 'த', 'Brain': '🧠', 'Sigma': '∑', 'BookOpen': '📚', 'PawPrint': '🐾', 'Rocket': '🚀', 'Gamepad2': '🎮', 'Flag': '🌐' };
export function iconFor(icon: string) { return ICONS[icon] ?? '🎯' }
const SOFT = { border: '1px solid rgba(120,100,180,0.08)' } as const;
export default function SetupForm({ value, onChange }: { value: QuizConfig; onChange: (c: QuizConfig) => void }) {
  const set = (p: Partial<QuizConfig>) => { sound.play('click'); onChange({ ...value, ...p }) };
  return (<div className="flex flex-col gap-6">
    <div><div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-muted">CATEGORY</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[{ id: 'mixed', name: 'Mixed', slug: 'mixed', description: '', icon: 'Brain', count: 0 } as never, ...CATEGORIES].map(c => {
          const cat = c as { id: string; name: string; icon: string }; const act = value.category === cat.id;
          return (<button key={cat.id} onClick={() => set({ category: cat.id })} aria-pressed={act}
            className={`btn-press rounded-2xl px-2 py-3 text-center transition-all ${act ? 'bg-[#FFF1E8] text-ink shadow-soft' : 'bg-white/80 hover:bg-white'}`}
            style={{ border: act ? '1px solid rgba(255,107,74,0.45)' : SOFT.border }}>
            <div className="text-2xl">{cat.id === 'mixed' ? '🎲' : iconFor(cat.icon)}</div><div className="mt-1 text-xs font-extrabold">{cat.name.toUpperCase()}</div></button>)
        })}
      </div></div>
    <div><div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-muted">REGION</div>
      <div className="grid grid-cols-2 gap-2">
        {REGIONS.map((r) => {
          const act = (value.region || 'global') === r.id;
          return (<button key={r.id} onClick={() => set({ region: r.id })} aria-pressed={act}
            className={`btn-press rounded-2xl px-2 py-3 text-center transition-all ${act ? 'bg-[#FFF1E8] text-ink shadow-soft' : 'bg-white/80 hover:bg-white'}`}
            style={{ border: act ? '1px solid rgba(255,107,74,0.45)' : SOFT.border }}>
            <div className="text-2xl">{r.icon}</div><div className="mt-1 text-xs font-extrabold">{r.name.toUpperCase()}</div></button>);
        })}
      </div>
      {(value.region || 'global') !== 'global' && (
        <div className="mt-2 flex flex-wrap gap-2">
          {[{ id: 'india', name: 'All India' }, ...INDIAN_STATES].map((s) => {
            const act = (value.region || 'india') === s.id;
            return (<button key={s.id} onClick={() => set({ region: s.id })} aria-pressed={act}
              className={`btn-press rounded-full px-4 py-2 text-xs font-extrabold transition-all ${act ? 'qr-btn-primary' : 'bg-white/80 text-ink hover:bg-white'}`}
              style={act ? undefined : SOFT}>{s.id === 'india' ? 'ALL INDIA' : s.name.toUpperCase()}</button>);
          })}
        </div>
      )}</div>
    <div><div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-muted">QUESTIONS</div>
      <div className="grid grid-cols-4 gap-2">{COUNTS.map(n => <button key={n} onClick={() => set({ count: n })} aria-pressed={value.count === n}
        className={`btn-press rounded-2xl py-3 font-num text-sm font-extrabold transition-all ${value.count === n ? 'qr-btn-primary' : 'bg-white/80 text-ink hover:bg-white'}`}
        style={value.count === n ? undefined : SOFT}>{n}</button>)}</div></div>
    <div><div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-muted">TIMER PER QUESTION</div>
      <div className="grid grid-cols-3 gap-2">{TIMERS.map(t => <button key={t} onClick={() => set({ timer: t })} aria-pressed={value.timer === t}
        className={`btn-press rounded-2xl py-3 font-num text-sm font-extrabold transition-all ${value.timer === t ? 'qr-btn-primary' : 'bg-white/80 text-ink hover:bg-white'}`}
        style={value.timer === t ? undefined : SOFT}>{t === 60 ? '1 MIN' : t + ' SEC'}</button>)}</div></div>
    <div><div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-muted">DIFFICULTY</div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{DIFFS.map(d => <button key={d} onClick={() => set({ difficulty: d as Difficulty })} aria-pressed={value.difficulty === d}
        className={`btn-press rounded-2xl py-2.5 text-xs font-extrabold uppercase transition-all ${value.difficulty === d ? 'qr-btn-primary' : 'bg-white/80 text-ink hover:bg-white'}`}
        style={value.difficulty === d ? undefined : SOFT}>{d}</button>)}</div></div>
  </div>);
}
