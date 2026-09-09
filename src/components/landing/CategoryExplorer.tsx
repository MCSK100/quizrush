import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { iconFor } from '../SetupForm';
import { SectionHead, CategoryTile } from './Sections';

export const CAT_IMAGES: Record<string, string> = {};
const TILE_STYLE: Record<string, { grad: string; glow: string; pattern: string }> = {
  sports: { grad: 'linear-gradient(135deg,#FF8A3D,#F04E23)', glow: 'rgba(255,138,61,0.35)', pattern: '🏟' },
  history: { grad: 'linear-gradient(135deg,#8B5CF6,#5B3DF0)', glow: 'rgba(139,92,246,0.35)', pattern: '🏛' },
  science: { grad: 'linear-gradient(135deg,#38BDF8,#2563EB)', glow: 'rgba(46,155,255,0.35)', pattern: '⚛' },
  geography: { grad: 'linear-gradient(135deg,#00C48C,#059669)', glow: 'rgba(0,196,140,0.32)', pattern: '🗺' },
  tech: { grad: 'linear-gradient(135deg,#22D3EE,#2563EB)', glow: 'rgba(34,211,238,0.35)', pattern: '⌁' },
  movies: { grad: 'linear-gradient(135deg,#FB7185,#E11D48)', glow: 'rgba(244,114,182,0.35)', pattern: '✦' },
  music: { grad: 'linear-gradient(135deg,#A78BFA,#7C3AED)', glow: 'rgba(167,139,250,0.4)', pattern: '♫' },
  kids: { grad: 'linear-gradient(135deg,#FFC531,#FF8A3D)', glow: 'rgba(251,191,36,0.4)', pattern: '☺' },
  tamil: { grad: 'linear-gradient(135deg,#FF8A3D,#7C3AED)', glow: 'rgba(255,122,150,0.4)', pattern: 'அ' },
  gaming: { grad: 'linear-gradient(135deg,#6366F1,#2E9BFF)', glow: 'rgba(99,102,241,0.4)', pattern: '▶' },
};
const FALLBACK = [
  { grad: 'linear-gradient(135deg,#8B5CF6,#22D3EE)', glow: 'rgba(139,92,246,0.35)', pattern: '★' },
  { grad: 'linear-gradient(135deg,#00C48C,#22D3EE)', glow: 'rgba(34,211,238,0.35)', pattern: '●' },
];

export default function CategoryExplorer({ onHoverGlow }: { onHoverGlow: (c: string) => void }) {
  const [, setActive] = useState<string | null>(null);
  const list = CATEGORIES.slice(0, 10);
  return (
    <section className="relative overflow-x-clip py-12 sm:py-20">
      <div className="mx-auto w-full min-w-0 max-w-6xl px-4 sm:px-5">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <SectionHead eyebrow="CATEGORIES" title={<>Pick your <span className="qr-gradient-text">playground.</span></>} sub="Every tile has its own vibe. Hover to feel the spotlight glow." />
          </div>
          <Link to="/categories" className="group flex shrink-0 items-center gap-1.5 self-start rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-ink shadow-soft transition-transform hover:-translate-y-0.5 sm:self-auto" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
            View all <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {list.map((c, i) => {
            const s = TILE_STYLE[c.id] ?? FALLBACK[i % 2];
            return (
              <motion.div key={c.id} initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ delay: (i % 5) * 0.07, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                onMouseEnter={() => { setActive(c.id); onHoverGlow(s.glow); }} onMouseLeave={() => { setActive(null); onHoverGlow(''); }}>
                <CategoryTile name={c.name} count={c.count} icon={iconFor(c.icon)} grad={s.grad} glow={s.glow} pattern={s.pattern} to={`/solo?cat=${c.id}`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
