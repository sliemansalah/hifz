import { PlanDay } from '@/types/plan';
import { UserProgress } from '@/types/progress';
import { planDays } from '@/data/plan';
import { getNearReviewDays, getJuzDayNumbers } from './plan-utils';
import { getItem, setItem } from './storage';

export interface ReviewTask {
  type: 'near' | 'far';
  days: PlanDay[];
  juz?: number;
  description: string;
}

interface FarReviewEntry {
  juz: number;
  lastReviewed: string; // ISO date
  avgScore: number;
}

const FAR_REVIEW_LOG_KEY = 'far_review_log';

function getFarReviewLog(): FarReviewEntry[] {
  return getItem<FarReviewEntry[]>(FAR_REVIEW_LOG_KEY, []);
}

export function logFarReview(juz: number, score: number): void {
  const log = getFarReviewLog();
  const existing = log.find(e => e.juz === juz);
  if (existing) {
    existing.lastReviewed = new Date().toISOString();
    // Running average
    existing.avgScore = Math.round((existing.avgScore + score) / 2);
  } else {
    log.push({ juz, lastReviewed: new Date().toISOString(), avgScore: score });
  }
  setItem(FAR_REVIEW_LOG_KEY, log);
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

  // Smart selection: prioritize oldest reviewed + weakest score
  const reviewLog = getFarReviewLog();
  const logMap = new Map(reviewLog.map(e => [e.juz, e]));

  // Score each juz by: days since last review + inverse of avg score
  const now = Date.now();
  const scored = completedJuzArray.map(juz => {
    const entry = logMap.get(juz);
    const daysSinceReview = entry
      ? (now - new Date(entry.lastReviewed).getTime()) / (1000 * 60 * 60 * 24)
      : 999; // Never reviewed = very high priority
    const weaknessScore = entry ? (100 - entry.avgScore) : 50; // Unknown = medium weakness
    // Combined priority: older + weaker = higher score
    const priority = daysSinceReview * 2 + weaknessScore;
    return { juz, priority, daysSinceReview };
  });

  // Sort by priority descending and pick the highest
  scored.sort((a, b) => b.priority - a.priority);
  const targetJuz = scored[0].juz;

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
