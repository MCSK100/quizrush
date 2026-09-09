import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SetupForm from '../components/SetupForm';
import { regionLabel } from '../data/regions';
import type { QuizConfig } from '../types';
import { AiError, generateQuestions } from '../services/questions';
import { sound } from '../services/engine';
export default function SoloSetup() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const [cfg, setCfg] = useState<QuizConfig>({ category: sp.get('cat') || 'mixed', count: 10, timer: 10, difficulty: 'mixed', region: 'global', randomizeQ: true, randomizeA: true, language: 'en', questionType: 'mcq', focus: 'global' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  async function start() {
    sound.play('click');
    setLoading(true);
    setErr('');
    try {
      const { questions, source, provider } = await generateQuestions(cfg);
      sessionStorage.setItem('qr-solo', JSON.stringify({ cfg, questions, source, provider }));
      nav('/solo/play');
    } catch (e) {
      setErr(e instanceof AiError ? e.message : 'AI question generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-8 sm:px-5 sm:py-12">
      <div className="text-[11px] font-extrabold tracking-[0.18em] text-coralDeep">SOLO QUIZ</div>
      <h1 className="font-display mt-2 text-balance text-3xl tracking-tight text-ink sm:text-4xl">Build your <span className="qr-gradient-text">quiz.</span></h1>
      <div className="qr-surface mt-6 rounded-[24px] p-4 sm:p-6">
        <SetupForm value={cfg} onChange={setCfg} />
      </div>
      <button onClick={start} disabled={loading} className="qr-btn-primary group mt-4 w-full justify-center rounded-2xl py-4 font-display text-base tracking-wide disabled:opacity-60">
        {loading ? 'ASKING THE AI…' : <>START QUIZ <ArrowRight size={18} className="arrow-nudge" /></>}
      </button>
      {err && <p role="alert" className="mt-3 rounded-2xl bg-[#FFE9E9] px-4 py-3 text-center text-sm font-bold text-[#C62828]" style={{ border: '1.5px solid #FF4B5C' }}>{err}</p>}
      <p className="mt-3 text-center text-[12px] font-bold text-muted">{cfg.count} questions · {cfg.timer > 0 ? `${cfg.timer}s each` : 'No timer'} · {String(cfg.difficulty).toUpperCase()} · {(cfg.questionType || 'mcq').toUpperCase()} · {(cfg.language || 'en').toUpperCase()} · {regionLabel(cfg.focus === 'india' ? 'india' : cfg.region).toUpperCase()}</p>
    </div>
  );
}
