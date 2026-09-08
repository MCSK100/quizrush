import { useLocation } from 'react-router-dom';

export default function FantasyBg() {
  const loc = useLocation();
  if (loc.pathname === '/') return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'radial-gradient(1200px 600px at 20% -10%, rgba(124,58,237,.28), transparent 60%), radial-gradient(900px 500px at 90% 10%, rgba(34,211,238,.18), transparent 60%), linear-gradient(180deg,#060913,#0B1120 50%,#0F172A)' }} />
      <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1600&q=60&auto=format&fit=crop" alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.10]" loading="lazy" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#060913]/60 via-transparent to-[#060913]" />
      <div className="qr-blob h-[380px] w-[380px] -left-28 -top-28 opacity-40" style={{ background: '#7C3AED' }} />
      <div className="qr-blob h-[320px] w-[320px] right-[-90px] top-[15%] opacity-30" style={{ background: '#06B6D4' }} />
      <div className="qr-dotgrid absolute inset-0 opacity-40" />
    </div>
  );
}
