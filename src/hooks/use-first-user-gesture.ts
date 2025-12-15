'use client';

import { useEffect } from 'react';

export function useFirstUserGesture(callback: () => void) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let called = false;

    const handler = () => {
      if (called) return;
      called = true;
      try {
        callback();
      } catch {}
      // cleanup handled by removeEventListener in return
    };

    window.addEventListener('pointerdown', handler, { once: true, passive: true } as any);
    window.addEventListener('keydown', handler, { once: true, passive: true } as any);

    return () => {
      try {
        window.removeEventListener('pointerdown', handler as any);
        window.removeEventListener('keydown', handler as any);
      } catch {}
    };
  }, [callback]);
}


