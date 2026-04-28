import { useEffect, useRef } from 'react';

/**
 * Hook que executa um callback na primeira interação do usuário
 * (click, touchstart, keydown). Útil para desbloquear o AudioContext
 * em navegadores que exigem gesto do usuário antes de reproduzir áudio.
 */
export function useFirstUserGesture(callback: () => void) {
    const called = useRef(false);

    useEffect(() => {
        const handler = () => {
            if (called.current) return;
            called.current = true;
            callback();
            window.removeEventListener('click', handler, true);
            window.removeEventListener('touchstart', handler, true);
            window.removeEventListener('keydown', handler, true);
        };

        window.addEventListener('click', handler, true);
        window.addEventListener('touchstart', handler, true);
        window.addEventListener('keydown', handler, true);

        return () => {
            window.removeEventListener('click', handler, true);
            window.removeEventListener('touchstart', handler, true);
            window.removeEventListener('keydown', handler, true);
        };
    }, [callback]);
}
