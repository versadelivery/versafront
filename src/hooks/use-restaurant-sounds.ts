import { useCallback, useRef, useState, useEffect } from 'react';

export interface RestaurantSounds {
  orderAccepted: () => void;
  orderReady: () => void;
  newOrder: () => void;
  playSound: (soundType: 'orderAccepted' | 'orderReady' | 'newOrder') => void;
  updateSettings: (settings: SoundSettings) => void;
  unlockAudioWithUserGesture: () => Promise<boolean>;
  isUnlocked: () => boolean;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number;
  orderAccepted: boolean;
  orderReady: boolean;
  newOrder: boolean;
}

export function useRestaurantSounds(): RestaurantSounds {
  const audioRefs = useRef<Record<string, HTMLAudioElement>>({});
  const [settings, setSettings] = useState<SoundSettings>({
    enabled: true,
    volume: 0.7,
    orderAccepted: true,
    orderReady: true,
    newOrder: true,
  });
  const unlockedRef = useRef<boolean>(false);
  const [isUnlockedState, setIsUnlockedState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('restaurant-sound-unlocked') === '1';
    } catch {
      return false;
    }
  });

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('restaurant-sound-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
      } catch (error) {
        console.warn('Erro ao carregar configurações de som:', error);
      }
    }
    // Listener para sincronizar alterações de configurações no mesmo tab (custom event) e entre tabs (storage)
    const customHandler = (e: any) => {
      try {
        if (e?.detail) {
          setSettings(e.detail);
        }
      } catch {}
    };
    const storageHandler = (e: StorageEvent) => {
      if (e.key === 'restaurant-sound-settings' && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener('restaurant-sound-settings-changed', customHandler as any);
    window.addEventListener('storage', storageHandler);
    return () => {
      window.removeEventListener('restaurant-sound-settings-changed', customHandler as any);
      window.removeEventListener('storage', storageHandler);
    };
  }, []);

  // Se havia sido desbloqueado anteriormente, marcar como desbloqueado em memória
  useEffect(() => {
    if (isUnlockedState) {
      unlockedRef.current = true;
    }
  }, [isUnlockedState]);

  // Função para criar e configurar um elemento de áudio
  const createAudio = useCallback((src: string, volume: number = 0.7): HTMLAudioElement => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.preload = 'auto';
    return audio;
  }, []);

  // Função para desbloquear áudio através de gesto do usuário (deve ser chamado em um click/tap)
  const unlockAudioWithUserGesture = useCallback(async (): Promise<boolean> => {
    if (unlockedRef.current) {
      return true;
    }

    try {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) {
        // sem suporte ao AudioContext, marcar desbloqueado para evitar repetição
        unlockedRef.current = true;
        setIsUnlockedState(true);
        try { localStorage.setItem('restaurant-sound-unlocked', '1'); } catch {}
        return true;
      }

      let audioContext: AudioContext | null = (window as any).__restaurantAudioContext || null;
      if (!audioContext) {
        audioContext = new AC();
        (window as any).__restaurantAudioContext = audioContext;
      }

      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Tocar um pulso muito curto e silencioso para "destravar" a reprodução
      try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.03);
      } catch (e) {
        // não crítico; só tentamos desbloquear
      }

      unlockedRef.current = true;
      setIsUnlockedState(true);
      try { localStorage.setItem('restaurant-sound-unlocked', '1'); } catch {}
      return true;
    } catch (error) {
      console.warn('Falha ao desbloquear áudio:', error);
      return false;
    }
  }, []);

  // Função para tocar som de pedido aceito (som de sino/ding)
  const orderAccepted = useCallback(() => {
    // Verificar se o som está habilitado
    if (!settings.enabled || !settings.orderAccepted) {
      return;
    }

    try {
      // Criar um som de sino usando Web Audio API para um som mais profissional
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configurar o som como um sino de restaurante
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Frequência base
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1); // Frequência alta
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3); // Frequência baixa
      
      gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('🔔 Som de pedido aceito tocado');
    } catch (error) {
      console.warn('Erro ao tocar som de pedido aceito:', error);
      // Fallback para som simples se Web Audio API falhar
      fallbackOrderAccepted();
    }
  }, [settings.enabled, settings.orderAccepted, settings.volume]);

  // Fallback para som simples
  const fallbackOrderAccepted = useCallback(() => {
    try {
      // Criar um beep simples usando um oscilador de áudio
      const audio = new Audio();
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn('Fallback de som também falhou:', error);
    }
  }, []);

  // Função para tocar som de pedido pronto
  const orderReady = useCallback(() => {
    // Verificar se o som está habilitado
    if (!settings.enabled || !settings.orderReady) {
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Som diferente para pedido pronto (duas notas)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);
      
      console.log('🔔 Som de pedido pronto tocado');
    } catch (error) {
      console.warn('Erro ao tocar som de pedido pronto:', error);
    }
  }, [settings.enabled, settings.orderReady, settings.volume]);

  // Função para tocar som de novo pedido
  const newOrder = useCallback(() => {
    // Verificar se o som está habilitado
    if (!settings.enabled || !settings.newOrder) {
      console.log('🔇 Som desabilitado ou newOrder desabilitado nas configurações');
      return;
    }

    try {
      // Tentar resumir o contexto de áudio se estiver suspenso (requer interação do usuário)
      let audioContext: AudioContext | null = null;
      
      // Verificar se já existe um contexto de áudio global
      if (!(window as any).__restaurantAudioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        (window as any).__restaurantAudioContext = audioContext;
      } else {
        audioContext = (window as any).__restaurantAudioContext;
      }

      // Se o contexto estiver suspenso, tentar resumir
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          console.log('🔊 Contexto de áudio retomado');
        }).catch((err) => {
          console.warn('⚠️ Não foi possível retomar o contexto de áudio:', err);
          // Tentar criar um novo contexto
          audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          (window as any).__restaurantAudioContext = audioContext;
        });
      }

      if (!audioContext) {
        console.warn('⚠️ Não foi possível criar contexto de áudio');
        return;
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Som de notificação para novo pedido (mais chamativo)
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.3);
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(settings.volume, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
      
      console.log('🔔 Som de novo pedido tocado com sucesso');
    } catch (error) {
      console.warn('❌ Erro ao tocar som de novo pedido:', error);
      // Tentar fallback com Audio element
      try {
        const audio = new Audio();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 600;
        gainNode.gain.value = settings.volume * 0.3;
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (fallbackError) {
        console.warn('❌ Fallback de som também falhou:', fallbackError);
      }
    }
  }, [settings.enabled, settings.newOrder, settings.volume]);

  // Função genérica para tocar qualquer som
  const playSound = useCallback((soundType: 'orderAccepted' | 'orderReady' | 'newOrder') => {
    switch (soundType) {
      case 'orderAccepted':
        orderAccepted();
        break;
      case 'orderReady':
        orderReady();
        break;
      case 'newOrder':
        newOrder();
        break;
      default:
        console.warn('Tipo de som não reconhecido:', soundType);
    }
  }, [orderAccepted, orderReady, newOrder]);

  // Função para atualizar configurações
  const updateSettings = useCallback((newSettings: SoundSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('restaurant-sound-settings', JSON.stringify(newSettings));
      window.dispatchEvent(new CustomEvent('restaurant-sound-settings-changed', { detail: newSettings }));
    } catch {}
  }, []);

  return {
    orderAccepted,
    orderReady,
    newOrder,
    playSound,
    unlockAudioWithUserGesture,
    isUnlocked: () => !!unlockedRef.current || isUnlockedState,
    updateSettings
  };
}
