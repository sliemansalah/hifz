export interface SessionError {
  ayahNumber: number;
  surahNumber: number;
  wordIndex: number;
  expected: string;
  actual: string;
  type: 'substitution' | 'deletion' | 'addition' | 'order';
}

export interface Session {
  id: string;
  type: 'memorize' | 'test-written' | 'test-word-hide' | 'test-oral' | 'test-tap' | 'review-near' | 'review-far';
  dayNumbers: number[];
  startedAt: string;
  completedAt?: string;
  duration: number; // seconds
  repetitions?: number;
  score?: number;
  errors: SessionError[];
}
