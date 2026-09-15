import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const SRC = '/192292-892475144.mp4';

export default function HeroVideo() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    const vid = vidRef.current;
    if (!wrap || !vid) return;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let loaded = false;
    const ob = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!loaded) {
            loaded = true;
            vid.src = SRC;
            vid.load();
          }
          if (!reduce && vid.paused) {
            vid.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
          }
        } else if (!vid.paused) {
          vid.pause();
          setPlaying(false);
        }
      },
      { threshold: 0.2 },
    );
    ob.observe(wrap);
    return () => ob.disconnect();
  }, []);

  function toggle() {
    const vid = vidRef.current;
    if (!vid) return;
    if (vid.paused) vid.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    else {
      vid.pause();
      setPlaying(false);
    }
  }

  return (
    <figure className="relative mx-auto w-full min-w-0 max-w-6xl px-4 pb-12 sm:px-5 sm:pb-14">
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-[24px] bg-ink shadow-lift sm:rounded-[32px]"
        style={{ border: '1px solid rgba(120,100,180,0.10)' }}
      >
        <span className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-[10px] font-extrabold tracking-[0.18em] text-white backdrop-blur sm:text-[11px]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#58CC02]" /> LIVE GAMEPLAY
        </span>
        <video
          ref={vidRef}
          className="aspect-video w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
          poster="/quizlly-og-image.png"
          aria-label="Quizlly gameplay preview — fast online trivia quiz with live multiplayer rooms"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
        />
        <button
          onClick={toggle}
          aria-label={playing ? 'Pause gameplay preview' : 'Play gameplay preview'}
          className="btn-press absolute bottom-4 right-4 grid h-12 w-12 place-items-center rounded-full bg-white/90 text-ink shadow-soft backdrop-blur"
        >
          {playing ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
        </button>
      </div>
      <figcaption className="mx-auto mt-3 max-w-2xl text-balance text-center text-[13px] font-medium leading-relaxed text-muted">
        Watch Quizlly in action — fast online trivia quizzes, live multiplayer rooms with friends and fresh AI-generated questions across 17+ categories.
      </figcaption>
    </figure>
  );
}
