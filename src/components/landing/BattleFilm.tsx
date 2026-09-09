import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Check, Crown, Flame, Timer } from 'lucide-react';
import { SectionHead } from './Sections';

/*
 * BATTLE FILM — a video you scrub with scroll.
 * Sticky cinema screen; scroll progress drives camera zoom, parallax
 * layers, countdown digits, timer bar, answer reveal + HUD timeline.
 */

const Q = { q: 'Which planet is known as the Red Planet?', opts: ['Earth', 'Mars', 'Jupiter', 'Venus'], a: 1 };
const CHAPTERS = ['LOBBY', 'COUNTDOWN', 'FIRST BLOOD', 'CROWNED'];
const LOBBY = [
  { n: 'Arjun', t: 'AR', c: '#FF6B4A' }, { n: 'Priya', t: 'PR', c: '#7C5CFF' },
  { n: 'Karthik', t: 'KA', c: '#2E9BFF' }, { n: 'Sanjay', t: 'SA', c: '#0E7A55' },
  { n: 'Meera', t: 'ME', c: '#B8860B' }, { n: 'You', t: 'YO', c: '#1E1B33' },
];

function Ghost({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden className="font-display pointer-events-none absolute left-1/2 top-8 -translate-x-1/2 whitespace-nowrap text-[22vw] font-semibold leading-none text-white/[0.06] sm:text-[11rem]">
      {children}
    </div>
  );
}

function BeatShell({ k, ghost, eyebrow, title, children }: { k: string; ghost: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <motion.div key={k} initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center sm:px-10">
      <Ghost>{ghost}</Ghost>
      <div className="relative text-[11px] font-extrabold tracking-[0.24em] text-violet-300">{eyebrow}</div>
      <h3 className="font-display relative mt-2 text-3xl tracking-tight text-white sm:text-5xl">{title}</h3>
      <div className="relative mt-6 w-full max-w-md">{children}</div>
    </motion.div>
  );
}

export default function BattleFilm() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [beat, setBeat] = useState(0);
  const [frame, setFrame] = useState(1);
  const [picked, setPicked] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useMotionValueEvent(p, 'change', (v) => {
    setBeat((prev) => { const b = Math.min(3, Math.floor(v * 4)); return prev === b ? prev : b; });
    setFrame((prev) => { const f = Math.floor(v * 239) + 1; return prev === f ? prev : f; });
    const sub = Math.min(1, Math.max(0, (v - 0.5) / 0.28));
    setPicked((prev) => { const n = sub > 0.35; return prev === n ? prev : n; });
    setRevealed((prev) => { const n = sub > 0.68; return prev === n ? prev : n; });
  });

  const zoom = useTransform(p, [0, 1], [1, 1.28]);
  const gA = useTransform(p, [0, 1], [0, -150]);
  const gB = useTransform(p, [0, 1], [0, 120]);
  const orbX = useTransform(p, [0, 1], [0, 100]);
  const qbar = useTransform(p, [0.5, 0.78], [1, 0.06]);

  const cd = beat === 1 ? Math.max(0, 3 - Math.floor((frame - 61) / 15)) : 3;

  if (reduce) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-16">
        <SectionHead eyebrow="THE FILM" title={<>A battle, <span className="qr-gradient-text">frame by frame.</span></>} sub="Lobby fills, countdown burns, first blood, crowned — the full arc of a Quizlly room." />
        <div className="qr-surface mt-8 rounded-[28px] p-6 text-center">
          <p className="font-display text-2xl text-ink">Arjun takes the crown with 1,940 pts.</p>
          <p className="mt-2 text-sm font-medium text-muted">Six racers · 20 questions · one winner.</p>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[420vh]">
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4">
            <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <div className="text-[11px] font-extrabold tracking-[0.18em] text-violet-300">THE FILM · SCROLL TO SCRUB</div>
              <h2 className="font-display mt-1 text-2xl tracking-tight text-white sm:text-3xl">One room. <span className="qr-gradient-text">20 questions.</span></h2>
            </div>
            <div className="font-num hidden rounded-full bg-white/10 px-3 py-1.5 text-xs text-white sm:block" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>FRAME {String(frame).padStart(3, '0')} / 240</div>
          </div>

          {/* cinema screen */}
          <div className="qr-surface relative h-[72svh] min-h-[520px] overflow-hidden rounded-[28px]">
            <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&q=60&auto=format&fit=crop" alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-[0.14]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#060913]/60 via-transparent to-[#060913]/85" />
            {/* camera layers */}
            <motion.div style={{ scale: zoom }} className="absolute inset-0">
              <motion.div style={{ x: orbX }} aria-hidden className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-violet-700 opacity-40 blur-3xl" />
              <motion.div style={{ y: gB }} aria-hidden className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-cyan-500 opacity-25 blur-3xl" />
              <motion.div style={{ y: gA }} aria-hidden className="font-display absolute left-[6%] top-[16%] text-7xl font-semibold text-violet-400/20">?</motion.div>
              <motion.div style={{ y: gB }} aria-hidden className="font-display absolute bottom-[18%] right-[8%] text-6xl font-semibold text-cyan-300/20">⚡</motion.div>
              <motion.div style={{ x: orbX }} aria-hidden className="font-display absolute right-[16%] top-[10%] text-5xl font-semibold text-lime-300/20">Q7</motion.div>
            </motion.div>
            {/* letterbox */}
            <div aria-hidden className="absolute inset-x-0 top-0 z-20 h-10 bg-gradient-to-b from-black/40 to-transparent" />
            <div aria-hidden className="absolute inset-x-0 bottom-16 z-20 h-10 bg-gradient-to-t from-black/40 to-transparent" />
            {/* HUD corners */}
            <span aria-hidden className="absolute left-3 top-3 z-20 h-5 w-5 rounded-tl-md border-l-2 border-t-2 border-white/25" />
            <span aria-hidden className="absolute right-3 top-3 z-20 h-5 w-5 rounded-tr-md border-r-2 border-t-2 border-white/25" />
            <span aria-hidden className="absolute bottom-[76px] left-3 z-20 h-5 w-5 rounded-bl-md border-b-2 border-l-2 border-white/25" />
            <span aria-hidden className="absolute bottom-[76px] right-3 z-20 h-5 w-5 rounded-br-md border-b-2 border-r-2 border-white/25" />
            <div className="absolute left-1/2 top-4 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-extrabold tracking-[0.2em] text-white shadow-soft backdrop-blur" style={{ border: '1px solid rgba(255,255,255,0.14)' }}>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" /> ROOM PK-4821 · LIVE
            </div>

            {/* beats */}
            <div className="absolute inset-0 bottom-16 top-10">
              <AnimatePresence mode="wait">
                {beat === 0 && (
                  <BeatShell k="b0" ghost="LOBBY" eyebrow="SCENE 01 · THE LOBBY FILLS" title="Six racers. One code.">
                    <div className="grid grid-cols-3 gap-2">
                      {LOBBY.map((a, i) => (
                        <motion.div key={a.n} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.07 }}
                          className="flex items-center gap-2 rounded-2xl bg-white/[0.07] px-3 py-2 shadow-soft backdrop-blur" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
                          <img src={`https://i.pravatar.cc/64?img=${10 + i * 7}`} alt={a.n} loading="lazy" className="h-8 w-8 rounded-full object-cover" />
                          <span className="text-xs font-extrabold text-white">{a.n}</span>
                        </motion.div>
                      ))}
                    </div>
                  </BeatShell>
                )}
                {beat === 1 && (
                  <BeatShell k="b1" ghost="READY" eyebrow="SCENE 02 · COUNTDOWN" title="Get ready.">
                      <div className="font-display text-[6rem] leading-none text-white sm:text-[8rem]">
                      {cd === 0 ? <span className="qr-gradient-text">GO!</span> : cd}
                    </div>
                    <div className="mx-auto mt-2 flex justify-center gap-1.5">
                      {[3, 2, 1].map((n) => (<span key={n} className={`h-1.5 rounded-full transition-all ${cd < n ? 'w-6 bg-lime-300' : 'w-1.5 bg-white/20'}`} />))}
                    </div>
                  </BeatShell>
                )}
                {beat === 2 && (
                  <BeatShell k="b2" ghost="Q12" eyebrow="SCENE 03 · FIRST BLOOD" title={Q.q}>
                    <div className="overflow-hidden rounded-full bg-white/10">
                      <motion.div className="h-2 origin-left rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-lime-300" style={{ scaleX: qbar }} />
                    </div>
                    <div className="mt-3 grid gap-2 text-left">
                      {Q.opts.map((o, i) => {
                        const isA = i === Q.a;
                        const state = revealed && isA ? 'hit' : picked && isA ? 'pick' : 'idle';
                        return (
                          <div key={o} className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${state === 'hit' ? 'bg-emerald-400/15 text-emerald-200' : state === 'pick' ? 'bg-violet-500/20 text-white' : 'bg-white/[0.06] text-slate-200'}`}
                            style={{ border: state === 'hit' ? '1px solid rgba(52,211,153,0.5)' : state === 'pick' ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.10)' }}>
                            <span className={`grid h-7 w-7 place-items-center rounded-xl text-xs font-extrabold ${state === 'hit' ? 'bg-emerald-400 text-black' : 'bg-white/10 text-slate-300'}`}>{'ABCD'[i]}</span>
                            {o}
                            {state === 'hit' && <Check size={16} className="ml-auto" />}
                            {state === 'pick' && !revealed && <Timer size={14} className="ml-auto text-violet-300" />}
                          </div>
                        );
                      })}
                    </div>
                  </BeatShell>
                )}
                {beat === 3 && (
                  <BeatShell k="b3" ghost="#1" eyebrow="SCENE 04 · CROWNED" title="Arjun takes it.">
                    <div className="relative mx-auto max-w-[280px] rounded-3xl bg-ink px-6 py-5 text-white shadow-lift">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <span key={i} aria-hidden className="absolute h-1.5 w-1.5 animate-sparkle rounded-full"
                          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, background: ['#FFC531', '#FF8FAB', '#3DDCB4', '#9ED6FF'][i % 4], animationDelay: `${(i * 0.3) % 2}s` }} />
                      ))}
                      <Crown size={28} className="mx-auto text-sunny" />
                      <div className="font-display mt-2 text-3xl">1,940 <span className="text-sm text-white/70">pts</span></div>
                      <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-bold text-white/80"><Flame size={13} className="text-coral" /> 9-streak · 84% accuracy</div>
                    </div>
                  </BeatShell>
                )}
              </AnimatePresence>
            </div>

            {/* player timeline */}
            <div className="absolute inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#0B1120]/85 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                {CHAPTERS.map((c, i) => (
                  <span key={c} className={`hidden rounded-full px-2.5 py-1 text-[10px] font-extrabold tracking-widest sm:block ${i === beat ? 'bg-white text-black' : 'bg-white/10 text-slate-300'}`}>{c}</span>
                ))}
                <span className="font-num ml-auto text-[11px] font-bold text-slate-400">{String(frame).padStart(3, '0')}/240</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-violet-500 via-cyan-400 to-lime-300" style={{ scaleX: p }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
