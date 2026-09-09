import { useState } from 'react';
import type { Difficulty, QuestionType, QuizConfig, QuizFocus, QuizLanguage } from '../types';
import { sound } from '../services/engine';
const SOFT = { border: '1px solid rgba(120,100,180,0.08)' } as const;
const TOPICS = [
  { id: 'mixed', label: '🎯 Mixed' }, { id: 'sports', label: '🏆 Sports' },
  { id: 'science', label: '🔬 Science' }, { id: 'history', label: '🏛️ History' },
  { id: 'tech', label: '💻 Technology' }, { id: 'movies', label: '🎬 Movies' },
  { id: 'music', label: '🎵 Music' }, { id: 'gaming', label: '🎮 Gaming' },
  { id: 'geography', label: '🌍 Geography' }, { id: 'gk', label: '🧠 General Knowledge' },
  { id: 'maths', label: '➗ Mathematics' }, { id: 'literature', label: '📚 Literature' },
  { id: 'animals', label: '🐾 Animals' }, { id: 'space', label: '🚀 Space' },
  { id: 'kids', label: '🧒 Kids' }, { id: 'india', label: '🇮🇳 India' },
  { id: 'world', label: '🌐 World' }, { id: 'custom', label: '✨ Custom Topic' },
];
const LANGS: { id: QuizLanguage; label: string }[] = [
  { id: 'en', label: '🇬🇧 English' }, { id: 'ta', label: '🇮🇳 Tamil' }, { id: 'both', label: 'Both' },
];
const COUNTS = [5, 10, 15, 20, 25];
const DIFFS: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: '🟢 Easy' }, { id: 'medium', label: '🟡 Medium' },
  { id: 'hard', label: '🔴 Hard' }, { id: 'mixed', label: '🎲 Mixed' },
];
const QTYPES: { id: QuestionType; label: string }[] = [
  { id: 'mcq', label: 'Multiple Choice' }, { id: 'tf', label: 'True / False' }, { id: 'mixed', label: 'Mixed' },
];
const TIMERS = [0, 10, 20, 30, 60];
const FOCUS: { id: QuizFocus; label: string }[] = [
  { id: 'global', label: '🌐 Global' }, { id: 'india', label: '🇮🇳 India' }, { id: 'topic', label: '🎯 Topic-specific' },
];
const ICONS: Record<string, string> = { Trophy: '🏆', Landmark: '🏛️', FlaskConical: '🧪', Globe: '🌍', Cpu: '💻', Clapperboard: '🎬', Music: '🎵', Smile: '😊', Languages: 'த', Brain: '🧠', Sigma: '∑', BookOpen: '📚', PawPrint: '🐾', Rocket: '🚀', Gamepad2: '🎮', Flag: '🌐' };
export function iconFor(icon: string) { return ICONS[icon] ?? '🎯'; }
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2 text-[11px] font-extrabold tracking-[0.16em] text-muted">{title}</div>
      {children}
    </div>
  );
}
function Pill({ active, onClick, children, className = '' }: { active: boolean; onClick: () => void; children: React.ReactNode; className?: string }) {
  return (
    <button
      onClick={onClick} aria-pressed={active}
      className={`btn-press rounded-2xl px-2 py-2.5 text-center text-xs font-extrabold transition-all ${active ? 'qr-btn-primary justify-center' : 'bg-white/80 text-ink hover:bg-white'} ${className}`}
      style={active ? undefined : SOFT}
    >
      {children}
    </button>
  );
}
export default function SetupForm({ value, onChange }: { value: QuizConfig; onChange: (c: QuizConfig) => void }) {
  const [customCount, setCustomCount] = useState('');
  const set = (p: Partial<QuizConfig>) => { sound.play('click'); onChange({ ...value, ...p }) };
  const countIsPreset = COUNTS.includes(value.count);
  const applyFocus = (f: QuizFocus) => {
    if (f === 'india') set({ focus: f, region: 'india' });
    else set({ focus: f, region: 'global' });
  };
  return (
    <div className="flex flex-col gap-6">
      <Section title="LANGUAGE">
        <div className="grid grid-cols-3 gap-2">
          {LANGS.map((l) => <Pill key={l.id} active={(value.language || 'en') === l.id} onClick={() => set({ language: l.id })}>{l.label}</Pill>)}
        </div>
      </Section>
      <Section title="TOPIC">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TOPICS.map((t) => <Pill key={t.id} active={value.category === t.id} onClick={() => set({ category: t.id })}>{t.label}</Pill>)}
        </div>
        {value.category === 'custom' && (
          <input
            value={value.customTopic || ''} onChange={(e) => onChange({ ...value, customTopic: e.target.value.slice(0, 80) })}
            placeholder="e.g. Chola dynasty, Chandrayaan, IPL…" maxLength={80}
            className="mt-2 w-full rounded-2xl bg-white/90 px-4 py-3 font-bold text-ink outline-none placeholder:text-faint focus:bg-white"
            style={{ ...SOFT, borderWidth: 1.5 }}
          />
        )}
      </Section>
      <Section title="QUESTIONS">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {COUNTS.map((n) => <Pill key={n} active={value.count === n} onClick={() => set({ count: n })}><span className="font-num">{n}</span></Pill>)}
          <Pill active={!countIsPreset} onClick={() => set({ count: Math.min(40, Math.max(3, Number(customCount) || 30)) })}>Custom</Pill>
        </div>
        {!countIsPreset && (
          <input
            value={customCount} onChange={(e) => { setCustomCount(e.target.value.replace(/[^0-9]/g, '').slice(0, 2)); }}
            onBlur={() => { const n = Math.min(40, Math.max(3, Number(customCount) || value.count)); if (n !== value.count) set({ count: n }); }}
            placeholder={`Custom (3–40, now ${value.count})`} inputMode="numeric"
            className="mt-2 w-full rounded-2xl bg-white/90 px-4 py-3 font-num font-bold text-ink outline-none placeholder:text-faint focus:bg-white"
            style={{ ...SOFT, borderWidth: 1.5 }}
          />
        )}
      </Section>
      <Section title="DIFFICULTY">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DIFFS.map((d) => <Pill key={d.id} active={value.difficulty === d.id} onClick={() => set({ difficulty: d.id as Difficulty })}>{d.label}</Pill>)}
        </div>
      </Section>
      <Section title="QUESTION TYPE">
        <div className="grid grid-cols-3 gap-2">
          {QTYPES.map((q) => <Pill key={q.id} active={(value.questionType || 'mcq') === q.id} onClick={() => set({ questionType: q.id })}>{q.label}</Pill>)}
        </div>
      </Section>
      <Section title="TIMER">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {TIMERS.map((t) => <Pill key={t} active={value.timer === t} onClick={() => set({ timer: t })}><span className="font-num">{t === 0 ? 'No Timer' : `${t}s`}</span></Pill>)}
        </div>
      </Section>
      <Section title="QUESTION FOCUS">
        <div className="grid grid-cols-3 gap-2">
          {FOCUS.map((f) => <Pill key={f.id} active={(value.focus || 'global') === f.id} onClick={() => applyFocus(f.id)}>{f.label}</Pill>)}
        </div>
      </Section>
    </div>
  );
}
