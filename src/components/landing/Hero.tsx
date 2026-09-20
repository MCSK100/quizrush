import { Link } from 'react-router-dom';
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Play, Users, ChevronDown, ArrowRight, Radio, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';

const HERO_VIDEO_SRC = '/192292-892475144.mp4';

function HeroBannerVideo() {
  const vidRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  // The 21MB hero video must NEVER compete with first paint:
  // - no poster (the 679KB og image was fetched eagerly as poster)
  // - no src until window load + idle AND hero visible
  // - skipped entirely on mobile / save-data / slow networks
  const [src, setSrc] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (reduce) return;
    try {
      const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
      if (conn?.saveData) return;
      if (conn?.effectiveType && /2g|slow-2g/i.test(conn.effectiveType)) return;
      if (window.innerWidth < 640) return;
      if (window.matchMedia('(prefers-reduced-data: reduce)').matches) return;
    } catch { /* allow video */ }
    let done = false;
    const load = () => { if (!done) { done = true; setSrc(HERO_VIDEO_SRC); } };
    const el = wrapRef.current;
    const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: object) => number }).requestIdleCallback;
    const onLoaded = () => {
      if (ric) ric(load, { timeout: 4000 });
      else window.setTimeout(load, 2500);
    };
    if (document.readyState === 'complete') onLoaded();
    else window.addEventListener('load', onLoaded, { once: true });
    let timer = 0;
    let ob: IntersectionObserver | null = null;
    if (el && 'IntersectionObserver' in window) {
      ob = new IntersectionObserver(
        ([e]) => {
          if (!e.isIntersecting) return;
          ob?.disconnect();
          // Even when visible, wait for idle so LCP/FCP go first.
          if (ric) ric(load, { timeout: 4000 });
          else timer = window.setTimeout(load, 2500);
        },
        { threshold: 0 },
      );
      ob.observe(el);
    } else {
      timer = window.setTimeout(load, 5000);
    }
    return () => {
      window.removeEventListener('load', onLoaded);
      ob?.disconnect();
      window.clearTimeout(timer);
    };
  }, [reduce]);
  useEffect(() => {
    const vid = vidRef.current;
    if (!vid || reduce || !src) return;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) vid.play().catch(() => {});
        else vid.pause();
      },
      { threshold: 0.1 },
    );
    ob.observe(vid);
    return () => ob.disconnect();
  }, [reduce, src]);
  return (
    <div ref={wrapRef} className="absolute inset-0 bg-gradient-to-b from-[#DCEBFF] via-[#F1EBFF] to-cream">
      {src && (
      <video
        ref={vidRef}
        className={`absolute inset-0 block h-full w-full scale-105 object-cover transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
        src={src}
        muted
        loop
        playsInline
        autoPlay={!reduce}
        preload="none"
        disablePictureInPicture
        aria-hidden
        onLoadedData={() => setReady(true)}
        onCanPlay={() => setReady(true)}
      />
      )}
      {/* Crisp video: no dark grade/vignette washes — just a light bottom fade
          so text stays readable and the edge melts into the next section */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(255,253,248,0.08) 0%, rgba(255,253,248,0) 35%, rgba(255,253,248,0.12) 60%, rgba(255,253,248,0.92) 88%, #FFFDF8 100%)' }}
      />
      {/* Seam cover — melts the video edge into the next section, no hairline */}
      <div aria-hidden className="absolute inset-x-0 bottom-[-2px] h-10 bg-gradient-to-b from-transparent to-cream" />
    </div>
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
      <div className="font-display text-[22px] font-semibold text-ink drop-shadow-[0_2px_10px_rgba(30,20,60,0.30)] sm:text-[32px]">{prefix}{v}{suffix}</div>
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

  // Cheap scroll parallax: vertical drift + fade only (no scale/zoom —
  // zooming a full-bleed video layer every scroll frame janks mobile GPUs).
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 110]);
  const textO = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const chipNearY = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const chipFarY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const cueO = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  // Gentle mouse tilt for depth on fine-pointer desktops only
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const tiltX = useSpring(useTransform(my, [0, 1], [4, -4]), { stiffness: 60, damping: 18 });
  const tiltY = useSpring(useTransform(mx, [0, 1], [-5, 5]), { stiffness: 60, damping: 18 });
  const finePointer = useRef(false);
  useEffect(() => {
    try { finePointer.current = window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 1024; } catch { finePointer.current = false; }
  }, []);

  return (
    <section
      ref={secRef}
      className="relative overflow-hidden bg-cream [perspective:1400px]"
      style={{ marginBottom: -2 }}
      onMouseMove={(e) => {
        if (reduce || !finePointer.current) return;
        const r = secRef.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
    >
      {/* Extended 4px past the bottom edge so the seam never shows a hairline */}
      <motion.div style={{ y: bgY }} className="absolute inset-x-0 bottom-[-4px] top-0">
        <HeroBannerVideo />
      </motion.div>

      <div className="relative mx-auto w-full min-w-0 max-w-4xl px-4 pb-16 pt-28 text-center sm:px-5 sm:pb-20 sm:pt-40">
        <motion.div style={{ y: textY, opacity: textO }}>
          <motion.div style={reduce || !finePointer.current ? undefined : { rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="qr-eyebrow mx-auto max-w-full" style={{ transform: 'translateZ(60px)' }}>
              <span className="flex shrink-0 gap-1.5 text-[11px]"><span className="text-electric">●</span><span className="text-grape">●</span><span className="text-electric">●</span></span>
              <span className="truncate">PLAY • THINK • COMPETE</span>
            </motion.div>
            <h1 className="font-display mt-5 text-balance text-[clamp(2.8rem,11vw,5.75rem)] font-semibold leading-[0.95] tracking-tight text-ink drop-shadow-[0_6px_28px_rgba(30,20,60,0.35)] sm:text-[clamp(3.2rem,8vw,5.75rem)]" style={{ transform: 'translateZ(110px)' }}>
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
