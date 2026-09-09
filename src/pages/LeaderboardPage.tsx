import { Link } from 'react-router-dom';
import { Crown, Play } from 'lucide-react';
import { loadProfile } from '../stores/app';
import { fmt } from '../services/engine';
export default function LeaderboardPage() {
  const me = loadProfile() as { games?: number; wins?: number; totalScore?: number; totalCorrect?: number; totalQ?: number; bestStreak?: number; history?: number[] };
  const games = me.games || 0;
  const acc = me.totalQ ? Math.round(((me.totalCorrect || 0) / me.totalQ) * 100) : 0;
  const best = Math.max(0, ...(me.history || [0]));
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-[11px] font-extrabold tracking-[0.18em] text-electric">LEADERBOARD</div>
      <h1 className="font-display mt-2 text-3xl tracking-tight text-ink sm:text-4xl">Your <span className="qr-gradient-text">board.</span></h1>
      <p className="mt-2 text-sm font-medium text-muted">Saved on this device. Global live boards arrive with the multiplayer server.</p>
      {games === 0 ? (
        <div className="qr-surface mt-6 rounded-[24px] p-8 text-center">
          <Crown size={32} className="mx-auto text-sunny" />
          <p className="font-display mt-3 text-xl text-ink">No legends yet.</p>
          <p className="mt-1 text-sm font-medium text-muted">Play your first quiz to claim the top spot.</p>
          <Link to="/solo" className="qr-btn-primary mt-5 inline-flex px-6 py-3 text-[15px]"><Play size={16} strokeWidth={3} /> Play solo</Link>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[[String(games), 'GAMES'], [String(me.wins || 0), 'WINS'], [acc + '%', 'ACCURACY'], [fmt(best), 'BEST SCORE']].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-white p-4 text-center shadow-card" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
                <div className="font-num text-2xl font-extrabold text-ink">{v}</div>
                <div className="mt-0.5 text-[10px] font-extrabold tracking-widest text-muted">{l}</div>
              </div>
            ))}
          </div>
          <div className="qr-surface mt-4 rounded-[24px] p-2">
            <div className="grid grid-cols-[40px_1fr_80px] items-center rounded-2xl px-3 py-2.5" style={{ background: '#E8F4FF', border: '1px solid rgba(46,155,255,0.4)' }}>
              <span className="font-num flex items-center gap-1 text-sm font-extrabold text-ink"><Crown size={14} className="text-sunny" /></span>
              <span className="flex items-center gap-2 text-sm font-extrabold text-ink"><span className="grid h-8 w-8 place-items-center rounded-full bg-ink text-[10px] text-white">YO</span>You</span>
              <span className="font-num text-right text-sm font-extrabold text-ink">{fmt(me.totalScore || 0)}</span>
            </div>
            <p className="px-3 py-2 text-center text-[12px] font-bold text-muted">Total {fmt(me.totalScore || 0)} pts across {games} game{games === 1 ? '' : 's'} · best streak ×{me.bestStreak || 0}</p>
          </div>
        </>
      )}
    </div>
  );
}
