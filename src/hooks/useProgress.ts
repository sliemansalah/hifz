'use client';

import { useLocalStorage } from './useLocalStorage';
import { UserProgress, DayCompletion } from '@/types/progress';
import { emptyProgress, calculateOverallProgress, calculateStreak, getCompletedCount } from '@/lib/progress-calculator';
import { todayISO } from '@/lib/date-utils';

const PASS_THRESHOLD = 80; // minimum score to count as "tested"

export function useProgress() {
  const [progress, setProgress] = useLocalStorage<UserProgress>('progress', emptyProgress);

  // Mark a day as memorized (from memorize page)
  const markMemorized = (dayNumber: number, repetitions: number) => {
    setProgress(prev => {
      const existing = prev.completedDays[dayNumber] || {} as Partial<DayCompletion>;
      const completion: DayCompletion = {
        ...existing,
        dayNumber,
        completedAt: todayISO(),
        repetitions,
        memorized: true,
      };
      const newCompleted = { ...prev.completedDays, [dayNumber]: completion };
      return {
        ...prev,
        completedDays: newCompleted,
        lastActiveDate: todayISO(),
      };
    });
  };

  // Mark a day as tested (from test pages). Advances currentDay if both memorized & tested.
  const markTested = (dayNumber: number, score: number, testType: 'written' | 'word-hide' | 'oral' | 'tap') => {
    setProgress(prev => {
      const existing = prev.completedDays[dayNumber] || {} as Partial<DayCompletion>;
      const passed = score >= PASS_THRESHOLD;
      const completion: DayCompletion = {
        ...existing,
        dayNumber,
        completedAt: todayISO(),
        repetitions: existing.repetitions || 0,
        score: Math.max(score, existing.score || 0), // keep best score
        testType,
        tested: passed || existing.tested || false,
        memorized: existing.memorized || false,
      };
      const newCompleted = { ...prev.completedDays, [dayNumber]: completion };

      // Advance currentDay if this day is fully complete (memorized + tested)
      let newCurrentDay = prev.currentDay;
      if (completion.memorized && completion.tested) {
        const maxFullyComplete = Math.max(
          ...Object.entries(newCompleted)
            .filter(([, c]) => c.memorized && c.tested)
            .map(([k]) => Number(k)),
          0
        );
        newCurrentDay = Math.max(prev.currentDay, maxFullyComplete + 1);
      }

      return {
        ...prev,
        completedDays: newCompleted,
        currentDay: newCurrentDay,
        lastActiveDate: todayISO(),
      };
    });
  };

  // Legacy: complete day directly (for backward compat)
  const completeDay = (dayNumber: number, repetitions: number, score?: number) => {
    setProgress(prev => {
      const completion: DayCompletion = {
        dayNumber,
        completedAt: todayISO(),
        repetitions,
        score,
        memorized: true,
        tested: score !== undefined && score >= PASS_THRESHOLD,
      };
      const newCompleted = { ...prev.completedDays, [dayNumber]: completion };
      const maxCompleted = Math.max(...Object.keys(newCompleted).map(Number), 0);
      return {
        ...prev,
        completedDays: newCompleted,
        currentDay: Math.max(prev.currentDay, maxCompleted + 1),
        lastActiveDate: todayISO(),
      };
    });
  };

  const completeDays = (dayNumbers: number[], repetitions: number) => {
    setProgress(prev => {
      const newCompleted = { ...prev.completedDays };
      for (const dn of dayNumbers) {
        newCompleted[dn] = {
          ...(newCompleted[dn] || {}),
          dayNumber: dn,
          completedAt: todayISO(),
          repetitions,
          memorized: true,
        } as DayCompletion;
      }
      return {
        ...prev,
        completedDays: newCompleted,
        lastActiveDate: todayISO(),
      };
    });
  };

  const isDayCompleted = (dayNumber: number): boolean => {
    const c = progress.completedDays[dayNumber];
    return !!(c?.memorized && c?.tested);
  };

  const isDayMemorized = (dayNumber: number): boolean => {
    return !!progress.completedDays[dayNumber]?.memorized;
  };

  const isDayTested = (dayNumber: number): boolean => {
    return !!progress.completedDays[dayNumber]?.tested;
  };

  const getDayScore = (dayNumber: number): number | undefined => {
    return progress.completedDays[dayNumber]?.score;
  };

  return {
    progress,
    completeDay,
    completeDays,
    markMemorized,
    markTested,
    isDayCompleted,
    isDayMemorized,
    isDayTested,
    getDayScore,
    overallProgress: calculateOverallProgress(progress),
    streak: calculateStreak(progress),
    completedCount: getCompletedCount(progress),
    currentDay: progress.currentDay,
  };
}
