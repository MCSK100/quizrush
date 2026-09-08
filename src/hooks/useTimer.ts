import { useEffect, useRef, useState } from 'react';
export function useServerTimer(duration: number, active: boolean, onExpire: () => void, serverStart?: number) {
  const [left, setLeft] = useState(duration);
  const fired = useRef(false);
  const cb = useRef(onExpire);
  cb.current = onExpire;
  useEffect(() => {
    setLeft(duration);
    fired.current = false;
  }, [duration, serverStart, active]);
  useEffect(() => {
    if (!active) return;
    const t0 = serverStart ?? Date.now();
    setLeft(Math.max(0, duration - (Date.now() - t0) / 1000));
    const iv = setInterval(() => {
      const el = (Date.now() - t0) / 1000;
      const l = Math.max(0, duration - el);
      setLeft(l);
      if (l <= 0 && !fired.current) {
        fired.current = true;
        cb.current();
      }
    }, 100);
    return () => clearInterval(iv);
  }, [active, duration, serverStart]);
  return left;
}
