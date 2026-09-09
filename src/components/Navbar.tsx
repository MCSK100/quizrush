import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight, Volume2, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePwaInstall } from '../hooks/usePwaInstall';

const LINKS = [
  ['/solo', 'Solo Quiz'],
  ['/multiplayer', 'Multiplayer'],
  ['/categories', 'Categories'],
  ['/leaderboard', 'Leaderboard'],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const { canPrompt, installed, promptInstall } = usePwaInstall();
  async function onInstall() {
    if (canPrompt) {
      await promptInstall();
      setShowHelp(false);
    } else {
      setShowHelp((s) => !s);
    }
  }
  const loc = useLocation();
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 16);
    on(); window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`mx-auto flex h-[64px] max-w-6xl items-center justify-between gap-3 rounded-[20px] px-3 pl-4 pr-2 transition-all duration-300 sm:px-4 ${
          scrolled ? 'bg-white/85 shadow-soft' : 'bg-white/60 shadow-sticker-sm'
        } backdrop-blur-xl`}
        style={{ border: '1px solid rgba(120,100,180,0.08)' }}
      >
        <Link to="/" className="flex items-center gap-2" aria-label="Quizlly home">
          <img src="/quizlly-logo.png" alt="Quizlly" className="h-9 w-auto object-contain" />
        </Link>
        <nav className="hidden items-center gap-1 text-[14px] font-bold text-ink/70 lg:flex">
          {LINKS.map(([h, l]) => (
            <Link key={l} to={h} className={`rounded-full px-4 py-2 transition-colors hover:bg-[#7C5CFF]/[.07] hover:text-ink ${loc.pathname === h ? 'bg-[#7C5CFF]/[.08] text-ink' : ''}`}>{l}</Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <button aria-label="Sound" className="grid h-10 w-10 place-items-center rounded-full bg-[#F8F9FF] text-muted transition-transform hover:scale-105" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
            <Volume2 size={17} />
          </button>
          {!installed && (
            <div className="relative">
              <button onClick={onInstall} className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-extrabold text-ink/70 transition-colors hover:bg-[#7C5CFF]/[.07] hover:text-ink">
                <Download size={16} /> Install App
              </button>
              {showHelp && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl bg-white p-4 text-left text-[13px] font-medium text-muted shadow-soft" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>
                  <b className="text-ink">Get the Quizlly app</b>
                  <p className="mt-1">Android: browser menu ⋮ → Install app / Add to Home screen.</p>
                  <p className="mt-1">iPhone: Share <b>⎙</b> → Add to Home Screen.</p>
                </div>
              )}
            </div>
          )}
          <Link to="/multiplayer/join" className="rounded-full px-4 py-2.5 text-[14px] font-extrabold text-ink/70 transition-colors hover:bg-[#7C5CFF]/[.07] hover:text-ink">Join Game</Link>
          <Link to="/multiplayer/create" className="qr-btn-primary btn-press px-5 py-2.5 text-[14px]">Create Game <ArrowRight size={15} className="arrow-nudge" /></Link>
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-xl text-ink lg:hidden" aria-label="Menu" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="mx-auto mt-2 max-h-[calc(100dvh-100px)] max-w-6xl overflow-y-auto rounded-[20px] bg-white/95 p-3 shadow-soft backdrop-blur-xl lg:hidden" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
          {LINKS.map(([h, l]) => (
            <Link key={h + l} to={h} className="block rounded-xl px-4 py-3 text-[15px] font-bold text-ink hover:bg-[#7C5CFF]/[.06]">{l}</Link>
          ))}
          <div className="mt-1 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
            <Link to="/multiplayer/join" className="qr-btn-ghost justify-center px-4 py-3 text-[14px]">Join Game</Link>
            <Link to="/multiplayer/create" className="qr-btn-primary justify-center px-4 py-3 text-[14px]">Create Game</Link>
          </div>
          {!installed && (
            <button onClick={onInstall} className="qr-btn-ghost mt-2 w-full justify-center px-4 py-3 text-[14px]">
              <Download size={16} /> Install App
            </button>
          )}
          {showHelp && (
            <p className="mt-2 rounded-xl bg-[#F8F9FF] px-4 py-3 text-[13px] font-medium text-muted" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
              Android: browser menu ⋮ → Install app. iPhone: Share ⎙ → Add to Home Screen.
            </p>
          )}
        </div>
      )}
    </header>
  );
}
