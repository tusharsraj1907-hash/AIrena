import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform, useSpring } from 'framer-motion';

interface UseParallaxOptions {
  speed?: number;
  offset?: number[];
  clamp?: boolean;
}

export function useParallax(options: UseParallaxOptions = {}) {
  const { speed = 0.5, offset = ['start end', 'end start'], clamp = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset,
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 100]);
  const smoothY = useSpring(y, { stiffness: 100, damping: 30 });

  return {
    ref,
    style: {
      y: clamp ? smoothY : y,
    },
  };
}

export function useParallaxValue(value: number, speed: number = 0.5) {
  const { scrollYProgress } = useScroll();
  return useTransform(scrollYProgress, [0, 1], [value, value * (1 + speed)]);
}

