import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SetupForm from '../components/SetupForm';
import type { QuizConfig } from '../types';
import { generateQuestions, geminiKeyActive } from '../services/questions';
import { sound } from '../services/engine';
export default function SoloSetup() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [cfg, setCfg] = useState<QuizConfig>({ category: sp.get('cat') || 'mixed', count: 10, timer: 10, difficulty: 'mixed', randomizeQ: true, randomizeA: true });
  const [loading, setLoading] = useState(false);
  const aiOn = geminiKeyActive();
  async function start() {
    sound.play('click');
    setLoading(true);
    try {
      const { questions, source } = await generateQuestions(cfg);
      sessionStorage.setItem('qr-solo', JSON.stringify({ cfg, questions, source }));
      nav('/solo/play');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-8 sm:px-5 sm:py-12">
      <div className="text-[11px] font-extrabold tracking-[0.18em] text-coralDeep">SOLO QUIZ</div>
      <h1 className="font-display mt-2 text-balance text-3xl tracking-tight text-ink sm:text-4xl">Build your <span className="qr-gradient-text">quiz.</span></h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-muted">{loading ? 'Preparing your questions…' : 'Solo run. No mercy. Beat your best.'}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-extrabold shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
          <span className={aiOn ? 'text-[#1E7A38]' : 'text-muted'}>{aiOn ? '✨ AI QUESTIONS ON' : '📚 QUESTION BANK MODE'}</span>
          {!aiOn && <a href="/settings" className="text-grape hover:underline">Add key →</a>}
        </span>
      </div>
      <div className="qr-surface mt-6 rounded-[24px] p-4 sm:p-6">
        <SetupForm value={cfg} onChange={setCfg} />
      </div>
      <button onClick={start} disabled={loading} className="qr-btn-primary group mt-4 w-full justify-center rounded-2xl py-4 font-display text-base tracking-wide disabled:opacity-60">
        {loading ? 'BUILDING THE BATTLE…' : <>START QUIZ <ArrowRight size={18} className="arrow-nudge" /></>}
      </button>
      <p className="mt-3 text-center text-[12px] font-bold text-muted">{cfg.count} questions · {cfg.timer}s each · {String(cfg.difficulty).toUpperCase()}</p>
    </div>
  );
}
