import { Link } from 'react-router-dom';
export default function About() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="inline-flex rounded-full bg-white px-4 py-1.5 text-[11px] font-extrabold tracking-[0.18em] text-grape shadow-sticker-sm" style={{ border: '1px solid rgba(120,100,180,0.10)' }}>ABOUT</div>
      <h1 className="font-display mt-3 text-3xl tracking-tight text-ink sm:text-4xl">About <span className="qr-gradient-text">Quizlly.</span></h1>
      <div className="qr-surface mt-6 rounded-[24px] p-5 sm:p-6 text-[15px] font-medium leading-relaxed text-ink/80">
        <p>Quizlly is where sharp minds come to play. Take on solo quizzes against the clock or challenge friends live in multiplayer rooms — every match deals a fresh set of AI-generated questions, so no two games ever feel the same.</p>
        <p className="mt-3">Pick from 17 topics plus your own custom topics, play in English, Tamil, or both, and tune the difficulty, timer, and question type to your style.</p>
        <p className="mt-3">No sign-up needed. One tap and you're in the spotlight.</p>
      </div>
      <Link to="/solo" className="qr-btn-primary mt-5 inline-flex px-6 py-3 text-[15px]">Play solo →</Link>
    </div>
  );
}
