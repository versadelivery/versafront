'use client';

import { useCallback } from 'react';
import { useFirstUserGesture } from '@/hooks/use-first-user-gesture';

/**
 * Componente invisível que desbloqueia o AudioContext na primeira
 * interação do usuário. Deve ser montado uma única vez nos Providers.
 *
 * Navegadores mobile (especialmente iOS/Safari) bloqueiam o AudioContext
 * até que o usuário interaja com a página. Este componente resolve isso
 * criando e resumindo um AudioContext silencioso no primeiro gesto.
 */
export default function AudioUnlocker() {
  const unlock = useCallback(() => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();

      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          // Toca um buffer silencioso para garantir que o contexto está desbloqueado
          const buffer = ctx.createBuffer(1, 1, 22050);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
          console.log('🔊 AudioContext desbloqueado com sucesso');
        });
      }
    } catch (error) {
      // Silencioso — não é crítico
      console.warn('AudioUnlocker: falha ao desbloquear AudioContext', error);
    }
  }, []);

  useFirstUserGesture(unlock);

  // Componente invisível — não renderiza nada
  return null;
}
