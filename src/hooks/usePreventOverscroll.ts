import { useEffect } from 'react';

export function usePreventOverscroll() {
  useEffect(() => {
    let startY = 0;

    function onTouchStart(e: TouchEvent) {
      startY = e.touches[0].clientY;
    }

    function onTouchMove(e: TouchEvent) {
      const dy = e.touches[0].clientY - startY;
      const atTop = window.scrollY <= 0 && dy > 0;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight && dy < 0;

      if (atTop || atBottom) {
        e.preventDefault();
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);
}
