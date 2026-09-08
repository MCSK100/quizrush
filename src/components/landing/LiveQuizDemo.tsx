import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Timer, Check, Flame } from 'lucide-react';
import { Reveal, SectionHead } from './Sections';

const QS = [
  { q: 'Which planet is known as the Red Planet?', opts: ['Earth', 'Mars', 'Jupiter', 'Venus'], a: 1 },
  { q: 'What does CPU stand for?', opts: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Central Program Unit'], a: 1 },
  { q: 'Which ocean is the largest?', opts: ['Atlantic', 'Indian', 'Pacific', 'Arctic'], a: 2 },
];

export function AnimatedQuestion() {
  const [qi, setQi] = useState(0);
  const [pick, setPick] = useState<number | null>(null);
  const [tick, setTick] = useState(7);
  const [score, setScore] = useState(1240);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) { setPick(QS[qi].a); return; }
    setPick(null); setTick(7);
    const to = setTimeout(() => { setPick(QS[qi].a); setScore((s) => s + 120); }, 1500);
    const iv = setInterval(() => setTick((t) => Math.max(0, t - 1)), 1000);
    const nx = setTimeout(() => setQi((q) => (q + 1) % QS.length), 4400);
    return () => { clearTimeout(to); clearTimeout(nx); clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qi, reduce]);
  const cur = QS[qi];
  return (
    <div className="relative min-w-0 overflow-hidden rounded-[24px] bg-white shadow-soft sm:rounded-[28px]" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
      <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#FFF1E8] via-[#F1EBFF] to-[#E8F4FF] px-4 py-3 sm:px-6 sm:py-3.5">
        <span className="rounded-full bg-ink px-3 py-1.5 text-[10px] font-extrabold tracking-widest text-white sm:text-[11px]">QUESTION {String(qi + 7).padStart(2, '0')} / 20</span>
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[14px] font-semibold sm:text-[15px] ${tick <= 3 ? 'bg-[#FF4B5C] text-white' : 'bg-white text-ink shadow-sticker-sm'}`}>
          <Timer size={15} className={tick <= 3 ? '' : 'text-coral'} /> 0{tick}
        </span>
      </div>
      <div className="min-w-0 p-4 sm:p-7">
        <div className="h-2 overflow-hidden rounded-full bg-[#F1EDFF]">
          <motion.div key={qi + 'bar'} className="h-full rounded-full bg-gradient-to-r from-coral via-[#FF3D77] to-grape"
            initial={{ width: '100%' }} animate={{ width: `${(tick / 7) * 100}%` }} transition={{ duration: 0.6 }} />
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={qi} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.35 }}>
            <p className="font-display mt-4 text-balance break-words text-[19px] font-medium leading-snug text-ink sm:mt-5 sm:text-2xl">{cur.q}</p>
            <div className="mt-4 grid min-w-0 gap-2.5">
              {cur.opts.map((o, i) => {
                const ok = pick !== null && i === cur.a;
                const dim = pick !== null && i !== cur.a;
                return (
                  <div key={o} className={`flex min-w-0 items-center gap-3 rounded-2xl px-3.5 py-3 text-[13.5px] font-bold transition-all sm:px-4 sm:py-3.5 sm:text-[14.5px] ${ok ? 'bg-[#E7F9E5] text-[#1E7A38]' : dim ? 'bg-[#F8F9FF] text-muted' : 'bg-[#F8F9FF] text-ink hover:bg-[#F1EBFF]'}`}
                    style={ok ? { border: '1.5px solid #58CC02' } : { border: '1.5px solid transparent' }}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-[12px] font-extrabold sm:h-8 sm:w-8 sm:text-[13px] ${ok ? 'bg-[#58CC02] text-white' : 'bg-white text-muted shadow-sticker-sm'}`}>{'ABCD'[i]}</span>
                    <span className="min-w-0 flex-1 break-words">{o}</span>
                    {ok && <Check size={17} className="ml-auto shrink-0" strokeWidth={3} />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4" style={{ borderColor: 'rgba(120,100,180,0.08)' }}>
          <span className="flex items-center gap-1.5 rounded-full bg-[#FFF6E3] px-3 py-1.5 text-sm font-extrabold text-[#B97A00]"><Flame size={15} /> Streak ×4</span>
          <AnimatePresence mode="popLayout">
            <motion.span key={score} initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="font-display text-xl font-semibold text-ink">{score.toLocaleString()} pts</motion.span>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function LiveQuizDemo() {
  return (
    <section className="relative overflow-x-clip py-12 sm:py-20">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-8 px-4 sm:px-5 lg:grid-cols-2 lg:gap-10">
        <div>
          <SectionHead eyebrow="LIVE FEEL" title={<>This is what a <span className="qr-gradient-text">race feels like.</span></>} sub="A mini playable demo. Watch the timer burn, the answer lock in, and the score climb." />
          <ul className="mt-6 space-y-3 text-sm font-semibold">
            {[['10-second timer', 'forces fast, fun decisions', '#FF6B4A'], ['Instant reveal', 'learn as you play', '#7C5CFF'], ['Streak bonus', 'rewards the bold', '#58CC02']].map(([t, d, c]) => (
              <li key={t} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c }} />
                <b className="text-ink">{t}</b><span className="font-medium text-muted">— {d}</span>
              </li>
            ))}
          </ul>
        </div>
        <Reveal delay={0.1}><AnimatedQuestion /></Reveal>
      </div>
    </section>
  );
}
