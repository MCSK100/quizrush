import { Link } from 'react-router-dom';
import TerminalWindow from './TerminalWindow';
import { Reveal } from '../landing/Sections';

const NOTICES = [
  { t: 'STREAK ADVISORY', d: 'Secure your combo. 3+ correct in a row triggers bonus boarding points.', c: '#A3E635' },
  { t: 'HAVE YOU SEEN THIS COMBO?', d: 'A 9-streak was last seen at the Comet Observatory. Report it to R.O.B.', c: '#FBBF24' },
  { t: 'THEFT ADVISORY', d: 'Beware answer thieves in live rooms. Lock fast — timing may vary.', c: '#F472B6' },
];

const LOST = [
  { e: '🍄', n: 'Super Mushroom', d: 'Size fluctuations may occur.' },
  { e: '🐢', n: 'Green Shell', d: 'Recovered without Koopa.' },
  { e: '🎒', n: 'Igloo Backpack', d: 'Keeps streaks from thawing.' },
  { e: '📖', n: 'Unfinished Novel', d: 'Found near Gate F-13.' },
];

export default function TerminalHub() {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14">
      <div className="grid gap-4 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <TerminalWindow title="TRAVELER NOTICES · READ BEFORE BOARDING">
            <div className="grid gap-2 p-4 sm:grid-cols-3">
              {NOTICES.map((n) => (
                <div key={n.t} className="rounded-xl bg-white/[0.04] p-3" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="gg-split text-[10px] font-bold tracking-[0.18em]" style={{ color: n.c }}>⚠ {n.t}</div>
                  <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-300">{n.d}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
              <span className="text-[11px] font-bold text-slate-400">Current conditions: clear skies · high visibility · fast fingers required.</span>
              <Link to="/solo" className="text-[11px] font-extrabold text-amber-200 hover:text-amber-100">VIEW BOARDING TIMES →</Link>
            </div>
          </TerminalWindow>
        </Reveal>
        <Reveal delay={0.1}>
          <TerminalWindow title="GALACTIC PASSPORT">
            <div className="p-4">
              <div className="gg-ticket rounded-xl p-3 text-center" style={{ border: '1px dashed rgba(251,191,36,0.5)' }}>
                <div className="gg-split text-[10px] font-bold tracking-[0.24em] text-amber-200">✦ QUIZRUSH PASSPORT ✦</div>
                <div className="mt-2 flex justify-center gap-1.5 text-2xl">
                  {['🪐', '⭐', '🏆', '⚡'].map((e) => (
                    <span key={e} className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.07]" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>{e}</span>
                  ))}
                </div>
                <p className="mt-2 text-[11px] font-bold text-slate-300">4 planetary badges · collect all 12</p>
              </div>
              <Link to="/profile" className="qr-btn-lime mt-3 block rounded-xl px-4 py-2.5 text-center text-xs font-extrabold text-black">OPEN MY PASSPORT</Link>
            </div>
          </TerminalWindow>
        </Reveal>
      </div>
      <Reveal delay={0.08}>
        <TerminalWindow title="LOST & FOUND · LOGGED BY TERMINAL SECURITY" className="mt-4">
          <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-4">
            {LOST.map((l) => (
              <div key={l.n} className="rounded-xl bg-white/[0.04] p-3 text-center" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="text-3xl">{l.e}</div>
                <div className="mt-1 text-xs font-extrabold text-white">{l.n}</div>
                <div className="text-[11px] font-medium text-slate-400">{l.d}</div>
              </div>
            ))}
          </div>
        </TerminalWindow>
      </Reveal>
    </section>
  );
}
