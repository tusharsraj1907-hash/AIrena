import { useRef, useState, useEffect } from 'react';
import { useMotionValue, useSpring, useTransform } from 'framer-motion';

interface Use3DTransformOptions {
  intensity?: number;
  perspective?: number;
  disabled?: boolean;
}

export function use3DTransform(options: Use3DTransformOptions = {}) {
  const { intensity = 15, perspective = 1000, disabled = false } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseYSpring = useSpring(y, { stiffness: 500, damping: 100 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [intensity, -intensity]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-intensity, intensity]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (disabled || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseEnter = () => {
    if (!disabled) setIsHovered(true);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return {
    ref,
    isHovered,
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseEnter,
    handleMouseLeave,
    style: {
      perspective,
      transformStyle: 'preserve-3d' as const,
    },
  };
}

