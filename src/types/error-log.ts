export interface ErrorEntry {
  id: string;
  sessionId: string;
  timestamp: string;
  surahNumber: number;
  ayahNumber: number;
  wordIndex: number;
  expected: string;
  actual: string;
  type: 'substitution' | 'deletion' | 'addition' | 'order';
}

export interface AyahErrorSummary {
  surahNumber: number;
  ayahNumber: number;
  totalErrors: number;
  lastErrorDate: string;
  errorWords: Record<number, number>; // wordIndex -> count
}
