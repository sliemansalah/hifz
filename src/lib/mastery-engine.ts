import { MasteryData, AyahMastery, MasteryLevel, DrillResult, MasteryStats, ErrorTrendWeek, ErrorTypeBreakdown } from '@/types/mastery';
import { getItem, setItem } from './storage';
import { getErrors, getAyahErrorSummaries } from './error-tracker';

const MASTERY_KEY = 'mastery_data';

function getData(): MasteryData {
  return getItem<MasteryData>(MASTERY_KEY, { ayahs: {} });
}

function saveData(data: MasteryData): void {
  setItem(MASTERY_KEY, data);
}

function ayahKey(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}:${ayahNumber}`;
}

function determineLevelFromErrors(totalErrors: number, drillAttempts: number, lastDrillScore?: number): MasteryLevel {
  if (drillAttempts > 0 && lastDrillScore !== undefined && lastDrillScore >= 90) {
    return 'mastered';
  }
  if (drillAttempts > 0) {
    return 'practicing';
  }
  return 'new';
}

// Calculate next review date using spaced repetition
function calculateNextReview(mastery: AyahMastery): string {
  const now = new Date();
  const attempts = mastery.drillAttempts;
  const score = mastery.lastDrillScore || 0;

  // Simple spaced repetition: interval doubles with each successful attempt
  let intervalDays: number;
  if (score >= 90) {
    intervalDays = Math.min(Math.pow(2, attempts), 30); // 1, 2, 4, 8, 16, 30 days
  } else if (score >= 70) {
    intervalDays = Math.min(Math.pow(2, Math.max(0, attempts - 1)), 14); // slower progression
  } else {
    intervalDays = 1; // review tomorrow
  }

  const nextDate = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
  return nextDate.toISOString().split('T')[0];
}

/** Sync mastery data from the error log - creates entries for ayahs with errors */
export function syncMasteryFromErrors(): MasteryData {
  const data = getData();
  const summaries = getAyahErrorSummaries();

  for (const summary of summaries) {
    const key = ayahKey(summary.surahNumber, summary.ayahNumber);
    const existing = data.ayahs[key];
    if (existing) {
      existing.totalErrors = summary.totalErrors;
      existing.level = determineLevelFromErrors(summary.totalErrors, existing.drillAttempts, existing.lastDrillScore);
    } else {
      data.ayahs[key] = {
        surahNumber: summary.surahNumber,
        ayahNumber: summary.ayahNumber,
        level: 'new',
        totalErrors: summary.totalErrors,
        drillAttempts: 0,
        history: [],
      };
    }
  }

  data.lastSyncDate = new Date().toISOString();
  saveData(data);
  return data;
}

/** Record a drill result for an ayah */
export function recordDrillResult(surahNumber: number, ayahNumber: number, score: number, errors: number): { previousLevel: MasteryLevel; newLevel: MasteryLevel } {
  const data = getData();
  const key = ayahKey(surahNumber, ayahNumber);
  const existing = data.ayahs[key];

  const result: DrillResult = {
    date: new Date().toISOString(),
    score,
    errors,
  };

  const previousLevel = existing?.level || 'new';

  if (existing) {
    existing.drillAttempts++;
    existing.lastDrillDate = result.date;
    existing.lastDrillScore = score;
    existing.history.push(result);
    existing.level = determineLevelFromErrors(existing.totalErrors, existing.drillAttempts, score);
    existing.nextReviewDate = calculateNextReview(existing);
  } else {
    const newMastery: AyahMastery = {
      surahNumber,
      ayahNumber,
      level: score >= 90 ? 'mastered' : 'practicing',
      totalErrors: errors,
      drillAttempts: 1,
      lastDrillDate: result.date,
      lastDrillScore: score,
      history: [result],
    };
    newMastery.nextReviewDate = calculateNextReview(newMastery);
    data.ayahs[key] = newMastery;
  }

  saveData(data);
  return { previousLevel, newLevel: data.ayahs[key].level };
}

/** Get ayahs due for review based on spaced repetition */
export function getDueForReview(): AyahMastery[] {
  const data = getData();
  const today = new Date().toISOString().split('T')[0];

  return Object.values(data.ayahs)
    .filter(a => a.level !== 'mastered' || (a.nextReviewDate && a.nextReviewDate <= today))
    .sort((a, b) => {
      // Prioritize: new > practicing > mastered, then by error count
      const levelOrder: Record<MasteryLevel, number> = { new: 0, practicing: 1, mastered: 2 };
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      if (levelDiff !== 0) return levelDiff;
      return b.totalErrors - a.totalErrors;
    });
}

/** Get the weakest ayahs for drilling */
export function getWeakestForDrill(count: number = 5): AyahMastery[] {
  const data = syncMasteryFromErrors();

  return Object.values(data.ayahs)
    .filter(a => a.level !== 'mastered')
    .sort((a, b) => {
      // Sort by: level priority (new first), then most errors
      const levelOrder: Record<MasteryLevel, number> = { new: 0, practicing: 1, mastered: 2 };
      const levelDiff = levelOrder[a.level] - levelOrder[b.level];
      if (levelDiff !== 0) return levelDiff;
      return b.totalErrors - a.totalErrors;
    })
    .slice(0, count);
}

/** Get weekly error trends for the last 8 weeks */
export function getErrorTrends(): ErrorTrendWeek[] {
  const errors = getErrors();
  const weeks: ErrorTrendWeek[] = [];
  const now = new Date();

  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date(now.getTime() - (i * 7 + 6) * 24 * 60 * 60 * 1000);
    const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    const count = errors.filter(e => {
      const d = e.timestamp.split('T')[0];
      return d >= startStr && d <= endStr;
    }).length;

    weeks.push({
      weekLabel: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
      errorCount: count,
      startDate: startStr,
    });
  }

  return weeks;
}

/** Get breakdown of error types */
export function getErrorTypeBreakdown(): ErrorTypeBreakdown {
  const errors = getErrors();
  const breakdown: ErrorTypeBreakdown = { substitution: 0, deletion: 0, addition: 0, order: 0 };

  for (const err of errors) {
    if (err.type in breakdown) {
      breakdown[err.type as keyof ErrorTypeBreakdown]++;
    }
  }

  return breakdown;
}

/** Get mastery statistics */
export function getMasteryStats(): MasteryStats {
  const data = syncMasteryFromErrors();
  const ayahs = Object.values(data.ayahs);

  return {
    total: ayahs.length,
    new: ayahs.filter(a => a.level === 'new').length,
    practicing: ayahs.filter(a => a.level === 'practicing').length,
    mastered: ayahs.filter(a => a.level === 'mastered').length,
  };
}

/** Get mastery level for a specific ayah */
export function getAyahMasteryLevel(surahNumber: number, ayahNumber: number): MasteryLevel | null {
  const data = getData();
  const key = ayahKey(surahNumber, ayahNumber);
  return data.ayahs[key]?.level || null;
}
