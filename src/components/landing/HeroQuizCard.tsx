import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Timer, Check, Flame } from 'lucide-react';

const DEMO = [
  { q: 'Which planet is known as the Red Planet?', opts: ['Earth', 'Mars', 'Jupiter', 'Venus'], a: 1 },
  { q: 'What gas do plants absorb for photosynthesis?', opts: ['Oxygen', 'Carbon dioxide', 'Hydrogen', 'Nitrogen'], a: 1 },
  { q: 'How many days are in a leap year?', opts: ['365', '364', '366', '367'], a: 2 },
];

const DOTS = [
  { e: '🧪', c: '#2E9BFF' },
  { e: '🏆', c: '#FFB020' },
  { e: '🎬', c: '#FF7BAC' },
];

export default function HeroQuizCard() {
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [left, setLeft] = useState(10);
  const [score, setScore] = useState(860);
  const [streak, setStreak] = useState(3);
  const reduce = useReducedMotion();
  const cur = DEMO[qi];

  useEffect(() => {
    if (reduce) { setPick(cur.a); return; }
    setPick(null);
    setLeft(10);
    const reveal = setTimeout(() => {
      setPick(cur.a);
      setScore((s) => s + 120);
      setStreak((s) => s + 1);
    }, 2600);
    const next = setTimeout(() => setQi((q) => (q + 1) % DEMO.length), 4600);
    return () => { clearTimeout(reveal); clearTimeout(next); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, reduce]);

  useEffect(() => {
    if (reduce) return;
    if (pick !== null) return;
    if (left <= 0) return;
    const iv = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(iv);
  }, [left, pick, reduce]);

  function choose(i: number) {
    if (pick !== null) return;
    setPick(i);
    if (i === cur.a) {
      setScore((s) => s + Math.max(40, left * 12));
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
  }

  return (
    <div className="relative mx-auto w-full min-w-0 max-w-[480px]">
      <div aria-hidden className="absolute -inset-4 rounded-[36px] opacity-70 blur-2xl" style={{ background: 'linear-gradient(135deg,#FFE3D3,#E9E2FF,#D6EBFF)' }} />
      <div className="relative min-w-0 overflow-hidden rounded-[24px] bg-white shadow-soft sm:rounded-[28px]" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
        <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#FFF1E8] via-[#F1EBFF] to-[#E8F4FF] px-4 py-3 sm:px-5">
          <span className="rounded-full bg-ink px-3 py-1.5 text-[10px] font-extrabold tracking-widest text-white sm:text-[11px]">QUICK PLAY · TRY IT</span>
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[14px] font-semibold ${left <= 3 && pick === null ? 'bg-[#FF4B5C] text-white' : 'bg-white text-ink shadow-sticker-sm'}`}>
            <Timer size={14} className={left <= 3 && pick === null ? '' : 'text-coral'} /> 0{Math.max(0, left)}
          </span>
        </div>
        <div className="min-w-0 p-4 sm:p-6">
          <div className="h-2 overflow-hidden rounded-full bg-[#F1EDFF]">
            <div className="h-full rounded-full bg-gradient-to-r from-coral via-[#FF3D77] to-grape transition-all duration-500" style={{ width: `${(Math.max(0, left) / 10) * 100}%` }} />
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={qi} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <p className="font-display mt-4 min-h-[56px] text-balance break-words text-[19px] font-medium leading-snug text-ink sm:text-[21px]">{cur.q}</p>
              <div className="mt-3 grid min-w-0 gap-2">
                {cur.opts.map((o, i) => {
                  const ok = pick !== null && i === cur.a;
                  const bad = pick !== null && pick === i && i !== cur.a;
                  const dim = pick !== null && i !== cur.a && i !== pick;
                  return (
                    <button key={o} onClick={() => choose(i)} disabled={pick !== null}
                      className={`flex min-w-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-left text-[13.5px] font-bold transition-all sm:text-[14px] ${ok ? 'bg-[#E7F9E5] text-[#1E7A38]' : bad ? 'bg-[#FFE9E9] text-[#C62828]' : dim ? 'bg-[#F8F9FF] text-muted' : 'bg-[#F8F9FF] text-ink hover:bg-[#F1EBFF]'}`}
                      style={ok ? { border: '1.5px solid #58CC02' } : bad ? { border: '1.5px solid #FF4B5C' } : { border: '1.5px solid transparent' }}>
                      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-[12px] font-extrabold ${ok ? 'bg-[#58CC02] text-white' : bad ? 'bg-[#FF4B5C] text-white' : 'bg-white text-muted shadow-sticker-sm'}`}>{'ABCD'[i]}</span>
                      <span className="min-w-0 flex-1 break-words">{o}</span>
                      {ok && <Check size={16} className="ml-auto shrink-0" strokeWidth={3} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3.5" style={{ borderColor: 'rgba(120,100,180,0.08)' }}>
            <span className="flex items-center gap-1.5 rounded-full bg-[#FFF6E3] px-3 py-1.5 text-[13px] font-extrabold text-[#B97A00]"><Flame size={14} /> Streak ×{streak}</span>
            <AnimatePresence mode="popLayout">
              <motion.span key={score} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-lg font-semibold text-ink">{score.toLocaleString()} pts</motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {!reduce && DOTS.map((d, i) => (
        <motion.span key={d.e} aria-hidden animate={{ y: [0, -9, 0] }} transition={{ duration: 3.6 + i * 0.5, repeat: Infinity, delay: i * 0.6 }}
          className="absolute grid h-11 w-11 place-items-center rounded-2xl bg-white text-lg shadow-soft"
          style={{ border: '1px solid rgba(120,100,180,0.08)', ...(i === 0 ? { left: -10, top: 56 } : i === 1 ? { right: -8, top: '38%' } : { left: 32, bottom: -16 }) }}>{d.e}</motion.span>
      ))}
    </div>
  );
}
