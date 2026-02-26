import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, useAnimation } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface UseScrollAnimationOptions {
  trigger?: boolean;
  threshold?: number;
  rootMargin?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'scale' | 'rotate';
  delay?: number;
  duration?: number;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    trigger = true,
    threshold = 0.1,
    rootMargin = '0px',
    animation = 'fadeIn',
    delay = 0,
    duration = 0.6,
  } = options;

  const { ref, inView } = useInView({
    threshold,
    rootMargin,
    triggerOnce: true,
  });

  const controls = useAnimation();

  useEffect(() => {
    if (inView && trigger) {
      const animations = {
        fadeIn: { opacity: [0, 1], y: [20, 0] },
        slideUp: { y: [50, 0], opacity: [0, 1] },
        slideDown: { y: [-50, 0], opacity: [0, 1] },
        scale: { scale: [0.8, 1], opacity: [0, 1] },
        rotate: { rotate: [10, 0], opacity: [0, 1] },
      };

      controls.start({
        ...animations[animation],
        transition: {
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1],
        },
      });
    }
  }, [inView, trigger, animation, delay, duration, controls]);

  return { ref, controls, inView };
}

export function useGSAPScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    gsap.fromTo(
      element,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 80%',
          end: 'bottom 20%',
          toggleActions: 'play none none reverse',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return ref;
}

