'use client';

import { useProgress } from './useProgress';

export function useStreak() {
  const { streak } = useProgress();
  return streak;
}
