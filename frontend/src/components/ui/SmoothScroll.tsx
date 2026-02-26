import { useEffect } from 'react';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: React.ReactNode;
  options?: {
    duration?: number;
    easing?: (t: number) => number;
    smooth?: boolean;
    smoothTouch?: boolean;
    touchMultiplier?: number;
    wheelMultiplier?: number;
  };
}

export function SmoothScroll({ children, options }: SmoothScrollProps) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.8,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
      touchMultiplier: 2,
      wheelMultiplier: 0.5,
      ...options,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    /**
     * ✅ CRITICAL FIX:
     * Use event.composedPath() instead of target.closest()
     * This allows scrolling ANYWHERE inside the container,
     * not just when hovering the scrollbar.
     */
    const handleWheelCapture = (e: WheelEvent) => {
      const path = e.composedPath() as HTMLElement[];

      const scrollableContainer = path.find((el) => {
        if (!(el instanceof HTMLElement)) return false;

        if (
          el.dataset?.nativeScroll === 'true' ||
          el.dataset?.scrollable === 'true' ||
          el.classList?.contains('overflow-y-auto') ||
          el.classList?.contains('overflow-auto')
        ) {
          return el.scrollHeight > el.clientHeight;
        }

        return false;
      });

      if (scrollableContainer) {
        const container = scrollableContainer as HTMLElement;

        const isAtTop = container.scrollTop <= 0;
        const isAtBottom =
          container.scrollTop + container.clientHeight >=
          container.scrollHeight - 1;

        // Allow native scrolling INSIDE container
        if (
          !(isAtTop && e.deltaY < 0) &&
          !(isAtBottom && e.deltaY > 0)
        ) {
          e.stopPropagation(); // block Lenis
          return;
        }
      }
    };

    document.addEventListener('wheel', handleWheelCapture, {
      passive: false,
      capture: true,
    });

    return () => {
      lenis.destroy();
      document.removeEventListener(
        'wheel',
        handleWheelCapture,
        { capture: true } as EventListenerOptions
      );
    };
  }, [options]);

  return <>{children}</>;
}
