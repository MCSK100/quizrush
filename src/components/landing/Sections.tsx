import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 26, scale: 0.985 }} whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

export function SectionHead({ eyebrow, title, sub, align = 'left' }: { eyebrow: string; title: React.ReactNode; sub?: string; align?: 'left' | 'center' }) {
  return (
    <Reveal className={align === 'center' ? 'text-center' : ''}>
      <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-grape shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-coral to-grape" /><span className="truncate">{eyebrow}</span>
      </div>
      <h2 className="font-display mt-4 text-balance text-[1.7rem] leading-[1.1] tracking-tight text-ink sm:text-[42px] sm:leading-[1.04]">{title}</h2>
      {sub && <p className={`mt-3 max-w-xl text-balance text-[15px] font-medium leading-relaxed text-muted sm:text-[15.5px] ${align === 'center' ? 'mx-auto' : ''}`}>{sub}</p>}
    </Reveal>
  );
}

export function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items];
  return (
    <div aria-hidden className="relative overflow-hidden border-y bg-white/60 py-3 backdrop-blur" style={{ borderColor: 'rgba(120,100,180,0.08)' }}>
      <div className="qr-marquee flex w-max items-center gap-8 pr-8">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap text-[13px] font-extrabold tracking-[0.14em] text-ink/50">
            {t} <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-br from-coral to-grape" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function CategoryTile({ name, count, icon, grad, to, pattern }: { name: string; count: number; icon: React.ReactNode; grad: string; glow: string; pattern: string; to: string; image?: string }) {
  return (
    <Link to={to}
      className="group relative block min-w-0 overflow-hidden rounded-[20px] p-4 text-left transition-all duration-300 hover:-translate-y-2 hover:shadow-lift sm:rounded-[24px] sm:p-5"
      style={{ background: grad, boxShadow: '0 18px 40px -20px rgba(80,60,120,0.35)' }}>
      <span aria-hidden className="absolute -right-3 -top-5 font-display text-[60px] font-semibold text-white/25 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 sm:text-[76px]">{pattern}</span>
      <span aria-hidden className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-white/15 blur-xl transition-transform duration-500 group-hover:scale-150" />
      <div className="relative grid h-11 w-11 place-items-center rounded-2xl bg-white/95 text-lg shadow-sticker-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 sm:h-12 sm:w-12 sm:text-xl">{icon}</div>
      <div className="font-display relative mt-3 truncate text-[16px] font-semibold text-white sm:mt-4 sm:text-[19px]">{name}</div>
      <div className="relative mt-0.5 text-[12px] font-bold text-white/85 sm:mt-1 sm:text-[12.5px]">{count} questions →</div>
    </Link>
  );
}
