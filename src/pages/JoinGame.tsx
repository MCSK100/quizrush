import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AVATARS } from '../data/categories';
import { useRoom } from '../stores/app';
import { joinNetRoom, netEnabled, saveNetSession } from '../services/net';
export default function JoinGame() {
  const nav = useNavigate();
  const room = useRoom((s) => s.room);
  const setRoom = useRoom((s) => s.setRoom);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [av, setAv] = useState(AVATARS[0]);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function join() {
    setErr('');
    if (!/^[A-Za-z0-9]{4,6}$/.test(code.trim())) { setErr("Check the code — it's 4–6 letters or numbers."); return; }
    if (name.trim().length < 2) { setErr('Enter a display name (2+ characters).'); return; }
    if (netEnabled()) {
      setBusy(true);
      try {
        const { room: r, you } = await joinNetRoom(code.trim().toUpperCase(), name.trim(), av);
        saveNetSession({ code: r.code, playerId: you, name: name.trim() });
        setRoom(r);
        nav(`/room/${r.code}`);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not join. Check the code.');
      } finally {
        setBusy(false);
      }
      return;
    }
    if (!room || room.code !== code.trim().toUpperCase()) {
      setErr("Couldn't find that room on this device. Ask the host to create one, or start your own.");
      return;
    }
    if (room.players.length >= (room.config.maxPlayers || 8)) { setErr('Room is full. Ask the host for a bigger room.'); return; }
    if (room.status !== 'LOBBY') { setErr('Game already started. Wait for the next match.'); return; }
    if (room.players.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())) { setErr('Name already taken in this room.'); return; }
    const me = { id: 'me-' + Date.now(), name: name.trim(), avatar: av, score: 0, correct: 0, streak: 0, bestStreak: 0, rank: 1, ready: true, isHost: false, connected: true };
    setRoom({ ...room, players: [...room.players, me] });
    nav(`/room/${room.code}`);
  }
  return (
    <div className="mx-auto w-full min-w-0 max-w-md px-4 py-8 sm:px-5 sm:py-12">
      <div className="text-center text-[11px] font-extrabold tracking-[0.18em] text-electric">MULTIPLAYER · JOIN</div>
      <h1 className="mt-2 text-center text-3xl font-black text-ink">Join the <span className="qr-gradient-text">match.</span></h1>
      <div className="qr-surface mt-6 rounded-[24px] p-5 sm:p-6">
        <label className="text-[11px] font-extrabold tracking-[0.16em] text-muted" htmlFor="code">ENTER ROOM CODE</label>
        <input id="code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Q7X9K" maxLength={6}
          className="font-num mt-2 w-full rounded-2xl border-[3px] border-dashed bg-white/90 px-4 py-4 text-center text-3xl font-bold tracking-[0.2em] text-ink outline-none placeholder:text-faint" style={{ borderColor: 'rgba(46,155,255,0.45)' }} />
        <label className="mt-5 block text-[11px] font-extrabold tracking-[0.16em] text-muted" htmlFor="nm">YOUR NAME</label>
        <input id="nm" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya" maxLength={16}
          className="mt-2 w-full rounded-2xl bg-white/90 px-4 py-3.5 font-bold text-ink outline-none placeholder:text-faint" style={{ border: '1.5px solid rgba(120,100,180,0.12)' }} />
        <div className="mt-4 text-[11px] font-extrabold tracking-[0.16em] text-muted">AVATAR</div>
        <div className="mt-2 flex flex-wrap gap-2">{AVATARS.slice(0, 8).map((a) => (
          <button key={a} onClick={() => setAv(a)} aria-pressed={av === a} className="btn-press grid h-11 w-11 place-items-center rounded-2xl bg-white text-xl shadow-sticker-sm" style={{ border: av === a ? '1.5px solid rgba(46,155,255,0.6)' : '1px solid rgba(120,100,180,0.08)' }}>{a}</button>
        ))}</div>
        {err && (
          <div role="alert" className="mt-4 rounded-2xl bg-[#FFE9E9] px-4 py-3 text-sm font-bold text-[#C62828]" style={{ border: '1.5px solid #FF4B5C' }}>
            {err}
            <Link to="/multiplayer/create" className="mt-1 flex items-center gap-1 text-grape hover:underline">Create a room instead <ArrowRight size={14} /></Link>
          </div>
        )}
        <button onClick={join} disabled={busy} className="qr-btn-primary mt-5 w-full justify-center rounded-2xl py-4 font-display text-base disabled:opacity-60">{busy ? 'JOINING…' : 'JOIN GAME →'}</button>
      </div>
    </div>
  );
}
