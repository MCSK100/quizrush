import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnswerRecord, Question, QuizConfig } from '../types';
import { calcPoints, sound } from '../services/engine';
import { useServerTimer } from '../hooks/useTimer';
import { TimerRing, AnswerButton, ProgressBar, ScoreTicker, Countdown } from '../components/game';
import { CAT_IMAGES } from '../components/landing/CategoryExplorer';
const LETTERS = ['A', 'B', 'C', 'D'];
const OPT_IMAGES = [
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=300&q=60&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=300&q=60&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?w=300&q=60&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=300&q=60&auto=format&fit=crop',
];
export default function SoloPlay() {
  const nav = useNavigate();
  const [stored] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('qr-solo') || 'null') as { cfg: QuizConfig; questions: Question[]; source?: 'ai' | 'demo' } | null;
    } catch {
      return null;
    }
  });
  const qs = useMemo(() => {
    const raw = Array.isArray(stored?.questions) ? (stored.questions as Question[]) : [];
    return raw.filter(
      (q) =>
        q &&
        Array.isArray(q.options) &&
        q.options.length >= 2 &&
        typeof q.correctAnswer === 'number' &&
        q.correctAnswer >= 0 &&
        q.correctAnswer < q.options.length,
    );
  }, [stored]);
  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<'count' | 'q' | 'reveal'>('count');
  const [count, setCount] = useState(3);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const t0 = useRef(Date.now());
  const lockRef = useRef<(p: number | null) => void>(() => {});
  const cfg = stored?.cfg;
  const isAI = stored?.source === 'ai';
  useEffect(() => {
    if (!stored) nav('/solo', { replace: true });
  }, [stored, nav]);
  useEffect(() => {
    if (phase !== 'count') return;
    if (count <= 0) {
      setPhase('q');
      t0.current = Date.now();
      sound.play('go');
      return;
    }
    sound.play('count');
    const t = setTimeout(() => setCount((c) => (Number.isFinite(c) ? c - 1 : 0)), 700);
    return () => clearTimeout(t);
  }, [phase, count]);
  useEffect(() => {
    if (phase !== 'count') return;
    const force = setTimeout(() => {
      setCount(0);
      setPhase('q');
      t0.current = Date.now();
    }, 6000);
    return () => clearTimeout(force);
  }, [phase]);
  function lock(p: number | null) {
    if (phase !== 'q') return;
    const q = qs[qi];
    if (!q || !cfg) return;
    const el = (Date.now() - t0.current) / 1000;
    const ok = p === q.correctAnswer;
    const pts = ok ? calcPoints(cfg.timer, el, streak) : 0;
    const rec: AnswerRecord = { questionId: q.id, picked: p, correct: ok, responseTime: el, points: pts };
    const nextAnswers = [...answers, rec];
    setPicked(p);
    setPhase('reveal');
    setAnswers(nextAnswers);
    if (ok) {
      setScore((s) => s + pts);
      setStreak((s) => s + 1);
      sound.play('correct');
    } else {
      setStreak(0);
      sound.play('wrong');
    }
    const finalScore = score + pts;
    setTimeout(() => {
      if (qi + 1 >= qs.length) {
        sessionStorage.setItem('qr-result', JSON.stringify({ cfg, answers: nextAnswers, score: finalScore, qs }));
        nav('/solo/results', { replace: true });
      } else {
        setQi((i) => i + 1);
        setPicked(null);
        setPhase('q');
        t0.current = Date.now();
      }
    }, 1100);
  }
  lockRef.current = lock;
  const rawTimer = cfg?.timer ?? 10;
  const timer = [0, 10, 20, 30, 60].includes(Number(rawTimer)) ? Number(rawTimer) : 10;
  const noTimer = !(timer > 0);
  const left = useServerTimer(timer, phase === 'q', () => lockRef.current(null), t0.current, qi);
  const ceil = Math.ceil(left);
  useEffect(() => {
    if (!noTimer && phase === 'q' && ceil <= 3 && ceil > 0) sound.play('tick');
  }, [ceil, phase, noTimer]);
  if (!stored)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-display text-2xl text-ink">Loading questions…</p>
        <p className="text-sm text-muted">Dealing fresh questions…</p>
      </div>
    );
  if (!qs.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-display text-2xl text-ink">Questions didn&apos;t load.</p>
        <p className="mt-2 text-sm font-bold text-muted">The quiz data looks incomplete — head back and start a fresh game.</p>
        <div className="mt-5 flex justify-center gap-2">
          <button onClick={() => nav('/solo', { replace: true })} className="qr-btn-primary rounded-2xl px-6 py-3 font-display">BACK TO SETUP</button>
          <button onClick={() => location.reload()} className="rounded-2xl bg-white px-6 py-3 font-display shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>RETRY</button>
        </div>
      </div>
    );
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
  const q = qs[qi];
  if (!q)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="font-display text-2xl text-ink">Loading questions…</p>
        <p className="text-sm text-muted">Dealing fresh questions…</p>
      </div>
    );
  const banner = (CAT_IMAGES as Record<string, string>)[(q.category || '').toLowerCase()] ?? `https://picsum.photos/seed/quiz-${qi}/1200/320`;
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 pb-10">
      <div className="relative overflow-hidden rounded-[24px] bg-white shadow-soft" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
        <img src={banner} alt={q.category} loading="lazy" className="h-36 w-full object-cover sm:h-44" />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-xs font-bold tracking-widest">
          <span className="rounded-full bg-ink px-3 py-1 text-white">QUESTION {String(qi + 1).padStart(2, '0')} / {qs.length}</span>
          <span className="uppercase hidden rounded-full bg-white/90 px-3 py-1 text-grape shadow-sticker-sm sm:inline" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>{q.category}</span>
          <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>
            <span className={`text-[10px] font-extrabold ${isAI ? 'text-grape' : 'text-muted'}`}>{isAI ? '✨ AI' : '📚 BANK'}</span>
            <ScoreTicker score={score} />
          </span>
        </div>
      </div>
      <div className="mt-3">
        <ProgressBar i={qi} total={qs.length} />
      </div>
      <div className="mt-4 flex items-center justify-center gap-4">
        {!noTimer && <TimerRing left={left} total={timer} />}
        {streak >= 2 && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-300 to-orange-400 px-4 py-2 font-display text-lg text-black shadow-lift">🔥 ×{streak}</div>
        )}
      </div>
      <AnimatePresence mode="wait">
        <motion.h2 key={q.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} className="mt-4 text-center font-body text-xl font-bold text-ink sm:text-2xl">
          {q.question}
        </motion.h2>
      </AnimatePresence>
      {q.explanation && phase === 'q' && !noTimer && (
        <div className="mx-auto mt-3 max-w-2xl rounded-2xl bg-white px-4 py-2.5 text-center text-xs font-bold text-muted shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
          Fastest finger wins bonus. Lock it before the ring burns out.
        </div>
      )}
      <div className="mx-auto mt-5 grid max-w-2xl gap-2.5">
        {q.options.map((o, i) => {
          let st: 'idle' | 'correct' | 'wrong' | 'dim' = 'idle';
          if (phase === 'reveal') {
            if (i === q.correctAnswer) st = 'correct';
            else if (i === picked) st = 'wrong';
            else st = 'dim';
          }
          return <AnswerButton key={i} index={i} label={LETTERS[i]} text={o} state={st} disabled={phase !== 'q'} onPick={() => lock(i)} image={OPT_IMAGES[(qi + i) % OPT_IMAGES.length]} />;
        })}
      </div>
      {phase === 'reveal' && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`mt-4 rounded-2xl px-4 py-3 text-center text-sm font-bold ${picked === q.correctAnswer ? 'bg-[#E7F9E5] text-[#1E7A38]' : 'bg-[#FFE9E9] text-[#C62828]'}`} style={{ border: picked === q.correctAnswer ? '1.5px solid #58CC02' : '1.5px solid #FF4B5C' }}>
          {picked === q.correctAnswer ? `+${answers[answers.length - 1]?.points ?? 0} Correct! ${q.explanation}` : `${picked === null ? 'Time up! ' : ''}Correct: ${q.options[q.correctAnswer] ?? ''} · ${q.explanation}`}
        </motion.p>
      )}
      <div className="mt-3 text-center font-num text-xs font-bold text-muted">
        STREAK ×{streak} · AVG {(answers.reduce((a, r) => a + r.responseTime, 0) / (answers.length || 1)).toFixed(1)}s
      </div>
    </div>
  );
}
