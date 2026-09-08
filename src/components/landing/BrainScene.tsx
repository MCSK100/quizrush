import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { Brain, Zap, Trophy, Star, Timer, Sparkles } from 'lucide-react';

function Orbit({ radius, duration, reverse, children }: { radius: number; duration: number; reverse?: boolean; children: React.ReactNode }) {
  return (
    <div aria-hidden className={`absolute left-1/2 top-1/2 ${reverse ? 'animate-orbit-rev' : 'animate-orbit'}`}
      style={{ width: radius * 2, height: radius * 2, marginLeft: -radius, marginTop: -radius, animationDuration: `${duration}s` }}>
      {children}
    </div>
  );
}

function OrbitDot({ angle, children }: { angle: number; children: React.ReactNode }) {
  const r = 50;
  const x = 50 + r * Math.cos((angle * Math.PI) / 180);
  const y = 50 + r * Math.sin((angle * Math.PI) / 180);
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}>
      {children}
    </div>
  );
}

export default function BrainScene() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 90, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 90, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="relative mx-auto flex h-[400px] w-full min-w-0 max-w-[560px] items-center justify-center overflow-visible min-[480px]:h-[440px] sm:h-[540px]" role="img" aria-label="Animated quiz brain with orbiting quiz icons">
      <div aria-hidden className="absolute h-[280px] w-[280px] rounded-full opacity-90 blur-3xl min-[480px]:h-[360px] min-[480px]:w-[360px] sm:h-[440px] sm:w-[440px]"
        style={{ background: 'radial-gradient(circle at 35% 30%, #FFE3D3 0%, #E9E2FF 45%, #D6EBFF 75%, transparent 100%)' }} />
      <div aria-hidden className="absolute h-[220px] w-[220px] rounded-full bg-white/50 blur-2xl sm:h-[280px] sm:w-[280px]" />

      {!reduce && (
        <div aria-hidden className="absolute inset-0 origin-center scale-[0.62] min-[480px]:scale-[0.8] sm:scale-100">
          <Orbit radius={200} duration={26}>
            <OrbitDot angle={10}><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/90 font-display text-xl text-coral shadow-soft backdrop-blur" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>?</span></OrbitDot>
            <OrbitDot angle={130}><span className="grid h-11 w-11 place-items-center rounded-full bg-white/90 text-grape shadow-soft"><Star size={17} /></span></OrbitDot>
            <OrbitDot angle={250}><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/90 font-display text-sm text-electric shadow-soft">A+</span></OrbitDot>
          </Orbit>
          <Orbit radius={150} duration={32} reverse>
            <OrbitDot angle={60}><span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-coral to-[#F04E23] text-white shadow-neon"><Zap size={16} /></span></OrbitDot>
            <OrbitDot angle={210}><span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-sunny shadow-soft"><Trophy size={16} /></span></OrbitDot>
            <OrbitDot angle={330}><span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-mint shadow-soft"><Timer size={16} /></span></OrbitDot>
          </Orbit>
        </div>
      )}

      <motion.div style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 900 }} className="relative min-w-0">
        <motion.div animate={reduce ? undefined : { y: [0, -14, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }} className="relative">
          <div className="relative grid h-52 w-52 place-items-center min-[480px]:h-60 min-[480px]:w-60 sm:h-72 sm:w-72">
            <div className="absolute inset-0 rounded-[48%_52%_55%_45%/48%_45%_55%_52%] bg-gradient-to-br from-[#FF8F5C] via-[#B06BFF] to-[#3DA9FF] shadow-lift" />
            <div className="absolute inset-[10px] rounded-[48%_52%_55%_45%/48%_45%_55%_52%] bg-gradient-to-br from-[#FFB08A] via-[#C9B0FF] to-[#8FCCFF]" />
            <div className="absolute inset-[24px] rounded-[46%_54%_52%_48%/50%_46%_54%_50%] bg-gradient-to-br from-white/40 to-transparent" />
            <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-70">
              <path d="M100 30 C 70 55, 60 90, 100 115 S 140 150, 100 172" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" opacity=".85" />
              <path d="M70 60 C 90 75, 90 110, 65 130 M130 60 C 112 78, 112 112, 136 130" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" opacity=".65" />
              {[ [100,48],[78,84],[122,84],[100,112],[82,132],[120,132],[100,156] ].map(([x,y],i)=>(
                <g key={i}>
                  <circle cx={x} cy={y} r="4.5" fill="white" opacity=".95" />
                  <circle cx={x} cy={y} r="9" fill="white" opacity=".25">
                    {!reduce && <animate attributeName="r" values="7;11;7" dur={`${2 + (i % 3)}s`} repeatCount="indefinite" />}
                  </circle>
                </g>
              ))}
            </svg>
            <div className="relative z-10 grid h-20 w-20 place-items-center rounded-3xl bg-white shadow-soft" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
              <Brain size={40} className="text-grape" strokeWidth={2.2} />
            </div>
          </div>

          <motion.div animate={reduce ? undefined : { y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: .4 }} className="absolute -left-16 top-6 hidden rounded-2xl bg-white/90 px-3 py-2 shadow-soft backdrop-blur sm:block" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
            <div className="text-[12px] font-extrabold text-ink">Mars?</div>
            <div className="mt-1 flex gap-1"><span className="h-1.5 w-8 rounded-full bg-mint" /><span className="h-1.5 w-4 rounded-full bg-ink/10" /></div>
          </motion.div>
          <motion.div animate={reduce ? undefined : { y: [0, 10, 0] }} transition={{ duration: 4.6, repeat: Infinity, delay: 1 }} className="absolute -right-14 top-24 hidden items-center gap-1.5 rounded-full bg-white/90 py-1.5 pl-1.5 pr-3 shadow-soft backdrop-blur sm:flex" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-grape to-electric text-[11px] font-extrabold text-white">AR</span>
            <span className="text-xs font-extrabold text-ink">+120</span>
          </motion.div>
          <motion.div animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 3.6, repeat: Infinity, delay: .8 }} className="absolute -bottom-4 left-2 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-extrabold text-white shadow-lift sm:left-8">
            <Sparkles size={13} className="text-sunny" /> 7s streak
          </motion.div>
          <motion.div animate={reduce ? undefined : { y: [0, 9, 0] }} transition={{ duration: 5.2, repeat: Infinity }} className="absolute -right-2 -top-4 rounded-2xl bg-gradient-to-br from-sunny to-coral px-3 py-2 text-white shadow-lift sm:-right-6">
            <div className="font-display text-lg leading-none">Q7</div>
            <div className="text-[10px] font-bold opacity-90">/ 20</div>
          </motion.div>
        </motion.div>
      </motion.div>

      <div aria-hidden className="absolute bottom-4 flex items-center gap-3">
        {['PK', 'AR', 'SJ'].map((t, i) => (
          <motion.span key={t} animate={reduce ? undefined : { y: [0, -8, 0] }} transition={{ duration: 3.4, repeat: Infinity, delay: i * .5 }}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-[11px] font-extrabold shadow-soft backdrop-blur"
            style={{ border: '1px solid rgba(120,100,180,0.08)', color: ['#FF6B4A', '#7C5CFF', '#2E9BFF'][i] }}>{t}</motion.span>
        ))}
      </div>
    </div>
  );
}
