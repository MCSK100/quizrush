import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Play, Users, Sparkles, ArrowDown } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import { Reveal, SectionHead } from './Sections';

const SAMPLES = [
  { cat: 'Sports', color: '#2E9BFF', bg: '#E8F4FF', q: 'Which country won the 2011 Cricket World Cup?' },
  { cat: 'Science', color: '#2E9BFF', bg: '#E8F4FF', q: 'What gas do plants absorb for photosynthesis?' },
  { cat: 'Tamil', color: '#7C5CFF', bg: '#F1EBFF', q: 'தமிழின் முதல் எழுத்து எது?' },
  { cat: 'Space', color: '#FF3D77', bg: '#FFE9F1', q: 'Which planet has the most moons?' },
];

export function AIQuestionSection() {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const iv = setInterval(() => setI((v) => (v + 1) % SAMPLES.length), 2600);
    return () => clearInterval(iv);
  }, [reduce]);
  const s = SAMPLES[i];
  return (
    <section className="relative overflow-x-clip py-12 sm:py-20">
      <div className="mx-auto grid w-full min-w-0 max-w-6xl items-center gap-8 px-4 sm:px-5 lg:grid-cols-2 lg:gap-10">
        <div>
          <SectionHead eyebrow="AI POWERED" title={<>Fresh questions. <span className="qr-gradient-text">Every game.</span></>} sub="Pick a category and the AI builds a brand-new set — no repeats, no stale decks." />
          <div className="mt-7 flex flex-wrap items-center gap-2 text-[13px] font-extrabold">
            {['CATEGORY', 'AI', 'QUESTION', 'QUIZ'].map((t, k) => (
              <span key={t} className="flex items-center gap-2">
                <span className={`rounded-full px-4 py-2 ${k === 1 ? 'bg-ink text-white shadow-lift' : 'bg-white text-ink shadow-sticker-sm'}`} style={k === 1 ? undefined : { border: '1px solid rgba(120,100,180,0.10)' }}>{t}</span>
                {k < 3 && <ArrowDown size={14} className="rotate-[-90deg] text-faint" />}
              </span>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-[13.5px] font-bold text-muted">
            <Sparkles size={15} className="text-sunny" /> 10K+ AI decks generated this month
          </div>
        </div>
        <Reveal delay={0.1} className="min-w-0">
          <div className="relative mx-auto w-full min-w-0 max-w-md px-1">
            <div aria-hidden className="absolute -inset-2 rounded-[36px] opacity-60 blur-2xl sm:-inset-5" style={{ background: 'linear-gradient(135deg,#FFE3D3,#E9E2FF,#D6EBFF)' }} />
            <div className="relative min-w-0 overflow-hidden rounded-[24px] bg-white shadow-soft sm:rounded-[28px]" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
              <div className="flex flex-wrap items-center gap-2 bg-gradient-to-r from-[#E8F4FF] to-[#F1EBFF] px-4 py-3 sm:px-5 sm:py-3.5">
                <span className="flex shrink-0 gap-1.5"><i className="block h-2.5 w-2.5 rounded-full bg-[#FF5F57]" /><i className="block h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" /><i className="block h-2.5 w-2.5 rounded-full bg-[#58CC02]" /></span>
                <span className="ml-1 flex min-w-0 items-center gap-1.5 truncate text-[11px] font-extrabold tracking-widest text-grape"><Sparkles size={12} className="shrink-0" /> AI GENERATING</span>
              </div>
              <div className="p-5 text-center sm:p-8">
                <div className="min-h-[104px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.35 }}>
                      <span className="inline-block max-w-full truncate rounded-full px-4 py-1.5 text-[12px] font-extrabold" style={{ background: s.bg, color: s.color }}>{s.cat}</span>
                      <p className="font-display mt-3 text-balance break-words text-[18px] font-medium leading-snug text-ink sm:text-[20px]">“{s.q}”</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <div className="mt-3 flex justify-center gap-1.5">
                  {SAMPLES.map((_, k) => (<span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? 'w-6 bg-gradient-to-r from-electric to-grape' : 'w-1.5 bg-ink/10'}`} />))}
                </div>
              </div>
            </div>
            <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -left-1 top-10 hidden h-12 w-12 place-items-center rounded-2xl bg-white text-xl shadow-soft min-[480px]:grid sm:-left-5" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>🧠</motion.span>
            <motion.span animate={{ y: [0, 10, 0] }} transition={{ duration: 4.6, repeat: Infinity }} className="absolute -right-1 top-1/3 hidden h-12 w-12 place-items-center rounded-2xl bg-white text-xl shadow-soft min-[480px]:grid sm:-right-4" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>⚡</motion.span>
            <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 3.8, repeat: Infinity }} className="absolute -bottom-4 left-10 grid h-11 w-11 place-items-center rounded-2xl bg-white text-lg shadow-soft sm:h-12 sm:w-12 sm:text-xl" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>🏆</motion.span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="relative overflow-x-clip overflow-y-visible">
      <AnimatedBackground tone="cta" />
      <div aria-hidden className="pointer-events-none absolute left-[6%] top-16 hidden animate-floaty font-display text-3xl text-[#7C5CFF]/25 min-[480px]:block">?</div>
      <div aria-hidden className="pointer-events-none absolute right-[8%] top-24 hidden animate-floaty font-display text-2xl text-[#2E9BFF]/30 min-[480px]:block" style={{ animationDelay: '1s' }}>★</div>
      <div aria-hidden className="pointer-events-none absolute bottom-24 left-[10%] hidden animate-floaty text-2xl text-[#2E9BFF]/25 min-[480px]:block" style={{ animationDelay: '2s' }}>⚡</div>
      <div aria-hidden className="pointer-events-none absolute bottom-32 right-[10%] hidden animate-floaty text-2xl text-[#FFB020]/30 min-[480px]:block" style={{ animationDelay: '0.5s' }}>🏆</div>
      <div className="relative mx-auto w-full min-w-0 max-w-3xl px-4 py-16 text-center sm:px-5 sm:py-28">
        <Reveal>
          <div className="qr-eyebrow mx-auto max-w-full">⚡ <span className="truncate">NO SIGN-UP NEEDED</span></div>
          <h2 className="font-display mt-6 text-balance text-[clamp(2.2rem,10vw,4.5rem)] font-semibold leading-[1.0] tracking-tight text-ink">READY TO TEST<br />YOUR <span className="qr-gradient-text">BRAIN?</span></h2>
          <p className="mx-auto mt-4 max-w-md text-balance text-[15px] font-medium text-muted sm:text-[16px]">Play solo or challenge your friends. One tap and you're in the spotlight.</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[12.5px] font-extrabold text-muted">
            {['No sign-up needed', 'Solo + rooms', 'AI & bank questions'].map((t) => (
              <span key={t} className="rounded-full bg-white px-4 py-2 shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>{t}</span>
            ))}
          </div>
          <div className="mx-auto mt-8 flex max-w-md flex-col items-stretch justify-center gap-2.5 min-[480px]:max-w-none min-[480px]:flex-row min-[480px]:flex-wrap sm:gap-3">
            <Link to="/solo" className="qr-btn-primary group justify-center px-9 py-4 font-display text-[16px] sm:text-[17px]"> <Play size={19} strokeWidth={3} /> PLAY SOLO</Link>
            <Link to="/multiplayer/create" className="qr-btn-dark justify-center px-9 py-4 font-display text-[16px] sm:text-[17px]"><Users size={19} /> CREATE GAME</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative overflow-x-clip bg-white/80 backdrop-blur" style={{ borderTop: '1px solid rgba(120,100,180,0.08)' }}>
      <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col items-center justify-between gap-5 px-4 py-8 text-center sm:flex-row sm:px-5 sm:text-left">
        <div className="flex items-center gap-2.5">
          <img src="/quizlly-favicon.png" alt="Quizlly" className="h-10 w-10 rounded-2xl object-cover shadow-neon" />
          <div>
            <div className="font-display text-[17px] font-semibold tracking-tight text-ink">QUIZ<span className="qr-gradient-text">LLY</span></div>
            <div className="text-[12.5px] font-medium text-muted">Think Fast. Play Smarter.</div>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[13.5px] font-bold text-muted">
          {[['/solo', 'Solo Quiz'], ['/multiplayer', 'Multiplayer'], ['/categories', 'Categories'], ['/leaderboard', 'Leaderboard'], ['/about', 'About'], ['/faq', 'FAQ']].map(([h, l]) => (
            <Link key={l + h} to={h} className="transition-colors hover:text-ink">{l}</Link>
          ))}
        </nav>
        <div className="text-[12.5px] font-bold text-muted">Fresh questions · Every match</div>
      </div>
    </footer>
  );
}
