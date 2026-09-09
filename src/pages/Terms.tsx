export default function Terms() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-grape shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>TERMS</div>
      <h1 className="font-display mt-3 text-3xl tracking-tight text-ink sm:text-4xl">Terms <span className="qr-gradient-text">of use.</span></h1>
      <div className="qr-surface mt-6 rounded-[24px] p-5 sm:p-6 text-[15px] font-medium leading-relaxed text-ink/80">
        <p>Quizlly is a free casual game for entertainment and learning. AI-generated questions can occasionally contain mistakes —treat scores as fun, not exams.</p>
        <p className="mt-3">Keep display names family-friendly (2–16 characters). Rooms with abusive names or behaviour may be closed.</p>
        <p className="mt-3">The app is provided as-is, without warranties. See the LICENSE file in the project repository for the full licence text.</p>
      </div>
    </div>
  );
}
