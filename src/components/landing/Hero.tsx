import { Link } from 'react-router-dom';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Play, Users, ChevronDown, ArrowRight, Hash } from 'lucide-react';
import AnimatedBackground from './AnimatedBackground';
import HeroQuizCard from './HeroQuizCard';
import { CATEGORIES } from '../../data/categories';
import { SEED_QUESTIONS } from '../../data/questions';

function useCountUp(target: number, start: boolean, duration = 1400) {
  const [v, setV] = useState(0);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!start) return;
    if (reduce) { setV(target); return; }
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration, reduce]);
  return v;
}

function Stat({ target, prefix, suffix, label, start }: { target: number; prefix?: string; suffix?: string; label: string; start: boolean }) {
  const v = useCountUp(target, start);
  return (
    <div className="text-left">
      <div className="font-display text-[22px] font-semibold text-ink sm:text-[32px]">{prefix}{v}{suffix}</div>
      <div className="mt-0.5 text-[9.5px] font-extrabold tracking-[0.14em] text-muted sm:text-[10.5px] sm:tracking-[0.18em]">{label}</div>
    </div>
  );
}

export function HeroStats() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), { threshold: 0.4 });
    ob.observe(el); return () => ob.disconnect();
  }, []);
  const stats = [
    { target: SEED_QUESTIONS.length, prefix: '', suffix: '+', label: 'QUESTIONS IN BANK' },
    { target: CATEGORIES.length, prefix: '', suffix: '', label: 'CATEGORIES' },
    { target: 3, prefix: '', suffix: '', label: 'GAME MODES' },
  ];
  return (
    <div ref={ref} className="mt-8 grid grid-cols-3 gap-x-4 gap-y-5 sm:mt-9 sm:flex sm:flex-wrap sm:items-stretch sm:gap-x-9 sm:gap-y-5">
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-stretch gap-7 sm:gap-9">
          {i > 0 && <span aria-hidden className="hidden w-px self-stretch bg-[#7C5CFF]/15 sm:block" />}
          <Stat target={s.target} prefix={s.prefix} suffix={s.suffix} label={s.label} start={inView} />
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  const secRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const textO = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const cueO = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <section ref={secRef} className="relative overflow-x-clip overflow-y-visible">
      <motion.div style={{ y: bgY }} className="absolute inset-0">
        <AnimatedBackground tone="hero" />
      </motion.div>

      <div className="relative mx-auto grid w-full min-w-0 max-w-6xl items-center gap-6 px-4 pb-12 pt-24 sm:gap-8 sm:px-5 sm:pb-14 sm:pt-36 lg:grid-cols-[1.02fr_.98fr] lg:gap-4 lg:pb-16">
        <motion.div style={{ y: textY, opacity: textO }} className="relative min-w-0 max-w-xl">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="qr-eyebrow max-w-full text-center sm:text-left">
            <span className="flex shrink-0 gap-1.5 text-[11px]"><span className="text-coral">●</span><span className="text-grape">●</span><span className="text-electric">●</span></span>
            <span className="truncate">PLAY • THINK • COMPETE</span>
          </motion.div>
          <h1 className="font-display mt-5 text-balance text-[clamp(2.6rem,12vw,5.4rem)] font-semibold leading-[0.95] tracking-tight text-ink sm:text-[clamp(3rem,8.5vw,5.4rem)]">
            <span className="block overflow-hidden pb-[0.06em]">
              <motion.span className="block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>THINK FAST.</motion.span>
            </span>
            <span className="block overflow-hidden pb-[0.1em]">
              <motion.span className="block" initial={{ y: '110%' }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>
                PLAY <span className="qr-gradient-text">SMARTER.</span>
              </motion.span>
            </span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="mt-5 max-w-md text-[16px] font-medium leading-relaxed text-muted">
            Challenge yourself or race your friends in fast-paced quizzes powered by AI-generated questions.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-7 flex flex-col items-stretch gap-2.5 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center sm:gap-3">
            <Link to="/solo" className="qr-btn-primary group justify-center px-7 py-4 font-display text-[16px] tracking-wide">
              <Play size={18} strokeWidth={3} /> PLAY SOLO <ArrowRight size={17} className="arrow-nudge" />
            </Link>
            <Link to="/multiplayer/create" className="qr-btn-dark group justify-center px-7 py-4 font-display text-[16px] tracking-wide">
              <Users size={18} /> CREATE GAME
            </Link>
            <Link to="/multiplayer/join" className="qr-btn-ghost group justify-center px-6 py-4 text-[15px] font-extrabold">
              <Hash size={16} className="text-grape" /> JOIN WITH CODE
            </Link>
          </motion.div>

          <HeroStats />
        </motion.div>

        <motion.div style={{ y: cardY }} className="relative min-w-0">
          <HeroQuizCard />
        </motion.div>
      </div>

      <motion.div style={{ opacity: cueO }} aria-hidden className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 sm:flex">
        <span className="text-[10px] font-extrabold tracking-[0.28em] text-muted">SCROLL FOR MORE FUN</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="text-muted"><ChevronDown size={16} /></motion.span>
      </motion.div>
    </section>
  );
}
