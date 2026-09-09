import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Sparkles } from 'lucide-react';

const QA: Record<string, string> = {
  start: 'To begin travel, visit the flight deck: pick SOLO SPRINT for a fast run, or CREATE ROOM to challenge friends.',
  solo: 'Solo Sprint boards now at Gate A-01. 10-second rounds, streak bonus, AI-built deck.',
  room: 'Create a room, share the 6-letter code. Friends join from JOIN GAME. First to lock answers climbs fastest.',
  passport: 'Every win stamps your Galactic Passport. Check PROFILE to see badges and your traveler rank.',
  default: 'I am R.O.B., your terminal guide. Ask me: start, solo, room, or passport.',
};

export default function RobGuide() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(QA.default);
  return (
    <div className="fixed bottom-5 right-5 z-[90]">
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }} className="gg-window mb-3 w-[300px] overflow-hidden rounded-2xl">
            <div className="gg-window-bar flex items-center gap-2 px-3 py-2">
              <Bot size={14} className="text-white" />
              <span className="gg-split text-[11px] font-bold tracking-[0.2em] text-white">R.O.B. · TERMINAL GUIDE</span>
              <button aria-label="Close guide" onClick={() => setOpen(false)} className="ml-auto text-white/80 hover:text-white"><X size={14} /></button>
            </div>
            <div className="p-3">
              <div className="flex gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 text-lg">🤖</span>
                <p className="rounded-xl bg-white/[0.07] px-3 py-2 text-xs font-medium leading-relaxed text-slate-200" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>{msg}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['start', 'solo', 'room', 'passport'].map((k) => (
                  <button key={k} onClick={() => setMsg(QA[k])} className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-bold text-cyan-200 hover:bg-white/[0.12]" style={{ border: '1px solid rgba(255,255,255,0.10)' }}>{k.toUpperCase()}</button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <Link to="/solo" className="qr-btn-lime rounded-xl px-3 py-2 text-center text-xs font-extrabold text-black">BOARD SOLO</Link>
                <Link to="/multiplayer/create" className="qr-btn-dark rounded-xl px-3 py-2 text-center text-xs font-extrabold text-white">NEW ROOM</Link>
              </div>
              <p className="mt-2 flex items-center gap-1 text-[10px] font-bold tracking-widest text-slate-500"><Sparkles size={11} /> DEPARTURE TIMING MAY VARY</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Ask R.O.B."
        className="group relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-amber-400 text-2xl shadow-lift"
        style={{ border: '1px solid rgba(255,255,255,0.25)' }}
      >
        <span aria-hidden className="absolute -right-1 -top-1 flex h-4 w-4"><span className="absolute h-full w-full animate-ping rounded-full bg-lime-300" /><span className="h-4 w-4 rounded-full bg-lime-300" /></span>
        {open ? <X size={20} className="text-white" /> : '🤖'}
      </button>
    </div>
  );
}
