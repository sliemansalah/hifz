export type MasteryLevel = 'new' | 'practicing' | 'mastered';

export interface AyahMastery {
  surahNumber: number;
  ayahNumber: number;
  level: MasteryLevel;
  totalErrors: number;
  drillAttempts: number;
  lastDrillDate?: string; // ISO date
  lastDrillScore?: number; // 0-100
  nextReviewDate?: string; // ISO date for spaced repetition
  history: DrillResult[];
}

export interface DrillResult {
  date: string;
  score: number; // 0-100
  errors: number;
}

export interface MasteryData {
  ayahs: Record<string, AyahMastery>; // key: "surahNumber:ayahNumber"
  lastSyncDate?: string;
}

export interface MasteryStats {
  total: number;
  new: number;
  practicing: number;
  mastered: number;
}

export interface ErrorTrendWeek {
  weekLabel: string;
  errorCount: number;
  startDate: string;
}

export interface ErrorTypeBreakdown {
  substitution: number;
  deletion: number;
  addition: number;
  order: number;
}
