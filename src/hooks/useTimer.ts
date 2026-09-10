import { useEffect, useRef, useState } from 'react';

function clampDuration(d: unknown): number {
  const n = Number(d);
  if (!Number.isFinite(n) || n < 0) return 10;
  return n;
}

export function useServerTimer(
  duration: number,
  active: boolean,
  onExpire: () => void,
  serverStart?: number,
  key?: string | number,
) {
  const total = clampDuration(duration);
  const disabled = !(total > 0);
  const [left, setLeft] = useState(total);
  const fired = useRef(false);
  const cb = useRef(onExpire);
  cb.current = onExpire;
  const startRef = useRef<number>(serverStart ?? Date.now());

  useEffect(() => {
    startRef.current = serverStart ?? Date.now();
    fired.current = false;
    setLeft(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, serverStart, key]);

  useEffect(() => {
    if (!active || disabled) return;
    const t0 = startRef.current;
    const tick = () => {
      const el = (Date.now() - t0) / 1000;
      const l = Math.max(0, total - el);
      setLeft(l);
      if (l <= 0 && !fired.current) {
        fired.current = true;
        cb.current();
      }
    };
    tick();
    const iv = setInterval(tick, 100);
    return () => clearInterval(iv);
  }, [active, total, disabled, key]);

  return disabled ? Number.POSITIVE_INFINITY : left;
}
