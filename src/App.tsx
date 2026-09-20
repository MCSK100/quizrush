import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import ErrorBoundary from './components/ErrorBoundary';

// Code-split every non-landing route so the home page ships minimal JS.
// Each page becomes its own chunk loaded on demand.
const SoloSetup = lazy(() => import('./pages/SoloSetup'));
const SoloPlay = lazy(() => import('./pages/SoloPlay'));
const SoloResults = lazy(() => import('./pages/SoloResults'));
const MultiplayerHome = lazy(() => import('./pages/MultiplayerHome'));
const CreateGame = lazy(() => import('./pages/CreateGame'));
const JoinGame = lazy(() => import('./pages/JoinGame'));
const RoomLobby = lazy(() => import('./pages/RoomLobby'));
const RoomPlay = lazy(() => import('./pages/RoomPlay'));
const RoomResults = lazy(() => import('./pages/RoomResults'));
const Categories = lazy(() => import('./pages/Categories'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const Profile = lazy(() => import('./pages/Profile'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const About = lazy(() => import('./pages/About'));
const Faq = lazy(() => import('./pages/Faq'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

function PageFallback() {
  return <div className="cf-wrap py-24 text-center" aria-busy="true"><p className="cf-sub">Loading…</p></div>;
}

function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Lenis smooth-scroll is desktop-only: on touch/mobile it fights the
    // native scroller + IntersectionObserver (sections stuck invisible) and
    // burns CPU on every frame.
    try {
      if (window.innerWidth < 768) return;
      if (window.matchMedia('(pointer: coarse)').matches) return;
      const conn = (navigator as unknown as { connection?: { saveData?: boolean } }).connection;
      if (conn?.saveData) return;
    } catch { return; }
    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let dead = false;
    const onHide = () => { if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(loop); };
    const loop = (t: number) => { lenis?.raf(t); raf = requestAnimationFrame(loop); };
    (async () => {
      const { default: Lenis } = await import('lenis');
      if (dead) return;
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1.02, touchMultiplier: 1.4 });
      raf = requestAnimationFrame(loop);
      document.addEventListener('visibilitychange', onHide);
    })();
    return () => { dead = true; cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', onHide); lenis?.destroy(); };
  }, []);
}

function Shell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const isHome = loc.pathname === '/';
  useLenis();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  if (isHome) return <div className="flex min-h-screen flex-col bg-cream font-body text-ink"><ErrorBoundary><Navbar /></ErrorBoundary><main className="flex-1">{children}</main></div>;
  return (
    <div className="flex min-h-screen flex-col bg-cream font-body text-ink">
      <ErrorBoundary><Navbar /></ErrorBoundary>
      <main className="flex-1 pt-[88px]">{children}</main>
      <footer className="border-t border-line bg-cream py-8">
        <div className="cf-wrap flex flex-col items-center justify-between gap-4 text-[13px] text-muted sm:flex-row">
          <span className="flex items-center gap-2"><img src="/quizlly-logo.png" alt="Quizlly" width={24} height={24} loading="lazy" decoding="async" className="h-6 w-auto object-contain" /><b className="text-ink">Quizlly</b> · Think fast. Play smarter.</span>
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
        <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/solo" element={<SoloSetup />} /><Route path="/solo/setup" element={<SoloSetup />} /><Route path="/solo/play" element={<SoloPlay />} /><Route path="/solo/results" element={<SoloResults />} />
          <Route path="/multiplayer" element={<MultiplayerHome />} /><Route path="/multiplayer/create" element={<CreateGame />} /><Route path="/multiplayer/join" element={<JoinGame />} />
          <Route path="/room/:roomCode" element={<RoomLobby />} /><Route path="/room/:roomCode/play" element={<RoomPlay />} /><Route path="/room/:roomCode/results" element={<RoomResults />} />
          <Route path="/categories" element={<Categories />} /><Route path="/leaderboard" element={<LeaderboardPage />} /><Route path="/profile" element={<Profile />} /><Route path="/settings" element={<SettingsPage />} />
          <Route path="/about" element={<About />} /><Route path="/faq" element={<Faq />} /><Route path="/privacy" element={<Privacy />} /><Route path="/terms" element={<Terms />} />
          <Route path="*" element={<div className="cf-wrap py-24 text-center"><h1 className="cf-h2">Page not found</h1><p className="cf-sub mt-2">That quiz flew away.</p><Link to="/" className="cf-btn-black mt-5 inline-flex px-6 py-3 text-[15px]">Back home</Link></div>} />
        </Routes>
        </Suspense>
        </ErrorBoundary>
      </Shell>
    </BrowserRouter>
  );
}
