import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Crown } from 'lucide-react';
import { Reveal, SectionHead } from './Sections';

const RACERS = [
  { name: 'Arjun', avatar: '⚡', color: '#FF6B4A', bg: '#FFF1E8' },
  { name: 'Priya', avatar: '🎯', color: '#7C5CFF', bg: '#F1EBFF' },
  { name: 'Karthik', avatar: '🔥', color: '#00C48C', bg: '#E4F8EF' },
  { name: 'Sanjay', avatar: '🏆', color: '#2E9BFF', bg: '#E8F4FF' },
];

export default function MultiplayerRace() {
  const [tick, setTick] = useState(0);
  const [scores, setScores] = useState([1820, 1690, 1540, 1310]);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => {
      setTick((t) => t + 1);
      setScores((s) => s.map((v) => v + [120, 80, 150, 60][Math.floor(Math.random() * 4)]));
    }, 2200);
    return () => clearInterval(iv);
  }, [reduce]);

  const order = RACERS.map((r, i) => ({ ...r, score: scores[i], i })).sort((a, b) => b.score - a.score);

  return (
    <section className="relative overflow-x-clip py-12 sm:py-20">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(720px 320px at 50% 50%, rgba(124,92,255,0.10), transparent 70%)' }} />
      <div className="relative mx-auto grid w-full min-w-0 max-w-6xl items-center gap-8 px-4 sm:px-5 lg:grid-cols-[1.05fr_.95fr] lg:gap-10">
        <Reveal className="min-w-0">
          <div className="relative min-w-0 overflow-hidden rounded-[24px] bg-white p-4 shadow-soft sm:rounded-[28px] sm:p-7" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
            <div className="relative flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[12px] font-extrabold tracking-widest text-[#1E7A38]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#58CC02]" /> LIVE MATCH · DEMO PREVIEW</span>
              <span className="rounded-full bg-[#F8F9FF] px-3.5 py-1.5 font-display text-[13px] font-semibold text-ink" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>Q 12/20</span>
            </div>
            <div className="relative mt-7 space-y-5">
              <div aria-hidden className="absolute bottom-2 left-[26px] top-2 w-[3px] rounded-full bg-[#F1EDFF]" />
              {order.map((p, pos) => (
                <motion.div key={p.name} layout transition={{ type: 'spring', stiffness: 160, damping: 22 }} className="relative flex items-center gap-3">
                  <span className="font-display z-10 grid h-7 w-7 place-items-center rounded-full bg-white text-[11px] font-semibold text-ink shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.12)' }}>{pos + 1}</span>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-white bg-white text-xl shadow-sticker-sm" style={{ outline: `2.5px solid ${p.color}` }}>{p.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-baseline justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5 truncate text-[14px] font-extrabold text-ink sm:text-[14.5px]">{p.name}{pos === 0 && <Crown size={14} className="shrink-0 text-sunny" />}</span>
                      <span className="font-num shrink-0 text-[14px] font-extrabold text-ink sm:text-[14.5px]">{p.score.toLocaleString()}</span>
                    </div>
                    <div className="mt-1.5 h-3 overflow-hidden rounded-full" style={{ background: p.bg }}>
                      <motion.div className="h-full rounded-full" style={{ background: `linear-gradient(90deg, ${p.color}, ${p.color}CC)` }}
                        animate={{ width: `${Math.min(96, 30 + ((p.score - 1200) / 900) * 70 + (reduce ? 0 : Math.sin(tick + p.i) * 3))}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                  {!reduce && tick > 0 && pos < 2 && (
                    <motion.span key={tick + p.name} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: -10 }} className="absolute right-0 -top-1 text-[12px] font-extrabold text-[#1E7A38]">+{[120, 80, 150][pos] ?? 80}</motion.span>
                  )}
                </motion.div>
              ))}
            </div>
            <p className="relative mt-6 rounded-2xl bg-[#F8F9FF] px-4 py-3 text-center text-[12.5px] font-bold text-muted">Positions update live — no refresh needed.</p>
          </div>
        </Reveal>
        <div>
          <SectionHead eyebrow="MULTIPLAYER" title={<>Challenge friends, <span className="qr-gradient-text">live.</span></>} sub="Real avatars, live scores and ranks that move as answers land — read the whole match at a glance." />
          <div className="mt-6 grid grid-cols-3 gap-2 text-center sm:gap-3">
            {[['32', 'players / room', '#2E9BFF'], ['10s', 'per question', '#7C5CFF'], ['0', 'sign-up needed', '#00C48C']].map(([v, l, c]) => (
              <div key={l} className="min-w-0 rounded-[18px] bg-white px-1 py-4 shadow-sticker-sm sm:rounded-[20px] sm:px-2 sm:py-5" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
                <div className="font-display text-[20px] font-semibold sm:text-[24px]" style={{ color: c }}>{v}</div>
                <div className="mt-0.5 break-words px-1 text-[9.5px] font-extrabold uppercase tracking-wider text-muted sm:text-[10.5px]">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
