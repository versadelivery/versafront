'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Volume2, VolumeX, Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SoundSettingsProps {
  onSettingsChange: (settings: SoundSettings) => void;
}

export interface SoundSettings {
  enabled: boolean;
  volume: number;
  orderAccepted: boolean;
  orderReady: boolean;
  newOrder: boolean;
}

const defaultSettings: SoundSettings = {
  enabled: true,
  volume: 0.7,
  orderAccepted: true,
  orderReady: true,
  newOrder: true,
};

export function SoundSettings({ onSettingsChange }: SoundSettingsProps) {
  const [settings, setSettings] = useState<SoundSettings>(defaultSettings);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar configurações do localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('restaurant-sound-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
        onSettingsChange({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.warn('Erro ao carregar configurações de som:', error);
      }
    } else {
      onSettingsChange(defaultSettings);
    }
  }, [onSettingsChange]);

  // Salvar configurações no localStorage
  const saveSettings = (newSettings: SoundSettings) => {
    setSettings(newSettings);
    localStorage.setItem('restaurant-sound-settings', JSON.stringify(newSettings));
    onSettingsChange(newSettings);
  };

  const toggleSound = (type: keyof Omit<SoundSettings, 'enabled' | 'volume'>) => {
    const newSettings = {
      ...settings,
      [type]: !settings[type]
    };
    saveSettings(newSettings);
  };

  const updateVolume = (volume: number[]) => {
    const newSettings = {
      ...settings,
      volume: volume[0]
    };
    saveSettings(newSettings);
  };

  const toggleGlobalSound = () => {
    const newSettings = {
      ...settings,
      enabled: !settings.enabled
    };
    saveSettings(newSettings);
  };

  const testSound = (type: 'orderAccepted' | 'orderReady' | 'newOrder') => {
    if (!settings.enabled) return;
    
    // Simular o som para teste
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    let frequency = 800;
    let duration = 0.5;
    
    switch (type) {
      case 'orderAccepted':
        frequency = 800;
        duration = 0.5;
        break;
      case 'orderReady':
        frequency = 600;
        duration = 0.6;
        break;
      case 'newOrder':
        frequency = 400;
        duration = 0.4;
        break;
    }
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(settings.volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        {settings.enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        Som
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              {settings.enabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              Configurações de Som
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Som Global */}
            <div className="flex items-center justify-between">
              <Label htmlFor="global-sound" className="text-sm">
                Ativar Sons
              </Label>
              <Switch
                id="global-sound"
                checked={settings.enabled}
                onCheckedChange={toggleGlobalSound}
              />
            </div>

            {/* Volume */}
            <div className="space-y-2">
              <Label className="text-sm">Volume</Label>
              <Slider
                value={[settings.volume]}
                onValueChange={updateVolume}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
                disabled={!settings.enabled}
              />
              <div className="text-xs text-gray-500 text-center">
                {Math.round(settings.volume * 100)}%
              </div>
            </div>

            {/* Sons Específicos */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Sons Disponíveis</Label>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="order-accepted" className="text-sm">
                    Pedido Aceito
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="order-accepted"
                      checked={settings.orderAccepted && settings.enabled}
                      onCheckedChange={() => toggleSound('orderAccepted')}
                      disabled={!settings.enabled}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testSound('orderAccepted')}
                      disabled={!settings.enabled || !settings.orderAccepted}
                      className="h-6 px-2 text-xs"
                    >
                      Testar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="order-ready" className="text-sm">
                    Pedido Pronto
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="order-ready"
                      checked={settings.orderReady && settings.enabled}
                      onCheckedChange={() => toggleSound('orderReady')}
                      disabled={!settings.enabled}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testSound('orderReady')}
                      disabled={!settings.enabled || !settings.orderReady}
                      className="h-6 px-2 text-xs"
                    >
                      Testar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="new-order" className="text-sm">
                    Novo Pedido
                  </Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="new-order"
                      checked={settings.newOrder && settings.enabled}
                      onCheckedChange={() => toggleSound('newOrder')}
                      disabled={!settings.enabled}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testSound('newOrder')}
                      disabled={!settings.enabled || !settings.newOrder}
                      className="h-6 px-2 text-xs"
                    >
                      Testar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

