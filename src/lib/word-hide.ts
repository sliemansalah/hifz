import { splitWords } from './arabic-utils';

export type Difficulty = 'easy' | 'medium' | 'hard';

const HIDE_RATIOS: Record<Difficulty, number> = {
  easy: 0.25,
  medium: 0.5,
  hard: 0.75,
};

export interface HiddenWord {
  word: string;
  index: number;
  hidden: boolean;
  revealed: boolean;
}

export function generateHiddenWords(
  text: string,
  difficulty: Difficulty,
  weakWordIndices?: number[]
): HiddenWord[] {
  const words = splitWords(text);
  const hideRatio = HIDE_RATIOS[difficulty];
  const totalToHide = Math.floor(words.length * hideRatio);

  const indices = new Set<number>();

  // Prioritize weak words
  if (weakWordIndices) {
    for (const idx of weakWordIndices) {
      if (idx < words.length && idx > 0) {
        indices.add(idx);
        if (indices.size >= totalToHide) break;
      }
    }
  }

  // Fill remaining randomly (skip first word as anchor)
  const available = Array.from({ length: words.length - 1 }, (_, i) => i + 1)
    .filter(i => !indices.has(i));

  while (indices.size < totalToHide && available.length > 0) {
    const randIdx = Math.floor(Math.random() * available.length);
    indices.add(available[randIdx]);
    available.splice(randIdx, 1);
  }

  return words.map((word, index) => ({
    word,
    index,
    hidden: indices.has(index),
    revealed: false,
  }));
}
