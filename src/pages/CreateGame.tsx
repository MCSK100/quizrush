import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import SetupForm from '../components/SetupForm';
import { regionLabel } from '../data/regions';
import type { GameMode, QuizConfig } from '../types';
import { newRoom, useRoom } from '../stores/app';
import { createNetRoom, netEnabled, saveNetSession } from '../services/net';
const SOFT = { border: '1px solid rgba(120,100,180,0.08)' } as const;
export default function CreateGame() {
  const nav = useNavigate();
  const setRoom = useRoom((s) => s.setRoom);
  const [name, setName] = useState('');
  const [cfg, setCfg] = useState<QuizConfig>({ category: 'mixed', count: 20, timer: 30, difficulty: 'mixed', region: 'global', mode: 'classic', maxPlayers: 8, language: 'en', questionType: 'mcq', focus: 'global' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  async function create() {
    if (name.trim().length < 2) { setErr('Enter a display name (2+ characters).'); return; }
    const liveCfg = netEnabled() && cfg.timer <= 0 ? { ...cfg, timer: 10 } : cfg;
    if (netEnabled()) {
      setErr('');
      setBusy(true);
      try {
        const { room, you } = await createNetRoom(liveCfg, name.trim(), '👑');
        saveNetSession({ code: room.code, playerId: you, name: name.trim() });
        setRoom(room);
        nav(`/room/${room.code}`, { replace: true });
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Could not reach the game server. Try again.');
      } finally {
        setBusy(false);
      }
      return;
    }
    const room = newRoom(name.trim(), cfg);
    room.config.mode = cfg.mode;
    room.config.maxPlayers = cfg.maxPlayers;
    setRoom(room);
    nav(`/room/${room.code}`, { replace: true });
  }
  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-8 sm:px-5 sm:py-12">
      <div className="text-[11px] font-extrabold tracking-[0.18em] text-electric">MULTIPLAYER · CREATE</div>
      <h1 className="font-display mt-2 text-balance text-3xl tracking-tight text-ink sm:text-4xl">Create your <span className="qr-gradient-text">game.</span></h1>
      <p className="mt-2 text-sm font-medium text-muted">Set the stage, share the code, and play live together in real time.</p>
      <div className="qr-surface mt-6 rounded-[24px] p-4 sm:p-6">
        <label className="text-[11px] font-extrabold tracking-[0.16em] text-muted" htmlFor="hname">YOUR NAME</label>
        <input id="hname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun" maxLength={16}
          className="mt-2 w-full rounded-2xl bg-white/90 px-4 py-3.5 font-bold text-ink outline-none transition-all placeholder:text-faint focus:bg-white" style={{ ...SOFT, borderWidth: 1.5 }} />
        <div className="mt-6"><SetupForm value={cfg} onChange={setCfg} /></div>
        <div className="mt-6">
          <div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-muted">MAX PLAYERS</div>
          <div className="grid grid-cols-5 gap-2">
            {[2, 4, 8, 16, 32].map((n) => (
              <button key={n} onClick={() => setCfg({ ...cfg, maxPlayers: n })} aria-pressed={cfg.maxPlayers === n}
                className={`btn-press rounded-2xl py-3 font-num text-sm font-extrabold transition-all ${cfg.maxPlayers === n ? 'qr-btn-primary' : 'bg-white/80 text-ink hover:bg-white'}`}
                style={cfg.maxPlayers === n ? undefined : SOFT}>{n}</button>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-muted">GAME MODE</div>
          <div className="grid grid-cols-3 gap-2">
            {(['classic', 'speed', 'elimination'] as GameMode[]).map((m) => (
              <button key={m} onClick={() => setCfg({ ...cfg, mode: m })} aria-pressed={cfg.mode === m}
                className={`btn-press rounded-2xl py-3 text-xs font-extrabold uppercase transition-all ${cfg.mode === m ? 'qr-btn-primary justify-center' : 'bg-white/80 text-ink hover:bg-white'}`}
                style={cfg.mode === m ? undefined : SOFT}>{m === 'speed' ? 'Speed Run' : m}</button>
            ))}
          </div>
        </div>
        {err && <p role="alert" className="mt-4 rounded-2xl bg-[#FFE9E9] px-4 py-3 text-sm font-bold text-[#C62828]" style={{ border: '1.5px solid #FF4B5C' }}>{err}</p>}
      </div>
      <button onClick={create} disabled={busy} className="qr-btn-primary group mt-4 w-full justify-center rounded-2xl py-4 font-display text-base tracking-wide disabled:opacity-60">
        <Play size={18} strokeWidth={3} /> {busy ? 'CREATING ROOM…' : 'CREATE ROOM'} {!busy && <ArrowRight size={18} className="arrow-nudge" />}
      </button>
      <p className="mt-3 text-center text-[12px] font-bold text-muted">{cfg.count} questions · {cfg.timer > 0 ? `${cfg.timer}s each` : 'No timer'} · up to {cfg.maxPlayers} players · {regionLabel(cfg.focus === 'india' ? 'india' : cfg.region).toUpperCase()}</p>
    </div>
  );
}
