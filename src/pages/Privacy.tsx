export default function Privacy() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-grape shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>PRIVACY</div>
      <h1 className="font-display mt-3 text-3xl tracking-tight text-ink sm:text-4xl">Privacy <span className="qr-gradient-text">policy.</span></h1>
      <div className="qr-surface mt-6 rounded-[24px] p-5 sm:p-6 text-[15px] font-medium leading-relaxed text-ink/80">
        <p>Quizlly needs no account and collects no personal data on its own servers. Your display name is used only inside the game room you join.</p>
        <p className="mt-3">Game stats, sound preference, and recently-seen question IDs are stored locally in your browser (localStorage / sessionStorage) to keep quizzes fresh. Clear your browser data anytime to erase them.</p>
        <p className="mt-3">Quiz questions are generated via third-party AI providers (Google Gemini, OpenRouter). Only the topic, count, difficulty, and language settings are sent — never personal information.</p>
      </div>
    </div>
  );
}
