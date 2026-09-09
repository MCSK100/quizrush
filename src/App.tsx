import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import SoloSetup from './pages/SoloSetup';
import SoloPlay from './pages/SoloPlay';
import SoloResults from './pages/SoloResults';
import MultiplayerHome from './pages/MultiplayerHome';
import CreateGame from './pages/CreateGame';
import JoinGame from './pages/JoinGame';
import RoomLobby from './pages/RoomLobby';
import RoomPlay from './pages/RoomPlay';
import RoomResults from './pages/RoomResults';
import Categories from './pages/Categories';
import LeaderboardPage from './pages/LeaderboardPage';
import Profile from './pages/Profile';
import SettingsPage from './pages/SettingsPage';
import About from './pages/About';
import Faq from './pages/Faq';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { useEffect } from 'react';

function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let dead = false;
    (async () => {
      const { default: Lenis } = await import('lenis');
      if (dead) return;
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      const loop = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(loop); };
      raf = requestAnimationFrame(loop);
    })();
    return () => { dead = true; cancelAnimationFrame(raf); lenis?.destroy(); };
  }, []);
}

function Shell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const isHome = loc.pathname === '/';
  useLenis();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  if (isHome) return <div className="flex min-h-screen flex-col bg-cream font-body text-ink"><Navbar /><main className="flex-1">{children}</main></div>;
  return (
    <div className="flex min-h-screen flex-col bg-cream font-body text-ink">
      <Navbar />
      <main className="flex-1 pt-[88px]">{children}</main>
      <footer className="border-t border-line bg-cream py-8">
        <div className="cf-wrap flex flex-col items-center justify-between gap-4 text-[13px] text-muted sm:flex-row">
          <span className="flex items-center gap-2"><img src="/quizlly-favicon.png" alt="Quizlly" className="h-6 w-6 rounded-md object-cover" /><b className="text-ink">Quizlly</b> · Think fast. Play smarter.</span>
          <span className="flex gap-5 font-medium"><Link className="hover:text-ink" to="/about">About</Link><Link className="hover:text-ink" to="/faq">FAQ</Link><Link className="hover:text-ink" to="/privacy">Privacy</Link><Link className="hover:text-ink" to="/terms">Terms</Link></span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Shell>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/solo" element={<SoloSetup />} /><Route path="/solo/setup" element={<SoloSetup />} /><Route path="/solo/play" element={<SoloPlay />} /><Route path="/solo/results" element={<SoloResults />} />
          <Route path="/multiplayer" element={<MultiplayerHome />} /><Route path="/multiplayer/create" element={<CreateGame />} /><Route path="/multiplayer/join" element={<JoinGame />} />
          <Route path="/room/:roomCode" element={<RoomLobby />} /><Route path="/room/:roomCode/play" element={<RoomPlay />} /><Route path="/room/:roomCode/results" element={<RoomResults />} />
          <Route path="/categories" element={<Categories />} /><Route path="/leaderboard" element={<LeaderboardPage />} /><Route path="/profile" element={<Profile />} /><Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<About />} /><Route path="/faq" element={<Faq />} /><Route path="/privacy" element={<Privacy />} /><Route path="/terms" element={<Terms />} />
          <Route path="*" element={<div className="cf-wrap py-24 text-center"><h1 className="cf-h2">Page not found</h1><p className="cf-sub mt-2">That quiz flew away.</p><Link to="/" className="cf-btn-black mt-5 inline-flex px-6 py-3 text-[15px]">Back home</Link></div>} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
