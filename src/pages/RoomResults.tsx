import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { sound } from '../services/engine';
import { useRoom } from '../stores/app';
import { loadNetSession } from '../services/net';
import type { Player } from '../types';

function Board({ rows, meId, code, againTo }: { rows: Player[]; meId: string; code: string; againTo: string }) {
  const sorted = [...rows].sort((a, b) => b.score - a.score);
  const me = sorted.find((r) => r.id === meId);
  const myRank = sorted.findIndex((r) => r.id === meId) + 1 || sorted.length;
  const meScore = me?.score ?? 0;
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-warn text-white"><Trophy size={36} strokeWidth={2.5} /></motion.div>
      <h1 className="mt-4 text-4xl font-black">{myRank === 1 ? 'YOU WIN! 🏆' : `YOU BEAT ${Math.max(0, sorted.length - myRank)} PLAYER${sorted.length - myRank === 1 ? '' : 'S'}`}</h1>
      <p className="font-num mt-2 text-5xl font-black text-neon">{meScore.toLocaleString()}</p>
      <div className="mt-6 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-3 text-left">
        {sorted.slice(0, 8).map((p, i) => (
          <motion.div layout key={p.id} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${i === 0 ? 'bg-warn/10 border border-warn/40' : p.id === meId ? 'bg-[#EDE9FE] border border-neon/40' : 'border border-transparent'}`}>
            <span className="font-num w-6 font-black">{i + 1}</span><span className="text-xl">{p.avatar}</span><span className="flex-1 truncate font-bold">{p.id === meId ? 'You' : p.name}</span><span className="font-num font-bold">{p.score.toLocaleString()}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-4 flex gap-2"><Link to={againTo} className="btn-press flex-1 rounded-lg bg-neon py-3.5 text-center font-black text-white">PLAY AGAIN</Link><Link to="/" className="btn-press flex-1 rounded-lg border border-[#2D1B4E]/15 py-3.5 text-center font-black">HOME</Link></div>
      <p className="mt-3 text-[12px] font-bold text-muted">Room {code}</p>
    </div>
  );
}

export default function RoomResults() {
  const { roomCode } = useParams();
  const code = (roomCode || '').toUpperCase();
  const room = useRoom((s) => s.room);
  useEffect(() => { sound.play('fanfare'); }, []);
  const data = useMemo(() => { try { return JSON.parse(sessionStorage.getItem('qr-room-result') || 'null'); } catch { return null; } }, []);
  const net = useMemo(() => { try { return JSON.parse(sessionStorage.getItem('qr-net-result') || 'null') as { rows: Player[]; code: string; you: string } | null; } catch { return null; } }, []);
  const session = loadNetSession();
  if (net && net.code === code && Array.isArray(net.rows)) {
    const you = net.you || session?.playerId || 'me';
    return <Board rows={net.rows} meId={you} code={code} againTo={`/room/${code}`} />;
  }
  const rows = [...(room?.players ?? [])].sort((a, b) => b.score - a.score);
  const localMe = (data as { meId?: string } | null)?.meId || 'me';
  return <Board rows={rows} meId={localMe} code={code} againTo={`/room/${code}/play`} />;
}
