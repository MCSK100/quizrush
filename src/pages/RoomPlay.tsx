import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import type { Player, Question } from '../types';
import { calcPoints, sound } from '../services/engine';
import { useServerTimer } from '../hooks/useTimer';
import { AnswerButton, Countdown, ProgressBar, TimerRing } from '../components/game';
import { Leaderboard } from '../components/board';
import { useRoom, withoutBots } from '../stores/app';
const L = ['A', 'B', 'C', 'D'];
export default function RoomPlay() {
  const { roomCode } = useParams();
  const nav = useNavigate();
  const room = useRoom((s) => s.room);
  const setRoom = useRoom((s) => s.setRoom);
  const qs = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('qr-room-qs') || '[]') as Question[];
    } catch {
      return [];
    }
  }, []);
  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<'count' | 'q' | 'reveal'>('count');
  const [count, setCount] = useState(3);
  const [picked, setPicked] = useState<number | null>(null);
  const [me, setMe] = useState(0);
  const [meCorrect, setMeCorrect] = useState(0);
  const [meStreak, setMeStreak] = useState(0);
  const [showBoard, setShowBoard] = useState(false);
  const t0 = useRef(Date.now());
  const lockRef = useRef<(p: number | null) => void>(() => {});
  const timer = room?.config.timer ?? 10;
  const meId = useMemo(() => {
    if (!room) return 'me';
    const joined = room.players.find((x) => !x.isHost && !x.id.startsWith('bot') && !x.id.startsWith('rbot-'));
    if (joined) return joined.id;
    if (room.players.length === 1 && room.players[0].isHost) return room.players[0].id;
    return 'me';
  }, [room?.code]);
  useEffect(() => {
    if (!room || !qs.length) {
      nav(`/room/${roomCode}`, { replace: true });
      return;
    }
    const clean = withoutBots(room);
    if (clean !== room) setRoom(clean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (phase !== 'count') return;
    if (count <= 0) {
      setPhase('q');
      t0.current = Date.now();
      sound.play('go');
      return;
    }
    sound.play('count');
    const t = setTimeout(() => setCount((c) => c - 1), 700);
    return () => clearTimeout(t);
  }, [phase, count]);
  function lock(p: number | null) {
    if (phase !== 'q' || !room) return;
    const q = qs[qi];
    if (!q) return;
    const el = (Date.now() - t0.current) / 1000;
    const ok = p === q.correctAnswer;
    const pts = ok ? calcPoints(timer, el, meStreak, room.config.mode) : 0;
    setPicked(p);
    setMe((m) => m + pts);
    setMeCorrect((c) => c + (ok ? 1 : 0));
    setMeStreak((s) => (ok ? s + 1 : 0));
    if (ok) sound.play('correct');
    else sound.play('wrong');
    setPhase('reveal');
    const prev = room.players.find((x) => x.id === meId);
    const meEntry: Player = {
      ...(prev ?? { id: meId, name: 'You', avatar: '⚡', ready: true, isHost: false, connected: true } as Player),
      id: meId,
      name: prev?.name ?? 'You',
      avatar: prev?.avatar ?? '⚡',
      score: me + pts,
      correct: (prev?.correct ?? meCorrect) + (ok ? 1 : 0),
      streak: ok ? (prev?.streak ?? meStreak) + 1 : 0,
      bestStreak: Math.max(prev?.bestStreak ?? 0, ok ? (prev?.streak ?? meStreak) + 1 : 0),
      ready: true, connected: true, lastDelta: pts,
    };
    if (!prev) meEntry.isHost = false;
    const others = room.players.filter((x) => x.id !== meId && !x.id.startsWith('bot') && !x.id.startsWith('rbot-'));
    setRoom({ ...room, players: [...others, meEntry], hostId: room.hostId, status: 'QUESTION' });
    const finalMe = me + pts;
    setTimeout(() => {
      if (qi + 1 >= qs.length) {
        sessionStorage.setItem('qr-room-result', JSON.stringify({ me: finalMe, total: qs.length }));
        nav(`/room/${roomCode}/results`, { replace: true });
      } else {
        setQi((i) => i + 1);
        setPicked(null);
        setPhase('q');
        t0.current = Date.now();
      }
    }, 1400);
  }
  lockRef.current = lock;
  const left = useServerTimer(timer, phase === 'q', () => lockRef.current(null), t0.current);
  const ceil = Math.ceil(left);
  useEffect(() => {
    if (phase === 'q' && left <= 3.1 && left > 0) sound.play('tick');
  }, [ceil, phase, left]);
  if (!room || !qs.length) return <div className="p-10 text-center text-sm font-bold text-muted">Reconnecting…</div>;
  if (phase === 'count')
    return (
      <div className="relative grid min-h-[70vh] place-items-center overflow-hidden">
        <div aria-hidden className="absolute h-[380px] w-[380px] rounded-full opacity-80 blur-3xl" style={{ background: 'radial-gradient(circle at 35% 30%, #FFE3D3 0%, #E9E2FF 45%, #D6EBFF 75%, transparent 100%)' }} />
        <div className="relative text-center">
          <AnimatePresence mode="wait">
            <Countdown key={count} n={count === 0 ? 'GO!' : count} />
          </AnimatePresence>
          <p className="mt-3 text-[12px] font-extrabold tracking-[0.24em] text-muted">GET READY</p>
        </div>
      </div>
    );
  const q = qs[Math.min(qi, qs.length - 1)];
  const meBase = room.players.find((x) => x.id === meId);
  const mePlayer = {
    id: meId, name: meBase?.name ?? 'You', avatar: meBase?.avatar ?? '⚡', score: me, correct: meCorrect,
    streak: meStreak, bestStreak: 0, rank: 1, ready: true, isHost: false, connected: true,
  } as Player;
  const others = (room?.players ?? []).filter((x) => x.id !== meId && !x.id.startsWith('bot') && !x.id.startsWith('rbot-'));
  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl gap-4 px-4 py-4 sm:px-5 md:grid md:grid-cols-[1fr_280px]">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold tracking-widest text-muted shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
          <span>Q {qi + 1}/{qs.length} · {room.code}</span>
          <span className="font-num text-lg font-extrabold text-ink">{me.toLocaleString()} PTS</span>
        </div>
        <div className="mt-2">
          <ProgressBar i={qi} total={qs.length} />
        </div>
        <div className="mt-3 flex items-center justify-center gap-4">
          <TimerRing left={left} total={timer} />
          {meStreak >= 2 && (
            <div className="rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-2 font-display text-lg text-black shadow-lift">🔥 ×{meStreak}</div>
          )}
        </div>
        <AnimatePresence mode="wait">
          <motion.h2 key={q.id + qi} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mt-3 text-center text-xl font-bold text-ink sm:text-2xl">
            {q.question}
          </motion.h2>
        </AnimatePresence>
        <div className="mx-auto mt-4 grid max-w-2xl gap-2">
          {q.options.map((o, i) => {
            let st: 'idle' | 'correct' | 'wrong' | 'dim' = 'idle';
            if (phase === 'reveal') {
              if (i === q.correctAnswer) st = 'correct';
              else if (i === picked) st = 'wrong';
              else st = 'dim';
            }
            return <AnswerButton key={i} index={i} label={L[i]} text={o} state={st} disabled={phase !== 'q'} onPick={() => lock(i)} />;
          })}
        </div>
        <button onClick={() => setShowBoard((s) => !s)} className="mt-3 w-full rounded-2xl bg-white py-2.5 text-xs font-bold text-muted shadow-sticker-sm md:hidden" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
          {showBoard ? 'HIDE LEADERBOARD' : 'SHOW LIVE LEADERBOARD'}
        </button>
      </div>
      <aside className={`${showBoard ? 'mt-3 block md:mt-0' : 'hidden'} md:block`}>
        <div className="rounded-2xl bg-white p-3 shadow-card" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
          <div className="mb-2 flex items-center gap-2 text-xs font-bold tracking-widest text-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#58CC02]" />LIVE
          </div>
          <Leaderboard players={[...others, mePlayer]} meId={meId} compact />
        </div>
      </aside>
    </div>
  );
}
