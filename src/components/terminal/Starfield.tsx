import { useEffect, useRef } from 'react';

export default function Starfield({ density = 140 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    type S = { x: number; y: number; r: number; p: number; s: number; c: string };
    let stars: S[] = [];
    const colors = ['#FFFFFF', '#FDE68A', '#A78BFA', '#67E8F9', '#F9A8D4'];
    const seed = () => {
      stars = Array.from({ length: density }).map(() => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        p: Math.random() * Math.PI * 2,
        s: 0.5 + Math.random() * 1.6,
        c: colors[Math.floor(Math.random() * colors.length)],
      }));
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };
    resize();
    window.addEventListener('resize', resize);
    let t = 0;
    const loop = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = 0.45 + 0.55 * Math.abs(Math.sin(t * s.s + s.p));
        ctx.globalAlpha = tw;
        ctx.fillStyle = s.c;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [density]);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={ref} className="h-full w-full" />
      <span className="gg-shooting absolute right-[12%] top-[18%] block h-[2px] w-28 rounded-full bg-gradient-to-r from-transparent via-amber-200 to-white" />
      <span className="gg-shooting absolute right-[30%] top-[42%] block h-[2px] w-20 rounded-full bg-gradient-to-r from-transparent via-cyan-200 to-white" style={{ animationDelay: '2.6s' }} />
    </div>
  );
}
