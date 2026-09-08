import { useState } from 'react';
import { useSettings } from '../stores/app';
import { sound } from '../services/engine';
import { GEMINI_KEY_STORE, geminiKeyActive, storedGeminiKey } from '../services/questions';
export default function Settings() {
  const on = useSettings((s) => s.sound);
  const set = useSettings((s) => s.setSound);
  const [key, setKey] = useState(storedGeminiKey());
  const [saved, setSaved] = useState(false);
  const aiOn = geminiKeyActive() || key.trim().length > 10;
  function saveKey() {
    try {
      if (key.trim()) localStorage.setItem(GEMINI_KEY_STORE, key.trim());
      else localStorage.removeItem(GEMINI_KEY_STORE);
    } catch { /* storage unavailable */ }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }
  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-black">Settings</h1>
      <div className="mt-4 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-4">
        <button onClick={() => { const v = sound.toggle(); set(v); }} className="flex w-full items-center justify-between rounded-lg px-2 py-3 font-bold" aria-pressed={on}><span>🔊 Game sounds</span><span className={`rounded-full px-3 py-1 text-xs font-black ${on ? 'bg-neon text-white' : 'bg-[#7C3AED]/10 text-muted'}`}>{on ? 'ON' : 'OFF'}</span></button>
        <button onClick={() => { localStorage.removeItem('qr-profile'); location.reload(); }} className="mt-1 w-full rounded-lg px-2 py-3 text-left text-sm font-bold text-danger">Reset local stats</button>
      </div>
      <div className="mt-4 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-4">
        <div className="flex items-center justify-between">
          <label htmlFor="gemkey" className="text-xs font-black tracking-widest text-muted">GEMINI API KEY</label>
          <span className={`rounded-full px-3 py-1 text-[11px] font-black ${aiOn ? 'bg-[#E7F9E5] text-[#1E7A38]' : 'bg-[#F8F9FF] text-muted'}`}>{aiOn ? '✨ AI ON' : '📚 BANK MODE'}</span>
        </div>
        <div className="mt-2 flex gap-2">
          <input id="gemkey" type="password" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Paste key from Google AI Studio…" autoComplete="off"
            className="font-num min-w-0 flex-1 rounded-2xl border-2 border-[#2D1B4E]/15 bg-white/90 px-4 py-3 text-sm font-bold outline-none focus:border-neon" />
          <button onClick={saveKey} className="btn-press shrink-0 rounded-2xl bg-neon px-5 font-display text-white">{saved ? 'SAVED ✓' : 'SAVE'}</button>
        </div>
        <p className="mt-2 text-xs font-medium text-muted">Get a free key at Google AI Studio. Saved only in this browser — never sent anywhere except Google's API. Without it, the built-in question bank is used.</p>
      </div>
      <div className="mt-4 rounded-xl border border-[#2D1B4E]/10 bg-white/80 p-4 text-sm text-muted"><b className="text-ink">Demo mode:</b> no backend configured, so rooms use simulated real-time bots and seeded questions. Set <code className="font-num text-neon">VITE_GEMINI_API_KEY</code> in <code className="font-num text-neon">.env</code> (or paste it above) to enable AI generation, or point <code className="font-num text-neon">VITE_AI_ENDPOINT</code> at your own server.</div>
    </div>
  );
}
