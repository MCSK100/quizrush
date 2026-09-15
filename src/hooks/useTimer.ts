import { useEffect, useRef, useState } from 'react';

function clampDuration(d: unknown): number {
  const n = Number(d);
  if (!Number.isFinite(n) || n < 0) return 10;
  return n;
}

function clampStart(s: unknown): number {
  const now = Date.now();
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return now;
  if (n > now + 5000) return now;
  if (now - n > 24 * 3600 * 1000) return now;
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
  const startRef = useRef<number>(clampStart(serverStart));

  useEffect(() => {
    startRef.current = clampStart(serverStart);
    fired.current = false;
    setLeft(total);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, serverStart, key]);

  useEffect(() => {
    if (!active || disabled) return;
    const tick = () => {
      const el = (Date.now() - startRef.current) / 1000;
      const l = Math.max(0, total - Math.max(0, el));
      setLeft(l);
      if (l <= 0 && !fired.current) {
        fired.current = true;
        cb.current();
      }
    };
    tick();
    const iv = setInterval(tick, 100);
    const onVis = () => {
      if (document.visibilityState === 'visible') tick();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [active, total, disabled, key]);

  return disabled ? Number.POSITIVE_INFINITY : left;
}
