export interface DayCompletion {
  dayNumber: number;
  completedAt: string; // ISO date
  repetitions: number;
  score?: number; // test score 0-100
  testType?: 'written' | 'word-hide' | 'oral' | 'tap';
  notes?: string;
  memorized?: boolean;  // finished memorization session
  tested?: boolean;     // passed a test (score >= 80)
}

export interface UserProgress {
  completedDays: Record<number, DayCompletion>;
  currentDay: number;
  startDate: string; // ISO date
  lastActiveDate: string;
}

export interface CertificateRecord {
  id: string;
  dayNumber: number;
  surahName: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  score: number;
  testType: 'written' | 'word-hide' | 'oral' | 'tap';
  errors: number;
  date: string; // ISO date
  juz: number;
}
