import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Copy, Share2, Users } from 'lucide-react';
import { RoomCodeBig } from '../components/board';
import { useRoom, withoutBots } from '../stores/app';
import type { Player } from '../types';
import { generateQuestions } from '../services/questions';
export default function RoomLobby() {
  const { roomCode } = useParams();
  const nav = useNavigate();
  const room = useRoom((s) => s.room);
  const setRoom = useRoom((s) => s.setRoom);
  useEffect(() => { if (!room || room.code !== roomCode) nav('/multiplayer/join', { replace: true }); }, [room, roomCode, nav]);
  useEffect(() => {
    if (!room) return;
    const clean = withoutBots(room);
    if (clean !== room) setRoom(clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.code]);
  if (!room) return null;
  const isHost = room.players[0]?.isHost;
  const alone = room.players.length < 2;
  async function start() {
    const r = room;
    if (!r) return;
    setRoom({ ...r, status: 'COUNTDOWN' });
    const { questions } = await generateQuestions(r.config);
    sessionStorage.setItem('qr-room-qs', JSON.stringify(questions));
    nav(`/room/${r.code}/play`);
  }
  return (
    <div className="mx-auto w-full min-w-0 max-w-3xl px-4 py-6 sm:px-5 sm:py-10">
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-[11px] font-extrabold tracking-[0.18em] text-muted">ROOM</div><div className="font-num text-2xl font-extrabold text-ink">{room.code}</div></div>
        <div className="text-right"><div className="text-[11px] font-extrabold tracking-[0.18em] text-muted">PLAYERS</div><div className="font-num text-2xl font-extrabold text-coralDeep">{room.players.length} / {room.config.maxPlayers || 8}</div></div>
      </div>
      <div className="mt-5 flex justify-center"><RoomCodeBig code={room.code} /></div>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button onClick={() => navigator.clipboard?.writeText(room.code)} className="btn-press flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}><Copy size={14} /> COPY CODE</button>
        <button onClick={() => navigator.clipboard?.writeText(location.href)} className="btn-press flex items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-ink shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}><Share2 size={14} /> SHARE</button>
      </div>
      <div className="qr-surface mt-5 rounded-[24px] p-4 sm:p-5">
        <div className="mb-3 text-[11px] font-extrabold tracking-[0.16em] text-muted">SETTINGS · {room.config.count} QS · {room.config.timer}s · {String(room.config.category).toUpperCase()} · {String(room.config.difficulty).toUpperCase()}</div>
        <div className="grid gap-2 sm:grid-cols-2">
          {room.players.map((p: Player) => (
            <motion.div layout key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
              <span className="text-2xl" aria-hidden>{p.avatar}</span><span className="min-w-0 flex-1 truncate font-bold text-ink">{p.name}</span>
              {p.isHost ? <span className="qr-btn-primary px-2 py-0.5 text-[10px] font-extrabold">HOST</span> : <span className={`text-xs font-bold ${p.ready ? 'text-[#1E7A38]' : 'text-muted'}`}>{p.ready ? '✓ Ready' : 'Waiting…'}</span>}
            </motion.div>
          ))}
        </div>
        {alone && (
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-[#F8F9FF] px-4 py-3.5" style={{ border: '1.5px dashed rgba(124,92,255,0.35)' }}>
            <Users size={18} className="shrink-0 text-grape" />
            <p className="text-[13px] font-bold text-muted">Just you so far — share the code and friends join straight into this lobby.</p>
          </div>
        )}
      </div>
      {isHost ? (
        <button onClick={start} className="qr-btn-primary mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-display text-base"><Play strokeWidth={3} /> START GAME</button>
      ) : (
        <p className="mt-4 rounded-2xl bg-white p-4 text-center text-sm font-bold text-muted shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>Waiting for host to start… get ready. {room.config.timer} seconds. One answer. Zero excuses.</p>
      )}
    </div>
  );
}
