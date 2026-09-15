import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Play, Users, ChevronDown, ArrowRight, Radio, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

const HERO_VIDEO_SRC = '/192292-892475144.mp4';

function HeroBannerVideo() {
  const vidRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    const vid = vidRef.current;
    if (!vid || reduce) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      },
      { threshold: 0.1 },
    );
    ob.observe(vid);
    return () => ob.disconnect();
  }, [reduce]);
  return (
    <>
      <video
        ref={vidRef}
        className="absolute inset-0 h-full w-full scale-105 object-cover"
        src={HERO_VIDEO_SRC}
        muted
        loop
        playsInline
        autoPlay={!reduce}
        preload="metadata"
        poster="/quizlly-og-image.png"
        aria-hidden
      />
      {/* Light cinematic wash — video stays clearly visible, text stays readable */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-cream/60 via-cream/30 to-cream" />
      <div aria-hidden className="absolute inset-0" style={{ background: 'radial-gradient(min(1000px,110vw) 480px at 50% 38%, transparent 30%, rgba(255,253,248,0.55) 100%)' }} />
    </>
  );
}

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
    <div className="text-center">
      <div className="font-display text-[22px] font-semibold text-ink drop-shadow-[0_2px_12px_rgba(255,253,248,0.9)] sm:text-[32px]">{prefix}{v}{suffix}</div>
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
    { target: 100, prefix: '', suffix: '%', label: 'FRESH AI QUESTIONS' },
    { target: CATEGORIES.length, prefix: '', suffix: '', label: 'CATEGORIES' },
    { target: 3, prefix: '', suffix: '', label: 'GAME MODES' },
  ];
  return (
    <div ref={ref} className="mt-8 flex flex-wrap items-stretch justify-center gap-x-8 gap-y-5 sm:mt-10 sm:gap-x-12">
      {stats.map((s, i) => (
        <div key={s.label} className="flex items-stretch gap-8 sm:gap-12">
          {i > 0 && <span aria-hidden className="hidden w-px self-stretch bg-ink/10 sm:block" />}
          <Stat target={s.target} prefix={s.prefix} suffix={s.suffix} label={s.label} start={inView} />
        </div>
      ))}
    </div>
  );
}

export default function Hero() {
  const secRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: secRef, offset: ['start start', 'end start'] });

  // 3D parallax scroll: backdrop dives + zooms, content lifts toward the viewer and fades
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.22]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const textScale = useTransform(scrollYProgress, [0, 1], [1, 0.92]);
  const textO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const textRX = useTransform(scrollYProgress, [0, 1], [0, 12]);
  const chipNearY = useTransform(scrollYProgress, [0, 1], [0, 230]);
  const chipFarY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const cueO = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  // Gentle mouse tilt for 3D depth on desktop
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 60, damping: 18 });
  const tiltY = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 60, damping: 18 });

  return (
    <section
      ref={secRef}
      className="relative overflow-x-clip overflow-y-visible [perspective:1400px]"
      onMouseMove={(e) => {
        if (reduce) return;
        const r = secRef.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
    >
      <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0">
        <HeroBannerVideo />
      </motion.div>

      <div className="relative mx-auto w-full min-w-0 max-w-4xl px-4 pb-16 pt-28 text-center sm:px-5 sm:pb-20 sm:pt-40">
        <motion.div style={{ y: textY, opacity: textO, scale: textScale, rotateX: reduce ? 0 : textRX, transformPerspective: 1000 }}>
          <motion.div style={reduce ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 900, transformStyle: 'preserve-3d' }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="qr-eyebrow mx-auto max-w-full" style={{ transform: 'translateZ(60px)' }}>
              <span className="flex shrink-0 gap-1.5 text-[11px]"><span className="text-electric">●</span><span className="text-grape">●</span><span className="text-electric">●</span></span>
              <span className="truncate">PLAY • THINK • COMPETE</span>
            </motion.div>
            <h1 className="font-display mt-5 text-balance text-[clamp(2.8rem,11vw,5.75rem)] font-semibold leading-[0.95] tracking-tight text-ink drop-shadow-[0_2px_20px_rgba(255,253,248,0.95)] sm:text-[clamp(3.2rem,8vw,5.75rem)]" style={{ transform: 'translateZ(110px)' }}>
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
              className="mx-auto mt-5 max-w-2xl text-balance text-[16px] font-medium leading-relaxed text-ink/70 sm:text-[18px]" style={{ transform: 'translateZ(40px)' }}>
              Play free online quizzes — solo trivia or live multiplayer rooms with friends. General knowledge, GK, current affairs, science, sports and 17+ topics with fresh AI-generated questions every match.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }} className="mt-8 flex flex-col items-center justify-center gap-2.5 min-[480px]:flex-row min-[480px]:flex-wrap sm:gap-3" style={{ transform: 'translateZ(80px)' }}>
              <Link to="/solo" className="qr-btn-primary group w-full justify-center px-9 py-4 font-display text-[16px] tracking-wide min-[480px]:w-auto">
                <Play size={18} strokeWidth={3} /> PLAY SOLO <ArrowRight size={17} className="arrow-nudge" />
              </Link>
              <Link to="/multiplayer/create" className="qr-btn-dark group w-full justify-center px-9 py-4 font-display text-[16px] tracking-wide min-[480px]:w-auto">
                <Users size={18} /> CREATE GAME
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="mt-4 text-[13.5px] font-extrabold text-muted">
              Have a room code? <Link to="/multiplayer/join" className="text-grape underline decoration-grape/40 underline-offset-4 hover:decoration-grape">Join the game →</Link>
            </motion.div>

            <HeroStats />
          </motion.div>
        </motion.div>

        {/* Floating depth chips — drift at different scroll speeds for 3D parallax */}
        {!reduce && (
          <>
            <motion.div style={{ y: chipNearY }} aria-hidden className="absolute left-4 top-32 hidden items-center gap-2 rounded-full bg-white/70 py-2 pl-2.5 pr-4 text-[12px] font-extrabold text-ink shadow-soft backdrop-blur-xl lg:flex" >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#FF4B5C]/15 text-[#FF4B5C]"><Radio size={14} /></span>
              2.4k playing now
            </motion.div>
            <motion.div style={{ y: chipFarY }} aria-hidden className="absolute right-6 top-48 hidden items-center gap-2 rounded-full bg-white/70 py-2 pl-2.5 pr-4 text-[12px] font-extrabold text-ink shadow-soft backdrop-blur-xl lg:flex">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-grape/15 text-grape"><Sparkles size={14} /></span>
              Fresh AI questions
            </motion.div>
          </>
        )}
      </div>

      <motion.div style={{ opacity: cueO }} aria-hidden className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 sm:flex">
        <span className="text-[10px] font-extrabold tracking-[0.28em] text-muted">SCROLL FOR MORE FUN</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} className="text-muted"><ChevronDown size={16} /></motion.span>
      </motion.div>
    </section>
  );
}
