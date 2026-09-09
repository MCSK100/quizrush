import { Suspense, lazy, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import BrainScene from './BrainScene';

const BrainCanvas = lazy(() => import('./BrainCanvas'));

function webglOK() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

/* Crisp DOM quiz UI floating over the 3D scene */
function Overlays() {
  return (
    <>
      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.4 }}
        className="absolute left-0 top-10 hidden rounded-2xl bg-white/95 px-3 py-2 shadow-soft backdrop-blur sm:block" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
        <div className="text-[11px] font-extrabold text-ink">Mars?</div>
        <div className="mt-1 flex gap-1"><span className="h-1.5 w-8 rounded-full bg-mint" /><span className="h-1.5 w-4 rounded-full bg-ink/10" /></div>
      </motion.div>
      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 4.6, repeat: Infinity, delay: 1 }}
        className="absolute right-0 top-32 hidden items-center gap-1.5 rounded-full bg-white/95 py-1.5 pl-1.5 pr-3 shadow-soft backdrop-blur sm:flex" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
        <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-grape to-electric text-[11px] font-extrabold text-white">AR</span>
        <span className="text-xs font-extrabold text-ink">+120</span>
      </motion.div>
      <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3.6, repeat: Infinity, delay: 0.8 }}
        className="absolute bottom-16 left-6 flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-extrabold text-white shadow-lift">
        <Sparkles size={13} className="text-sunny" /> 7s streak
      </motion.div>
      <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 5.2, repeat: Infinity }}
        className="absolute right-4 top-2 rounded-2xl bg-gradient-to-br from-electric to-grape px-3 py-2 text-white shadow-lift">
        <div className="font-display text-lg leading-none">Q7</div>
        <div className="text-[10px] font-bold opacity-90">/ 20</div>
      </motion.div>
      <div aria-hidden className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-3">
        {['PK', 'AR', 'SJ'].map((t, i) => (
          <motion.span key={t} animate={{ y: [0, -8, 0] }} transition={{ duration: 3.4, repeat: Infinity, delay: i * 0.5 }}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/95 text-[11px] font-extrabold shadow-soft backdrop-blur"
            style={{ border: '1px solid rgba(120,100,180,0.08)', color: ['#2E9BFF', '#7C5CFF', '#38BDF8'][i] }}>{t}</motion.span>
        ))}
      </div>
    </>
  );
}

export default function BrainHero() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState<'3d' | 'simple' | 'css'>('css');
  useEffect(() => {
    if (reduce || !webglOK()) { setMode('css'); return; }
    setMode(window.innerWidth < 640 ? 'simple' : '3d');
  }, [reduce]);

  if (mode === 'css') return <BrainScene />;

  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[560px] sm:h-[520px]" role="img" aria-label="Interactive 3D quiz brain with orbiting game elements">
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl sm:h-[400px] sm:w-[400px]"
        style={{ background: 'radial-gradient(circle at 35% 30%, #FFE3D3 0%, #E9E2FF 45%, #D6EBFF 75%, transparent 100%)' }} />
      <Suspense fallback={<BrainScene />}>
        <BrainCanvas simple={mode === 'simple'} />
      </Suspense>
      <div className="pointer-events-none absolute inset-0"><Overlays /></div>
    </div>
  );
}
