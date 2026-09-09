import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Starfield from './Starfield';

export default function LaunchIntro() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (!sessionStorage.getItem('qr-launched')) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);
  const enter = () => {
    try {
      sessionStorage.setItem('qr-launched', '1');
    } catch { /* noop */ }
    setOpen(false);
  };
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.06 }}
          className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-[#04060F]"
        >
          <Starfield density={220} />
          <div aria-hidden className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #7C3AED, transparent 65%)' }} />
          <div className="relative px-6 text-center">
            <div className="gg-split text-[11px] font-bold tracking-[0.34em] text-amber-200">QUIZLLY SPACE TERMINAL</div>
            <h1 className="font-display mt-3 text-4xl text-white sm:text-6xl">Something is hidden<br />among the <span className="qr-gradient-text">stars.</span></h1>
            <p className="mx-auto mt-3 max-w-sm text-sm font-medium text-slate-400">To begin travel, tap the Launch Star and visit the flight deck.</p>
            <button onClick={enter} aria-label="Click star to enter" className="group mx-auto mt-8 block">
              <span className="gg-launch-star mx-auto grid h-28 w-28 place-items-center text-7xl">⭐</span>
              <span className="gg-split mt-4 block text-xs font-bold tracking-[0.3em] text-amber-100 group-hover:text-amber-200">CLICK STAR ★ TO ENTER</span>
            </button>
            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-bold tracking-widest text-slate-500">
              <span className="rounded-full bg-white/[0.06] px-3 py-1" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>SOLO</span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>ROOMS</span>
              <span className="rounded-full bg-white/[0.06] px-3 py-1" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>PASSPORT</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
