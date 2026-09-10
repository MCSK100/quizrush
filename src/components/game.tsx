import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { fmt } from '../services/engine';
export function TimerRing({ left, total }: { left: number; total: number }) {
  const safeTotal = Number(total) > 0 ? Number(total) : 1;
  const safeLeft = Number.isFinite(left) ? Math.max(0, Math.min(left, safeTotal)) : safeTotal;
  const pct = Math.max(0, Math.min(1, safeLeft / safeTotal));
  const R = 34;
  const C = 2 * Math.PI * R;
  const crit = safeLeft <= 3;
  const warn = safeLeft <= Math.max(5, safeTotal * 0.3);
  const col = crit ? '#FF4B5C' : warn ? '#FFB020' : '#7C5CFF';
  return (
    <div className="relative h-24 w-24" role="timer" aria-label={`${Math.ceil(safeLeft)} seconds left`}>
      <div aria-hidden className="absolute -inset-3 rounded-full opacity-30 blur-xl" style={{ background: col }} />
      <svg viewBox="0 0 84 84" className="relative h-full w-full -rotate-90">
        <circle cx="42" cy="42" r={R} fill="#FFFFFF" stroke="#F1EDFF" strokeWidth="8" />
        <circle cx="42" cy="42" r={R} fill="none" stroke={col} strokeWidth="8" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - pct)} style={{ transition: 'stroke-dashoffset .12s linear, stroke .3s' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-num text-3xl font-extrabold text-ink">{Math.ceil(safeLeft)}</span>
      </div>
    </div>
  );
}
export function ScoreTicker({ score }: { score: number }) {
  return (
    <motion.div key={score} initial={{ scale: 1.25, color: '#2E9BFF' }} animate={{ scale: 1, color: '#211D2E' }} className="font-num text-xl font-extrabold" aria-live="polite">
      {fmt(score)}
    </motion.div>
  );
}
export function Countdown({ n }: { n: number | string }) {
  return (
    <motion.div key={String(n)} initial={{ scale: 2.2, opacity: 0, rotate: -4 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0 }} className="font-display qr-gradient-text text-8xl">
      {n}
    </motion.div>
  );
}
export function AnswerButton({ label, text, state, disabled, onPick, index, image }: { label: string; text: string; state: 'idle' | 'correct' | 'wrong' | 'dim' | 'picked'; disabled: boolean; onPick: () => void; index: number; image?: string }) {
  const wrap =
    state === 'correct'
      ? { background: '#E7F9E5', border: '1.5px solid #58CC02', boxShadow: '0 12px 28px -12px rgba(88,204,2,0.5)' }
      : state === 'wrong'
        ? { background: '#FFE9E9', border: '1.5px solid #FF4B5C' }
        : state === 'picked'
          ? { background: '#EFE9FF', border: '1.5px solid #7C5CFF', boxShadow: '0 12px 28px -14px rgba(124,92,255,0.6)' }
          : state === 'dim'
            ? { background: '#F8F9FF', border: '1.5px solid transparent', opacity: 0.55 }
            : { background: '#F8F9FF', border: '1.5px solid transparent' };
  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      disabled={disabled}
      onClick={onPick}
      aria-label={`Answer ${label}: ${text}`}
      style={wrap as React.CSSProperties}
      className="btn-press group flex min-h-[64px] w-full items-center gap-3 overflow-hidden rounded-2xl px-3 py-2.5 text-left font-bold text-ink hover:bg-[#F1EBFF]"
    >
      {image && (
        <img src={image} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-xl bg-white object-cover" style={{ border: '1px solid rgba(120,100,180,0.10)' }} />
      )}
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl font-num text-sm font-extrabold ${state === 'correct' ? 'bg-[#58CC02] text-white' : state === 'wrong' ? 'bg-[#FF4B5C] text-white' : state === 'picked' ? 'bg-grape text-white' : 'bg-white text-muted shadow-sticker-sm'}`}>
        {state === 'correct' ? <Check size={16} strokeWidth={4} /> : state === 'wrong' ? <X size={16} strokeWidth={4} /> : state === 'picked' ? <Check size={16} strokeWidth={4} /> : label}
      </span>
      <span className="flex-1 break-words">{text}</span>
    </motion.button>
  );
}
export function ProgressBar({ i, total }: { i: number; total: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#F1EDFF]" role="progressbar" aria-valuenow={i} aria-valuemax={total}>
      <motion.div className="h-full rounded-full" animate={{ width: `${(i / total) * 100}%` }} style={{ backgroundImage: 'linear-gradient(90deg,#2E9BFF,#7C5CFF)' }} />
    </div>
  );
}
