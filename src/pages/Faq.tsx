import { useState } from 'react';
const QA: [string, string][] = [
  ['How are questions generated?', 'Every quiz is built fresh by AI (Gemini with OpenRouter fallback). If the AI is unreachable, Quizlly falls back to its built-in question bank so the game never blocks.'],
  ['Why did I get a repeated question?', 'Each session tracks every question you have seen and filters it out of new quizzes. If the AI returns a duplicate, it is removed before the game starts. Bank-only games with big question counts may still recycle when the bank runs out — connect the AI backend for fully fresh decks.'],
  ['How does multiplayer work?', 'Create a room, share the 5-letter code, and everyone answers the same questions together with live scores. The host starts the game from the lobby.'],
  ['Which languages are supported?', 'English, Tamil (தமிழ்), or Both — which alternates questions between the two languages.'],
  ['What is True / False mode?', 'Instead of 4 options you get True or False statements. Mixed mode alternates multiple-choice and True/False questions.'],
  ['Does Quizlly need an account?', 'No. Scores and stats live in your browser only. Reset them anytime from Settings.'],
];
export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-grape shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>FAQ</div>
      <h1 className="font-display mt-3 text-3xl tracking-tight text-ink sm:text-4xl">Questions, <span className="qr-gradient-text">answered.</span></h1>
      <div className="mt-6 flex flex-col gap-2">
        {QA.map(([q, a], i) => (
          <div key={q} className="rounded-2xl bg-white shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.08)' }}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left font-bold text-ink">
              {q}<span className="text-muted">{open === i ? '−' : '+'}</span>
            </button>
            {open === i && <p className="px-4 pb-4 text-sm font-medium leading-relaxed text-muted">{a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
