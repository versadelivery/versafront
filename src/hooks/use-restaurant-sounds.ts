import { useCallback, useRef, useState, useEffect } from 'react';

export interface RestaurantSounds {
  orderAccepted: () => void;
  orderReady: () => void;
  newOrder: () => void;
  orderOverdue: () => void;
  playSound: (soundType: 'orderAccepted' | 'orderReady' | 'newOrder' | 'orderOverdue') => void;
  updateSettings: (settings: SoundSettings) => void;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number;
  orderAccepted: boolean;
  orderReady: boolean;
  newOrder: boolean;
  orderOverdue?: boolean;
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

  // Função para criar e configurar um elemento de áudio
  const createAudio = useCallback((src: string, volume: number = 0.7): HTMLAudioElement => {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.preload = 'auto';
    return audio;
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
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Som de notificação para novo pedido
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
      
      console.log('🔔 Som de novo pedido tocado');
    } catch (error) {
      console.warn('Erro ao tocar som de novo pedido:', error);
    }
  }, [settings.enabled, settings.newOrder, settings.volume]);

  // Função para tocar som de pedido atrasado (urgente, tom grave repetido)
  const orderOverdue = useCallback(() => {
    if (!settings.enabled || settings.orderOverdue === false) {
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = audioContext.currentTime;

      // Três beeps graves e urgentes
      for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(300, now + i * 0.25);
        oscillator.frequency.setValueAtTime(200, now + i * 0.25 + 0.1);

        gainNode.gain.setValueAtTime(settings.volume, now + i * 0.25);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + i * 0.25 + 0.2);

        oscillator.start(now + i * 0.25);
        oscillator.stop(now + i * 0.25 + 0.2);
      }
    } catch (error) {
      console.warn('Erro ao tocar som de pedido atrasado:', error);
    }
  }, [settings.enabled, settings.orderOverdue, settings.volume]);

  // Função genérica para tocar qualquer som
  const playSound = useCallback((soundType: 'orderAccepted' | 'orderReady' | 'newOrder' | 'orderOverdue') => {
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
      case 'orderOverdue':
        orderOverdue();
        break;
      default:
        console.warn('Tipo de som não reconhecido:', soundType);
    }
  }, [orderAccepted, orderReady, newOrder, orderOverdue]);

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
    orderOverdue,
    playSound,
    updateSettings
  };
}
