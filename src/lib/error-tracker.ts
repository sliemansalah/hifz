import { ErrorEntry, AyahErrorSummary } from '@/types/error-log';
import { getItem, setItem } from './storage';

const ERRORS_KEY = 'error_log';

export function getErrors(): ErrorEntry[] {
  return getItem<ErrorEntry[]>(ERRORS_KEY, []);
}

export function addErrors(errors: ErrorEntry[]): void {
  const existing = getErrors();
  setItem(ERRORS_KEY, [...existing, ...errors]);
}

export function getAyahErrorSummaries(): AyahErrorSummary[] {
  const errors = getErrors();
  const map = new Map<string, AyahErrorSummary>();

  for (const err of errors) {
    const key = `${err.surahNumber}:${err.ayahNumber}`;
    const existing = map.get(key);
    if (existing) {
      existing.totalErrors++;
      existing.lastErrorDate = err.timestamp > existing.lastErrorDate ? err.timestamp : existing.lastErrorDate;
      existing.errorWords[err.wordIndex] = (existing.errorWords[err.wordIndex] || 0) + 1;
    } else {
      map.set(key, {
        surahNumber: err.surahNumber,
        ayahNumber: err.ayahNumber,
        totalErrors: 1,
        lastErrorDate: err.timestamp,
        errorWords: { [err.wordIndex]: 1 },
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.totalErrors - a.totalErrors);
}

export function getWeakAyahs(minErrors: number = 3): AyahErrorSummary[] {
  return getAyahErrorSummaries().filter(s => s.totalErrors >= minErrors);
}

export function getWeakWordIndices(surahNumber: number, ayahNumber: number): number[] {
  const summaries = getAyahErrorSummaries();
  const summary = summaries.find(
    s => s.surahNumber === surahNumber && s.ayahNumber === ayahNumber
  );
  if (!summary) return [];
  return Object.entries(summary.errorWords)
    .sort(([, a], [, b]) => b - a)
    .map(([idx]) => Number(idx));
}

// Get word-level error status for mushaf display
// Returns: 'red' (multiple errors), 'yellow' (one error), 'orange' (corrected), 'none'
export type WordErrorStatus = 'red' | 'yellow' | 'orange' | 'none';

export function getWordErrorStatuses(surahNumber: number, ayahNumber: number): Record<number, WordErrorStatus> {
  const errors = getErrors();
  const ayahErrors = errors.filter(
    e => e.surahNumber === surahNumber && e.ayahNumber === ayahNumber
  );

  if (ayahErrors.length === 0) return {};

  // Group by wordIndex
  const wordErrors = new Map<number, { count: number; timestamps: string[] }>();
  for (const err of ayahErrors) {
    const existing = wordErrors.get(err.wordIndex);
    if (existing) {
      existing.count++;
      existing.timestamps.push(err.timestamp);
    } else {
      wordErrors.set(err.wordIndex, { count: 1, timestamps: [err.timestamp] });
    }
  }

  // Check if there are recent correct sessions (no errors) for this ayah
  // by checking if the latest session had no errors for this ayah
  const allTimestamps = ayahErrors.map(e => e.timestamp).sort();
  const latestError = allTimestamps[allTimestamps.length - 1];

  const result: Record<number, WordErrorStatus> = {};
  for (const [wordIdx, data] of wordErrors) {
    if (data.count > 1) {
      // Check if latest error is old (corrected)
      const latestForWord = data.timestamps.sort()[data.timestamps.length - 1];
      if (latestForWord < latestError) {
        result[wordIdx] = 'orange'; // corrected
      } else {
        result[wordIdx] = 'red'; // multiple errors
      }
    } else {
      result[wordIdx] = 'yellow'; // single error
    }
  }

  return result;
}

// Get ayah-level error status for mushaf overview
export function getAyahErrorStatus(surahNumber: number, ayahNumber: number): WordErrorStatus {
  const statuses = getWordErrorStatuses(surahNumber, ayahNumber);
  const values = Object.values(statuses);
  if (values.length === 0) return 'none';
  if (values.includes('red')) return 'red';
  if (values.includes('yellow')) return 'yellow';
  return 'orange';
}

// Batch: compute ayah-level error status for ALL ayahs in one localStorage read
// Returns Map keyed by "surahNumber:ayahNumber" → WordErrorStatus
export function getAllAyahErrorStatuses(): Map<string, WordErrorStatus> {
  const errors = getErrors();
  if (errors.length === 0) return new Map();

  // Group errors by ayah
  const ayahMap = new Map<string, { wordErrors: Map<number, { count: number; timestamps: string[] }>; allTimestamps: string[] }>();
  for (const err of errors) {
    const key = `${err.surahNumber}:${err.ayahNumber}`;
    let entry = ayahMap.get(key);
    if (!entry) {
      entry = { wordErrors: new Map(), allTimestamps: [] };
      ayahMap.set(key, entry);
    }
    entry.allTimestamps.push(err.timestamp);
    const existing = entry.wordErrors.get(err.wordIndex);
    if (existing) {
      existing.count++;
      existing.timestamps.push(err.timestamp);
    } else {
      entry.wordErrors.set(err.wordIndex, { count: 1, timestamps: [err.timestamp] });
    }
  }

  // Compute status per ayah
  const result = new Map<string, WordErrorStatus>();
  for (const [key, entry] of ayahMap) {
    const latestError = entry.allTimestamps.sort()[entry.allTimestamps.length - 1];
    let hasRed = false, hasYellow = false, allOrange = true;
    for (const [, data] of entry.wordErrors) {
      if (data.count > 1) {
        const latestForWord = data.timestamps.sort()[data.timestamps.length - 1];
        if (latestForWord < latestError) {
          // orange (corrected)
        } else {
          hasRed = true;
          allOrange = false;
        }
      } else {
        hasYellow = true;
        allOrange = false;
      }
    }
    if (hasRed) result.set(key, 'red');
    else if (hasYellow) result.set(key, 'yellow');
    else if (allOrange) result.set(key, 'orange');
  }

  return result;
}

export function clearErrors(): void {
  setItem(ERRORS_KEY, []);
}
