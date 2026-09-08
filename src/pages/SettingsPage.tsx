import { useEffect, useState } from 'react';
import { useSettings } from '../stores/app';
import { sound } from '../services/engine';
import { aiBackendConfigured, aiBackendHealth } from '../services/questions';
export default function Settings() {
  const on = useSettings((s) => s.sound);
  const set = useSettings((s) => s.setSound);
  const [ai, setAi] = useState<'on' | 'off' | 'unknown'>(aiBackendConfigured() ? 'unknown' : 'off');
  useEffect(() => {
    let live = true;
    if (aiBackendConfigured()) aiBackendHealth().then((s) => { if (live) setAi(s); });
    return () => { live = false; };
  }, []);
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-black">Settings</h1>
      <div className="mt-4 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-4">
        <button onClick={() => { const v = sound.toggle(); set(v); }} className="flex w-full items-center justify-between rounded-lg px-2 py-3 font-bold" aria-pressed={on}><span>🔊 Game sounds</span><span className={`rounded-full px-3 py-1 text-xs font-black ${on ? 'bg-neon text-white' : 'bg-[#7C3AED]/10 text-muted'}`}>{on ? 'ON' : 'OFF'}</span></button>
        <button onClick={() => { localStorage.removeItem('qr-profile'); location.reload(); }} className="mt-1 w-full rounded-lg px-2 py-3 text-left text-sm font-bold text-danger">Reset local stats</button>
      </div>
      <div className="mt-4 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black tracking-widest text-muted">AI QUESTIONS (GEMINI)</span>
          <span className={`rounded-full px-3 py-1 text-[11px] font-black ${ai === 'on' ? 'bg-[#E7F9E5] text-[#1E7A38]' : ai === 'off' ? 'bg-[#FFE9E9] text-[#C62828]' : 'bg-[#F8F9FF] text-muted'}`}>
            {ai === 'on' ? '✨ AI ON' : ai === 'off' ? '○ BACKEND UNREACHABLE' : '📚 BANK MODE'}
          </span>
        </div>
        <ol className="mt-3 grid gap-2 text-[13px] font-medium text-muted">
          <li><b className="text-ink">1.</b> Get a free key at Google AI Studio.</li>
          <li><b className="text-ink">2.</b> In <code className="font-num text-neon">server/.env</code> set <code className="font-num text-neon">GEMINI_API_KEY</code>, then run <code className="font-num text-neon">npm start --prefix server</code> (or deploy <code className="font-num text-neon">render.yaml</code> to Render).</li>
          <li><b className="text-ink">3.</b> In the frontend <code className="font-num text-neon">.env</code> set <code className="font-num text-neon">VITE_AI_ENDPOINT</code> to the server URL and rebuild.</li>
        </ol>
        <p className="mt-2 text-xs font-medium text-muted">The key stays on your server — the browser never sees it. Without a backend, the built-in question bank is used and rooms run as local practice.</p>
      </div>
    </div>
  );
}
