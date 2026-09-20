import { Suspense, lazy, useState } from 'react';
import Hero from '../components/landing/Hero';
import AnimatedBackground from '../components/landing/AnimatedBackground';
import ParallaxSection from '../components/landing/ParallaxSection';

// Below-fold sections are lazy so first paint only pays for the Hero.
const HowItWorks = lazy(() => import('../components/landing/HowItWorks'));
const CategoryExplorer = lazy(() => import('../components/landing/CategoryExplorer'));
const LiveQuizDemo = lazy(() => import('../components/landing/LiveQuizDemo'));
const MultiplayerRace = lazy(() => import('../components/landing/MultiplayerRace'));
const AIQuestionSection = lazy(() => import('../components/landing/AIAndClosing').then((m) => ({ default: m.AIQuestionSection })));
const FinalCTA = lazy(() => import('../components/landing/AIAndClosing').then((m) => ({ default: m.FinalCTA })));
const SiteFooter = lazy(() => import('../components/landing/AIAndClosing').then((m) => ({ default: m.SiteFooter })));

function BelowFoldFallback() {
  return <div className="mx-auto w-full max-w-6xl px-4 py-10" aria-hidden><div className="cf-card h-40 animate-pulse" /></div>;
}

export default function Landing() {
  const [glow, setGlow] = useState('');
  return (
    <div className="relative flex min-h-screen min-w-0 flex-col overflow-x-clip bg-cream text-ink">
      <div className="flex-1">
      <Hero />
      {/* Overlaps hero by 2px + top fade so the video edge melts seamlessly in */}
      <Suspense fallback={<BelowFoldFallback />}>
      <div className="relative -mt-[2px] overflow-x-clip bg-cream pt-[2px]">
        <AnimatedBackground tone="soft" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-12 bg-gradient-to-b from-cream to-transparent" />
        <ParallaxSection depth={0.7} className="relative z-[2]">
          <HowItWorks />
        </ParallaxSection>
      </div>
      <div className="relative overflow-x-clip transition-all duration-500" style={glow ? { background: `radial-gradient(min(800px,100vw) 340px at 50% 20%, ${glow}, transparent 70%)` } : undefined}>
        <ParallaxSection depth={1}>
          <CategoryExplorer onHoverGlow={setGlow} />
        </ParallaxSection>
      </div>
      <ParallaxSection depth={0.85}>
        <LiveQuizDemo />
      </ParallaxSection>
      <ParallaxSection depth={1.15}>
        <MultiplayerRace />
      </ParallaxSection>
      <ParallaxSection depth={0.9}>
        <AIQuestionSection />
      </ParallaxSection>
      <ParallaxSection depth={0.6}>
        <FinalCTA />
      </ParallaxSection>
      </Suspense>
      </div>
      <Suspense fallback={null}>
      <SiteFooter />
      </Suspense>
    </div>
  );
}
