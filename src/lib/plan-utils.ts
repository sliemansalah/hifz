import { planDays, TOTAL_DAYS } from '@/data/plan';
import { PlanDay } from '@/types/plan';

export function getDaysForRange(start: number, end: number): PlanDay[] {
  return planDays.filter(d => d.dayNumber >= start && d.dayNumber <= end);
}

export function getNearReviewDays(currentDay: number): PlanDay[] {
  const start = Math.max(1, currentDay - 5);
  const end = currentDay - 1;
  return getDaysForRange(start, end);
}

export function getJuzDayNumbers(juz: number): number[] {
  return planDays.filter(d => d.juz === juz).map(d => d.dayNumber);
}

export function getDayRangeText(days: PlanDay[]): string {
  if (days.length === 0) return '';
  if (days.length === 1) {
    const d = days[0];
    return `${d.surahName} (${d.startAyah}–${d.endAyah})`;
  }
  const first = days[0];
  const last = days[days.length - 1];
  if (first.surahName === last.surahName) {
    return `${first.surahName} (${first.startAyah}–${last.endAyah})`;
  }
  return `${first.surahName} (${first.startAyah}) – ${last.surahName} (${last.endAyah})`;
}

export function getProgressPercentage(completedDays: number): number {
  return Math.round((completedDays / TOTAL_DAYS) * 100 * 10) / 10;
}
