import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/**
 * Scroll-linked 3D parallax wrapper for landing body sections.
 * Outer section keeps layout stable; inner content drifts in Y,
 * tilts on X and settles in scale — giving a smooth 3D depth feel
 * while Lenis smooth-scrolls the page. Disabled for reduced-motion.
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [56 * depth, -56 * depth]);
  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [8 * depth, 0, -8 * depth]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.975, 1, 0.985]);

  if (reduce) return <div className={className} style={style}>{children}</div>;

  return (
    <div ref={ref} className={`parallax-stage ${className}`} style={{ perspective: 1400, ...style }}>
      <motion.div
        style={{ y, rotateX, scale, transformPerspective: 1200, transformStyle: 'preserve-3d' }}
        className="parallax-will-change will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}
