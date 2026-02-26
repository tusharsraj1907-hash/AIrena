import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export const animations = {
  fadeIn: (element: HTMLElement, delay: number = 0) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, delay, ease: 'power2.out' }
    );
  },

  slideUp: (element: HTMLElement, delay: number = 0) => {
    gsap.fromTo(
      element,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, delay, ease: 'power3.out' }
    );
  },

  scaleIn: (element: HTMLElement, delay: number = 0) => {
    gsap.fromTo(
      element,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, delay, ease: 'back.out(1.7)' }
    );
  },

  stagger: (elements: HTMLElement[], delay: number = 0.1) => {
    gsap.fromTo(
      elements,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: delay,
        ease: 'power2.out',
      }
    );
  },

  scrollReveal: (element: HTMLElement, options: {
    start?: string;
    end?: string;
    delay?: number;
  } = {}) => {
    const { start = 'top 80%', end = 'bottom 20%', delay = 0 } = options;

    gsap.fromTo(
      element,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: element,
          start,
          end,
          toggleActions: 'play none none reverse',
        },
      }
    );
  },
};

export const easing = {
  easeOut: 'power2.out',
  easeInOut: 'power2.inOut',
  bounce: 'bounce.out',
  elastic: 'elastic.out(1, 0.3)',
  back: 'back.out(1.7)',
};

