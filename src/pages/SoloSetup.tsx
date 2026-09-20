import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Play, Sparkles } from 'lucide-react';
import SetupForm, { categoryLabel, isAllowedCategory, sanitizeCount, sanitizeJlpt, sanitizeTimer } from '../components/SetupForm';
import type { QuizConfig } from '../types';
import { AiError, aiBackendHealth, generateQuestions, localBankQuiz } from '../services/questions';
import { sound } from '../services/engine';
export default function SoloSetup() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const rawCat = sp.get('cat') || 'mixed';
  const [cfg, setCfg] = useState<QuizConfig>({ category: isAllowedCategory(rawCat) ? rawCat : 'mixed', count: 10, timer: 10, difficulty: 'mixed', region: 'global', randomizeQ: true, randomizeA: true, language: 'en', questionType: 'mcq', focus: 'global', jlptLevel: 'N5' });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [note, setNote] = useState('');
  const [showSkip, setShowSkip] = useState(false);
  const cleanRef = useRef<QuizConfig | null>(null);
  const cancelRef = useRef(false);
  // Pre-warm the AI backend while the user configures the quiz, so a cold
  // server is already awake by the time they hit START.
  useEffect(() => { aiBackendHealth().catch(() => {}); }, []);
  async function start() {
    sound.play('click');
    const clean: QuizConfig = {
      ...cfg,
      category: isAllowedCategory(cfg.category) ? cfg.category : 'mixed',
      count: sanitizeCount(cfg.count),
      timer: sanitizeTimer(cfg.timer, true),
      jlptLevel: sanitizeJlpt(cfg.jlptLevel),
      customTopic: (cfg.customTopic || '').slice(0, 80),
    };
    if (clean.category === 'custom' && !clean.customTopic?.trim()) {
      setErr('Enter a custom topic to continue.');
      return;
    }
    setCfg(clean);
    cleanRef.current = clean;
    cancelRef.current = false;
    setShowSkip(false);
    setLoading(true);
    setErr('');
    // Staged feedback so a slow network still feels alive.
    const t0 = Date.now();
    const stage = () => {
      const s = (Date.now() - t0) / 1000;
      setNote(s < 7 ? 'Waking the AI engine…' : s < 18 ? 'Writing fresh questions…' : 'Almost there — polishing the set…');
    };
    stage();
    const stageTimer = setInterval(stage, 1200);
    const skipTimer = setTimeout(() => setShowSkip(true), 20000);
    try {
      const { questions, source, provider } = await generateQuestions(clean);
      if (cancelRef.current) return;
      try {
        sessionStorage.removeItem('qr-result');
        sessionStorage.removeItem('qr-solo-progress');
        sessionStorage.setItem('qr-solo', JSON.stringify({ cfg: clean, questions, source, provider }));
      } catch { /* storage unavailable */ }
      if (source === 'bank') setNote('AI unavailable — using offline questions.');
      nav('/solo/play');
    } catch (e) {
      if (cancelRef.current) return;
      setNote('');
      setErr(e instanceof AiError ? e.message : 'Could not build a quiz. Check your connection and retry.');
    } finally {
      clearInterval(stageTimer);
      clearTimeout(skipTimer);
      setLoading(false);
    }
  }
  function skipToOffline() {
    const clean = cleanRef.current;
    if (!clean) return;
    cancelRef.current = true;
    setShowSkip(false);
    sound.play('click');
    try {
      const { questions, source, provider } = localBankQuiz(clean);
      try {
        sessionStorage.removeItem('qr-result');
        sessionStorage.removeItem('qr-solo-progress');
        sessionStorage.setItem('qr-solo', JSON.stringify({ cfg: clean, questions, source, provider }));
      } catch { /* storage unavailable */ }
      nav('/solo/play');
    } catch {
      cancelRef.current = false;
      setErr('Could not build offline questions. Check your connection and retry.');
    }
  }
  const topic = cfg.category === 'custom' && cfg.customTopic?.trim() ? cfg.customTopic.trim() : categoryLabel(cfg.category);
  return (
    <div className="mx-auto w-full min-w-0 max-w-2xl px-4 py-8 sm:px-5 sm:py-12">
      <div className="flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] text-electric">
        <Play size={12} strokeWidth={3} /> SOLO QUIZ
      </div>
      <h1 className="font-display mt-2 text-balance text-3xl tracking-tight text-ink sm:text-4xl">Build your <span className="qr-gradient-text">quiz.</span></h1>
      <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-muted">
        <Sparkles size={14} className="shrink-0 text-sunny" /> Fresh AI questions every run — no repeats, no stale decks.
      </p>
      <div className="mt-6"><SetupForm value={cfg} onChange={setCfg} /></div>
      {err && (
        <div role="alert" className="mt-4 rounded-[22px] bg-[#FFE9E9] px-4 py-3.5 text-center" style={{ border: '1.5px solid #FF4B5C' }}>
          <p className="text-sm font-bold text-[#C62828]">{err}</p>
          <button onClick={start} disabled={loading} className="btn-press mt-2 rounded-xl bg-[#C62828] px-5 py-2 text-sm font-extrabold text-white disabled:opacity-60">RETRY</button>
        </div>
      )}
      {!err && note && loading && <p aria-live="polite" className="mt-4 text-center text-[12px] font-bold text-muted">{note}</p>}
      {loading && showSkip && (
        <div className="mt-3 text-center">
          <button onClick={skipToOffline} className="btn-press rounded-full bg-white px-5 py-2.5 text-[13px] font-extrabold text-grape shadow-sticker-sm" style={{ border: '1px solid rgba(124,92,255,0.30)' }}>
            Taking too long? Play offline instead →
          </button>
        </div>
      )}
      <div className="sticky bottom-3 z-10 mt-5">
        <div className="flex items-center gap-3 rounded-[20px] bg-ink p-2.5 pl-5 text-white shadow-lift">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-extrabold">{topic}</div>
            <div className="font-num truncate text-[11.5px] font-bold text-white/60">
              {cfg.count} Qs · {cfg.timer > 0 ? `${cfg.timer}s each` : 'No timer'} · {String(cfg.difficulty).toUpperCase()}
            </div>
          </div>
          <button onClick={start} disabled={loading}
            className="qr-btn-primary btn-press group shrink-0 rounded-2xl px-6 py-3.5 font-display text-[15px] tracking-wide disabled:opacity-60 sm:px-8">
            {loading ? 'ASKING AI…' : <>START <ArrowRight size={17} className="arrow-nudge" /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
