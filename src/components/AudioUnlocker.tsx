'use client';

import React from 'react';
import { useRestaurantSounds } from '@/hooks/use-restaurant-sounds';
import { useFirstUserGesture } from '@/hooks/use-first-user-gesture';

export default function AudioUnlocker() {
  const sounds = useRestaurantSounds();

  useFirstUserGesture(() => {
    if (!sounds.isUnlocked()) {
      // tentar desbloquear silenciosamente; erros são silenciosos
      sounds.unlockAudioWithUserGesture().catch(() => {});
    }
  });

  return null;
}


