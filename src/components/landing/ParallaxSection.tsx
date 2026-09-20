import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-linked parallax wrapper for landing body sections.
 * Cheap by design: small vertical drift only (no rotateX/scale/preserve-3d),
 * disabled on mobile + reduced-motion so sections can never get stuck
 * translated/invisible and the compositor stays idle.
 */
export default function ParallaxSection({
  children,
  depth = 1,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  depth?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    try {
      setEnabled(window.innerWidth >= 768 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch {
      setEnabled(false);
    }
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [28 * depth, -28 * depth]);

  if (reduce || !enabled) return <div ref={ref} className={className} style={style}>{children}</div>;

  return (
    <div ref={ref} className={className} style={style}>
      <motion.div style={{ y }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}
