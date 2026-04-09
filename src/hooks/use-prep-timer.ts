import { useState, useEffect } from 'react';

interface PrepTimerResult {
  remainingSeconds: number;
  isOverdue: boolean;
  label: string;
  timerLabel: string;
}

/**
 * Hook that calculates a countdown timer.
 * Starts counting from `startedAt` and counts down `estimatedMinutes`.
 * Returns negative remainingSeconds when overdue.
 */
export function usePrepTimer(
  startedAt: string | null | undefined,
  estimatedMinutes: number | null | undefined,
  timerLabel: string = 'Preparo'
): PrepTimerResult | null {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!startedAt || !estimatedMinutes) return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [startedAt, estimatedMinutes]);

  if (!startedAt || !estimatedMinutes) return null;

  const startTime = new Date(startedAt).getTime();
  if (isNaN(startTime)) return null;

  const deadlineMs = startTime + estimatedMinutes * 60 * 1000;
  const remainingSeconds = Math.round((deadlineMs - now) / 1000);
  const isOverdue = remainingSeconds < 0;

  const absSeconds = Math.abs(remainingSeconds);
  const minutes = Math.floor(absSeconds / 60);
  const seconds = absSeconds % 60;
  const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const label = isOverdue ? `+${timeStr}` : timeStr;

  return { remainingSeconds, isOverdue, label, timerLabel };
}
