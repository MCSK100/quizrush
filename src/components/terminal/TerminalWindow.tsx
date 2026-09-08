import { useRef, useState } from 'react';

export default function TerminalWindow({ title, children, className = '', defaultPos }: { title: string; children: React.ReactNode; className?: string; defaultPos?: { x: number; y: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(defaultPos ?? { x: 0, y: 0 });
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const onDown = (e: React.PointerEvent) => {
    if (window.innerWidth < 768) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setPos({ x: drag.current.ox + (e.clientX - drag.current.sx), y: drag.current.oy + (e.clientY - drag.current.sy) });
  };
  const onUp = () => {
    drag.current = null;
  };

  return (
    <div
      ref={ref}
      className={`gg-window overflow-hidden rounded-2xl ${className}`}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      <div
        className="gg-window-bar flex select-none items-center gap-2 px-4 py-2.5"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <span className="flex gap-1.5">
          <i className="block h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
          <i className="block h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
          <i className="block h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        </span>
        <span className="gg-split text-[11px] font-bold tracking-[0.2em] text-white/95">{title}</span>
        <span className="ml-auto text-[10px] font-bold tracking-widest text-white/70">DRAG ME ✦</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
