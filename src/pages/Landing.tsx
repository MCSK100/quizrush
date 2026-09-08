import { useState } from 'react';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import CategoryExplorer from '../components/landing/CategoryExplorer';
import LiveQuizDemo from '../components/landing/LiveQuizDemo';
import MultiplayerRace from '../components/landing/MultiplayerRace';
import { AIQuestionSection, FinalCTA, SiteFooter } from '../components/landing/AIAndClosing';
import AnimatedBackground from '../components/landing/AnimatedBackground';

export default function Landing() {
  const [glow, setGlow] = useState('');
  return (
    <div className="relative min-w-0 overflow-x-clip bg-cream text-ink">
      <Hero />
      <div className="relative overflow-x-clip">
        <AnimatedBackground tone="soft" />
        <div className="relative">
          <HowItWorks />
        </div>
      </div>
      <div className="relative overflow-x-clip transition-all duration-500" style={glow ? { background: `radial-gradient(min(800px,100vw) 340px at 50% 20%, ${glow}, transparent 70%)` } : undefined}>
        <CategoryExplorer onHoverGlow={setGlow} />
      </div>
      <LiveQuizDemo />
      <MultiplayerRace />
      <AIQuestionSection />
      <FinalCTA />
      <SiteFooter />
    </div>
  );
}
