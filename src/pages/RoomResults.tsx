import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { sound } from '../services/engine';
import { useRoom } from '../stores/app';
import { loadNetSession } from '../services/net';
import Avatar from '../components/Avatar';
import type { Player } from '../types';

function rankBadge(i: number) {
  if (i === 0) return <span className="rounded-full bg-gradient-to-r from-[#FFB020] to-[#FF8A00] px-2.5 py-0.5 text-[10px] font-extrabold text-white">🥇 1ST</span>;
  if (i === 1) return <span className="rounded-full bg-gradient-to-r from-[#9AA5B1] to-[#6B7A8D] px-2.5 py-0.5 text-[10px] font-extrabold text-white">🥈 2ND</span>;
  return null;
}

function Board({ rows, meId, code, total, againTo }: { rows: Player[]; meId: string; code: string; total: number; againTo: string }) {
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  const me = sorted.find((r) => r.id === meId);
  const myRank = sorted.findIndex((r) => r.id === meId) + 1 || sorted.length;
  const meScore = me?.score ?? 0;
  const winner = sorted[0];
  const [showWinner, setShowWinner] = useState(true);
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <AnimatePresence>
        {showWinner && winner && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm" onClick={() => setShowWinner(false)}>
            <motion.div
              initial={{ scale: 0.6, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="relative w-full max-w-sm rounded-[28px] bg-white p-8 text-center shadow-lift" onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowWinner(false)} aria-label="Close" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-[#F8F9FF] text-muted hover:text-ink"><X size={16} /></button>
              <motion.div animate={{ y: [0, -10, 0], rotate: [0, -4, 4, 0] }} transition={{ duration: 2.4, repeat: Infinity }} className="mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-[#FFB020] to-[#FF8A00] text-6xl shadow-lift">🏆</motion.div>
              <div className="mt-4 text-[11px] font-extrabold tracking-[0.24em] text-muted">WINNER</div>
              <div className="font-display mt-1 truncate text-3xl text-ink">{winner.id === meId ? 'You!' : winner.name}</div>
              <div className="font-num mt-1 text-xl font-extrabold text-neon">{winner.score.toLocaleString()} pts</div>
              {total > 0 && <div className="mt-1 text-sm font-bold text-muted">✓ {Math.min(winner.correct, total)} correct · ✗ {Math.max(0, total - winner.correct)} wrong</div>}
              <button onClick={() => setShowWinner(false)} className="qr-btn-primary mt-5 w-full justify-center rounded-2xl py-3.5 font-display">VIEW BOARD</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-warn text-white"><Trophy size={36} strokeWidth={2.5} /></motion.div>
      <h1 className="mt-4 text-4xl font-black">{myRank === 1 ? 'YOU WIN! 🏆' : `YOU BEAT ${Math.max(0, sorted.length - myRank)} PLAYER${sorted.length - myRank === 1 ? '' : 'S'}`}</h1>
      <p className="font-num mt-2 text-5xl font-black text-neon">{meScore.toLocaleString()}</p>
      <div className="mt-6 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-3 text-left">
        {sorted.slice(0, 8).map((p, i) => (
          <motion.div layout key={p.id} className={`flex items-center gap-2 rounded-lg px-3 py-2.5 sm:gap-3 ${i === 0 ? 'bg-warn/10 border border-warn/40' : p.id === meId ? 'bg-[#EDE9FE] border border-neon/40' : 'border border-transparent'}`}>
            <span className="font-num w-6 shrink-0 font-black">{i + 1}</span>
            <Avatar src={p.avatar} alt={p.name} size={28} />
            <span className="min-w-0 flex-1 truncate font-bold">{p.id === meId ? 'You' : p.name}</span>
            {rankBadge(i)}
            {total > 0 && (
              <span className="font-num hidden shrink-0 text-xs font-bold sm:inline">
                <span className="text-[#1E7A38]">✓{Math.min(p.correct, total)}</span>
                <span className="text-muted"> · </span>
                <span className="text-[#C62828]">✗{Math.max(0, total - p.correct)}</span>
              </span>
            )}
            <span className="font-num shrink-0 font-bold">{p.score.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex gap-2"><Link to={againTo} className="btn-press flex-1 rounded-lg bg-neon py-3.5 text-center font-black text-white">PLAY AGAIN</Link><Link to="/" className="btn-press flex-1 rounded-lg border border-[#2D1B4E]/15 py-3.5 text-center font-black">HOME</Link></div>
      <p className="mt-3 text-[12px] font-bold text-muted">Room {code}{total > 0 ? ` · ${total} questions` : ''}</p>
    </div>
  );
}

export default function RoomResults() {
  const { roomCode } = useParams();
  const code = (roomCode || '').toUpperCase();
  const room = useRoom((s) => s.room);
  useEffect(() => { sound.play('fanfare'); }, []);
  const data = useMemo(() => { try { return JSON.parse(sessionStorage.getItem('qr-room-result') || 'null'); } catch { return null; } }, []);
  const net = useMemo(() => { try { return JSON.parse(sessionStorage.getItem('qr-net-result') || 'null') as { rows: Player[]; code: string; you: string; total?: number } | null; } catch { return null; } }, []);
  const session = loadNetSession();
  if (net && net.code === code && Array.isArray(net.rows)) {
    const you = net.you || session?.playerId || 'me';
    return <Board rows={net.rows} meId={you} code={code} total={Number(net.total ?? 0)} againTo={`/room/${code}`} />;
  }
  const rows = [...(room?.players ?? [])].sort((a, b) => b.score - a.score);
  const localMe = (data as { meId?: string } | null)?.meId || 'me';
  const total = Number((data as { total?: number } | null)?.total ?? 0);
  return <Board rows={rows} meId={localMe} code={code} total={total} againTo={`/room/${code}/play`} />;
}
