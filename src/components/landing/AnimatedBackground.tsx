import { motion, useReducedMotion } from 'framer-motion';
import { useMemo } from 'react';
import { Brain } from 'lucide-react';

export function GradientOrb({ className = '', color = '#E9E2FF', style = {} as React.CSSProperties, anim = 'orbA' }: { className?: string; color?: string; style?: React.CSSProperties; anim?: 'orbA' | 'orbB' }) {
  return <div aria-hidden className={`qr-blob ${anim === 'orbA' ? 'animate-orbA' : 'animate-orbB'} ${className}`} style={{ background: color, ...style }} />;
}

export function FloatingParticles({ count = 18, mobileCount = 8 }: { count?: number; mobileCount?: number }) {
  const reduce = useReducedMotion();
  const n = typeof window !== 'undefined' && window.innerWidth < 640 ? mobileCount : count;
  const dots = useMemo(() => Array.from({ length: reduce ? 0 : n }).map((_, i) => ({
    left: (i * 53 + 11) % 100,
    top: (i * 31 + 7) % 100,
    delay: (i * 0.43) % 3,
    size: i % 3 === 0 ? 7 : i % 3 === 1 ? 5 : 3.5,
    color: ['#7C5CFF', '#2E9BFF', '#58CC02', '#FF7BAC', '#FFB020', '#38BDF8'][i % 6],
  })), [n, reduce]);
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <span key={i} className="absolute rounded-full animate-sparkle" style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, background: d.color, opacity: .55, animationDelay: `${d.delay}s` }} />
      ))}
    </div>
  );
}

export function FloatingQuizIcon({ glyph, className = '', size = 22, delay = 0, duration = 6 }: { glyph: string; className?: string; size?: number; delay?: number; duration?: number }) {
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-auto absolute grid place-items-center rounded-2xl bg-white/80 font-display text-ink shadow-soft backdrop-blur transition-transform hover:scale-110 hover:rotate-6 ${className}`}
      style={{ width: size + 16, height: size + 16, fontSize: size * 0.62, border: '1px solid rgba(120,100,180,0.08)' }}
      animate={{ y: [0, -14, 0], rotate: [0, 6, -4, 0] }}
      transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
    >
      {glyph}
    </motion.span>
  );
}

export function ParallaxLayer({ children, className = '' }: { speed?: number; children: React.ReactNode; className?: string }) {
  return <div aria-hidden className={className}>{children}</div>;
}

function StarField({ count = 42, mobileCount = 16 }: { count?: number; mobileCount?: number }) {
  const reduce = useReducedMotion();
  const n = typeof window !== 'undefined' && window.innerWidth < 640 ? mobileCount : count;
  const stars = useMemo(() => Array.from({ length: reduce ? 0 : n }).map((_, i) => ({
    left: (i * 37 + 13) % 100,
    top: (i * 53 + 5) % 72,
    size: 1.5 + ((i * 7) % 3),
    delay: (i * 0.37) % 3,
    dur: 2.2 + ((i * 13) % 20) / 10,
    color: ['#FFFFFF', '#FFE9A8', '#D6EBFF', '#E9E2FF'][i % 4],
  })), [n, reduce]);
  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {stars.map((s, i) => (
        <span key={i} className="absolute rounded-full animate-sparkle"
          style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, background: s.color, boxShadow: `0 0 ${s.size * 2}px ${s.color}`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }} />
      ))}
    </div>
  );
}

function BrainWatermark() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden overflow-hidden sm:block">
      <motion.div className="absolute" style={{ right: '-3%', top: '2%' }}
        animate={{ y: [0, -16, 0], scale: [1, 1.05, 1] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}>
        <Brain size={190} strokeWidth={1} className="text-[#C9BFF5]" style={{ opacity: 0.35 }} />
        {[[38, 52], [96, 30], [128, 92]].map(([x, y], i) => (
          <motion.span key={i} className="absolute h-2.5 w-2.5 rounded-full bg-[#7C5CFF]"
            style={{ left: x, top: y }}
            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0.15, 0.5] }} transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }} />
        ))}
      </motion.div>
    </div>
  );
}

function QuizFloats() {
  const risers = useMemo(() => [
    { left: '14%', d: 0, dur: 7, t: '?' },
    { left: '38%', d: 2.4, dur: 8, t: 'A' },
    { left: '66%', d: 1.2, dur: 7.5, t: '?' },
    { left: '84%', d: 3.6, dur: 8.5, t: 'B' },
  ], []);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {risers.map((r) => (
        <motion.span key={`${r.left}-${r.t}`}
          className="font-display absolute bottom-[6%] grid h-9 w-9 place-items-center rounded-2xl bg-white/85 text-[15px] font-semibold text-grape shadow-sticker-sm"
          style={{ left: r.left, border: '1px solid rgba(120,100,180,0.10)' }}
          animate={{ y: [30, -120], opacity: [0, 0.85, 0], rotate: [0, 10, -6] }}
          transition={{ duration: r.dur, repeat: Infinity, delay: r.d, ease: 'easeInOut' }}
        >
          {r.t}
        </motion.span>
      ))}
      <motion.span className="font-display absolute text-[15px] font-extrabold text-[#1E7A38]"
        style={{ left: '76%', top: '52%' }}
        animate={{ y: [10, -46], opacity: [0, 1, 0] }} transition={{ duration: 4.2, repeat: Infinity, delay: 1, ease: 'easeOut' }}>
        +120
      </motion.span>
      <motion.span className="font-display absolute text-[14px] font-extrabold text-electric"
        style={{ left: '10%', top: '40%' }}
        animate={{ y: [10, -40], opacity: [0, 1, 0] }} transition={{ duration: 4.8, repeat: Infinity, delay: 3, ease: 'easeOut' }}>
        +80
      </motion.span>
      <motion.span className="absolute grid h-11 place-items-center gap-0 rounded-full bg-white/85 px-3.5 shadow-sticker-sm"
        style={{ left: '88%', top: '44%', border: '1px solid rgba(120,100,180,0.10)' }}
        animate={{ y: [0, -12, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
        <span className="font-display text-[13px] font-semibold text-ink">⏱ 10s</span>
      </motion.span>
    </div>
  );
}

export default function AnimatedBackground({ tone = 'hero' }: { tone?: 'hero' | 'soft' | 'cta' }) {
  const reduce = useReducedMotion();
  const isHero = tone === 'hero';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{
        background: tone === 'cta'
          ? 'linear-gradient(180deg,#FFFDF8 0%,#FFF3E8 40%,#F1EBFF 75%,#E8F4FF 100%)'
          : tone === 'soft'
            ? 'linear-gradient(180deg,rgba(255,253,248,0) 0%,#FFFAF2 30%,#F8F9FF 100%)'
            : 'linear-gradient(180deg,#FFFDF8 0%,#FFFAF2 45%,#F8F9FF 100%)',
      }} />
      {isHero && !reduce && (
        <div className="absolute left-1/2 top-[38%] h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 opacity-50 sm:h-[900px] sm:w-[900px]">
          <div className="animate-spin-slower h-full w-full rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(46,155,255,0.10) 40deg, transparent 90deg, rgba(124,92,255,0.12) 150deg, transparent 200deg, rgba(46,155,255,0.10) 260deg, transparent 310deg)' }} />
        </div>
      )}
      <GradientOrb color="#E9E2FF" anim="orbA" className="h-[280px] w-[280px] -left-32 -top-32 opacity-80 sm:h-[440px] sm:w-[440px]" />
      <GradientOrb color="#FFE3D3" anim="orbB" className="h-[260px] w-[260px] right-[-110px] top-[6%] opacity-80 sm:h-[400px] sm:w-[400px]" />
      <GradientOrb color="#D6F5E3" anim="orbA" className="h-[260px] w-[260px] left-[32%] bottom-[-120px] opacity-70" />
      <GradientOrb color="#D6EBFF" anim="orbB" className="h-[300px] w-[300px] left-[55%] top-[30%] opacity-60" />
      {isHero && (
        <>
          <GradientOrb color="#FFE0EC" anim="orbA" className="left-[8%] top-[42%] hidden h-[220px] w-[220px] opacity-60 sm:block" />
          <GradientOrb color="#FFF3C4" anim="orbB" className="right-[16%] top-[58%] hidden h-[200px] w-[200px] opacity-60 sm:block" />
        </>
      )}
      <div className="qr-dotgrid absolute inset-0 opacity-60" />
      {!reduce && (
        <svg className="absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none" viewBox="0 0 1200 800">
          <path className={isHero ? 'animate-dash-march' : undefined} d="M-40,140 C240,80 420,220 700,150 S1050,80 1260,160" fill="none" stroke="#C9BFF5" strokeWidth="2.5" strokeDasharray="2 12" strokeLinecap="round" />
          <path className={isHero ? 'animate-dash-march-rev' : undefined} d="M-40,640 C280,600 520,720 820,640 S1080,580 1260,620" fill="none" stroke="#F5C9B8" strokeWidth="2.5" strokeDasharray="2 12" strokeLinecap="round" />
        </svg>
      )}
      {isHero && <StarField />}
      {isHero && <BrainWatermark />}
      {isHero && !reduce && (
        <div className="hidden min-[480px]:block">
          <QuizFloats />
        </div>
      )}
      {isHero && !reduce && (
        <div className="animate-shimmer-sweep absolute inset-y-0 w-[38%] opacity-60" style={{ background: 'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)' }} />
      )}
      <FloatingParticles count={isHero ? 22 : 12} />
    </div>
  );
}
