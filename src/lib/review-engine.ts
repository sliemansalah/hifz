import { PlanDay } from '@/types/plan';
import { UserProgress } from '@/types/progress';
import { planDays } from '@/data/plan';
import { getNearReviewDays, getJuzDayNumbers } from './plan-utils';

export interface ReviewTask {
  type: 'near' | 'far';
  days: PlanDay[];
  juz?: number;
  description: string;
}

export function getNearReview(progress: UserProgress): ReviewTask {
  const days = getNearReviewDays(progress.currentDay);
  return {
    type: 'near',
    days,
    description: `مراجعة آخر ${days.length} أيام`,
  };
}

export function getFarReview(progress: UserProgress): ReviewTask | null {
  const completedJuzSet = new Set<number>();
  for (const [dayStr] of Object.entries(progress.completedDays)) {
    const day = planDays.find(d => d.dayNumber === Number(dayStr));
    if (day) completedJuzSet.add(day.juz);
  }

  const completedJuzArray = Array.from(completedJuzSet).sort((a, b) => a - b);
  if (completedJuzArray.length === 0) return null;

  // Simple round-robin: pick the juz that was reviewed longest ago
  // For now, cycle through completed juz
  const totalCompleted = Object.keys(progress.completedDays).length;
  const juzIndex = totalCompleted % completedJuzArray.length;
  const targetJuz = completedJuzArray[juzIndex];

  const juzDayNums = getJuzDayNumbers(targetJuz);
  const days = planDays.filter(d => juzDayNums.includes(d.dayNumber));

  return {
    type: 'far',
    days,
    juz: targetJuz,
    description: `مراجعة الجزء ${targetJuz}`,
  };
}

export function getWeeklyReview(progress: UserProgress): ReviewTask {
  const currentDay = progress.currentDay;
  const weekStart = Math.max(1, currentDay - 6);
  const days = planDays.filter(d => d.dayNumber >= weekStart && d.dayNumber < currentDay);
  return {
    type: 'near',
    days,
    description: 'مراجعة حفظ الأسبوع (المعاهدة الأسبوعية)',
  };
}
