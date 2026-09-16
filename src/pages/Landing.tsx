import { useState } from 'react';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import CategoryExplorer from '../components/landing/CategoryExplorer';
import LiveQuizDemo from '../components/landing/LiveQuizDemo';
import MultiplayerRace from '../components/landing/MultiplayerRace';
import { AIQuestionSection, FinalCTA, SiteFooter } from '../components/landing/AIAndClosing';
import AnimatedBackground from '../components/landing/AnimatedBackground';
import ParallaxSection from '../components/landing/ParallaxSection';

export default function Landing() {
  const [glow, setGlow] = useState('');
  return (
    <div className="relative flex min-h-screen min-w-0 flex-col overflow-x-clip bg-cream text-ink">
      <div className="flex-1">
      <Hero />
      {/* Overlaps hero by 2px + top fade so the video edge melts seamlessly in */}
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
      </div>
      <SiteFooter />
    </div>
  );
}
