import { UserProgress, DayCompletion } from '@/types/progress';
import { TOTAL_DAYS } from '@/data/plan';
import { daysBetween, todayISO } from './date-utils';

export function calculateOverallProgress(progress: UserProgress): number {
  // Only count days that are both memorized AND tested
  const completed = Object.values(progress.completedDays)
    .filter(c => c.memorized && c.tested).length;
  return Math.round((completed / TOTAL_DAYS) * 100 * 10) / 10;
}

export function calculateJuzProgress(progress: UserProgress, juzDays: number[]): number {
  const completed = juzDays.filter(d => {
    const c = progress.completedDays[d];
    return c?.memorized && c?.tested;
  }).length;
  return juzDays.length > 0 ? Math.round((completed / juzDays.length) * 100) : 0;
}

export function getCompletedCount(progress: UserProgress): number {
  return Object.values(progress.completedDays)
    .filter(c => c.memorized && c.tested).length;
}

export function calculateStreak(progress: UserProgress): number {
  const completions = Object.values(progress.completedDays)
    .map(c => c.completedAt)
    .sort()
    .reverse();

  if (completions.length === 0) return 0;

  const today = todayISO();
  const lastDate = completions[0];
  const daysSinceLast = daysBetween(lastDate, today);

  if (daysSinceLast > 1) return 0;

  let streak = 1;
  for (let i = 1; i < completions.length; i++) {
    const diff = daysBetween(completions[i], completions[i - 1]);
    if (diff <= 1 && completions[i] !== completions[i - 1]) {
      streak++;
    } else if (diff > 1) {
      break;
    }
  }

  return streak;
}

export function getRecentCompletions(progress: UserProgress, count: number): DayCompletion[] {
  return Object.values(progress.completedDays)
    .sort((a, b) => b.dayNumber - a.dayNumber)
    .slice(0, count);
}

export function getNextDay(progress: UserProgress): number {
  return progress.currentDay;
}

export const emptyProgress: UserProgress = {
  completedDays: {},
  currentDay: 1,
  startDate: todayISO(),
  lastActiveDate: todayISO(),
};
