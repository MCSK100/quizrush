import { Link } from 'react-router-dom';

export type Departure = {
  dest: string;
  gate: string;
  airline: string;
  status: 'BOARDING' | 'DELAYED' | 'FULL';
  color: string;
  to: string;
  meta: string;
};

export const DEPARTURES: Departure[] = [
  { dest: 'SOLO SPRINT', gate: 'A-01', airline: 'GALAXY AIR', status: 'BOARDING', color: '#A3E635', to: '/solo', meta: '10s rounds · AI deck' },
  { dest: 'SCIENCE GALAXY', gate: 'B-07', airline: 'GALAXY AIR', status: 'BOARDING', color: '#22D3EE', to: '/solo?cat=science', meta: '260 questions' },
  { dest: 'MOVIE NEBULA', gate: 'C-03', airline: 'SUNSHINE AIR', status: 'BOARDING', color: '#F472B6', to: '/solo?cat=movies', meta: '180 questions' },
  { dest: 'FRIENDS ROOM', gate: 'D-21', airline: 'BOOMERANG INTL', status: 'BOARDING', color: '#A78BFA', to: '/multiplayer/create', meta: '4 players · live' },
  { dest: 'TAMIL STARPORT', gate: 'E-09', airline: 'SUNSHINE AIR', status: 'DELAYED', color: '#FBBF24', to: '/solo?cat=tamil', meta: '140 questions' },
  { dest: 'SPACE ODYSSEY', gate: 'F-13', airline: 'GALAXY AIR', status: 'FULL', color: '#67E8F9', to: '/categories', meta: '170 questions' },
];

function Pill({ s }: { s: Departure['status'] }) {
  if (s === 'BOARDING') return <span className="gg-pill gg-pill-live gg-split">● BOARDING</span>;
  if (s === 'DELAYED') return <span className="gg-pill gg-pill-soon gg-split">◷ DELAYED</span>;
  return <span className="gg-pill gg-pill-off gg-split">✕ FULL</span>;
}

export default function DepartureBoard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="gg-board overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between bg-black/50 px-4 py-2.5">
        <span className="gg-split text-[11px] font-bold tracking-[0.24em] text-amber-200">✦ CURRENT DEPARTURES FROM QUIZ TERMINAL</span>
        <span className="gg-flap gg-split rounded px-2 py-1 text-[11px] font-bold text-amber-200">LIVE</span>
      </div>
      <div className={compact ? 'max-h-[340px] overflow-hidden' : ''}>
        {DEPARTURES.map((d) => (
          <Link key={d.gate} to={d.to} className="gg-row group grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.05] sm:grid-cols-[64px_1fr_auto_auto]">
            <span className="gg-flap gg-split hidden rounded px-2 py-1 text-center text-xs font-bold text-amber-100 sm:block">{d.gate}</span>
            <span className="min-w-0">
              <span className="gg-split flex items-center gap-2 truncate text-sm font-bold text-white">
                <i className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                {d.dest}
              </span>
              <span className="mt-0.5 block truncate text-[11px] font-semibold text-slate-400">{d.airline} · {d.meta}</span>
            </span>
            <span className="hidden text-[11px] font-bold tracking-widest text-slate-500 sm:block">{d.airline}</span>
            <Pill s={d.status} />
          </Link>
        ))}
      </div>
      <div className="flex items-center justify-between bg-black/50 px-4 py-2">
        <span className="text-[10px] font-bold tracking-[0.2em] text-slate-500">TIP: CLICK A ROW TO BOARD INSTANTLY</span>
        <span className="gg-split text-[10px] font-bold text-amber-200/70">6 DESTINATIONS</span>
      </div>
    </div>
  );
}
