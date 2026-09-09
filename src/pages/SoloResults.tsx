import { useMemo, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fmt, sound } from '../services/engine';
import { recordGame } from '../stores/app';
import { generateQuestions } from '../services/questions';
export default function SoloResults() {
  const nav = useNavigate();
  const data = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem('qr-result') || 'null');
    } catch {
      return null;
    }
  }, []);
  useEffect(() => {
    if (!data) nav('/solo', { replace: true });
    else {
      const c = data.answers.filter((a: { correct: boolean }) => a.correct).length;
      recordGame(data.score, c, data.qs.length, c >= data.qs.length * 0.6, data.cfg.category);
      sound.play('fanfare');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [loading, setLoading] = useState(false);
  async function rematch() {
    try {
      const solo = JSON.parse(sessionStorage.getItem('qr-solo') || 'null');
      if (!solo?.cfg) { nav('/solo'); return; }
      setLoading(true);
      sound.play('click');
      const { questions, source } = await generateQuestions(solo.cfg);
      sessionStorage.setItem('qr-solo', JSON.stringify({ cfg: solo.cfg, questions, source }));
      nav('/solo/play');
    } catch {
      nav('/solo');
    } finally {
      setLoading(false);
    }
  }
  if (!data) return null;
  const correct = data.answers.filter((a: { correct: boolean }) => a.correct).length;
  const total = data.qs.length;
  const acc = Math.round((correct / total) * 100);
  const avg = (data.answers.reduce((a: number, r: { responseTime: number }) => a + r.responseTime, 0) / total).toFixed(1);
  return (
    <div className="mx-auto max-w-xl px-4 py-10 text-center">
      <motion.div initial={{ scale: 0.6, opacity: 0, rotate: -6 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-warn text-4xl shadow-lift">
        🏆
      </motion.div>
      <motion.h1 initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display mt-4 text-4xl sm:text-5xl">
        YOU <span className="title-shimmer">FINISHED!</span>
      </motion.h1>
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="font-num mt-4 text-6xl font-bold text-neon">
        {fmt(data.score)}
      </motion.div>
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[['ACCURACY', acc + '%'], ['CORRECT', `${correct}/${total}`], ['AVG', avg + 's'], ['BEST', '×' + bestStreak(data.answers)]].map(([l, v]) => (
          <div key={l} className="rounded-2xl bg-white p-3 shadow-card" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
            <div className="font-num text-xl font-bold">{v}</div>
            <div className="text-[10px] tracking-widest text-muted">{l}</div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm font-bold text-muted">{acc >= 80 ? 'FLAWLESS. Certified Quizlly pro.' : acc >= 50 ? 'Solid run. One more match?' : 'Warm-up done. Run it back.'}</p>
      <div className="mt-6 flex gap-2">
        <button onClick={rematch} disabled={loading} className="qr-btn-primary btn-press flex-1 justify-center rounded-2xl py-3.5 font-display disabled:opacity-60">
          {loading ? 'DEALING…' : 'REMATCH ↻'}
        </button>
        <Link to="/solo" className="qr-btn-ghost btn-press flex-1 justify-center rounded-2xl py-3.5 text-center font-bold">
          NEW QUIZ
        </Link>
      </div>
    </div>
  );
}
function bestStreak(a: { correct: boolean }[]) {
  let b = 0,
    c = 0;
  for (const r of a) {
    c = r.correct ? c + 1 : 0;
    b = Math.max(b, c);
  }
  return b;
}
