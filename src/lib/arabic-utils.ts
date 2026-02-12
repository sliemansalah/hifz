// Remove BOM and invisible characters
function cleanText(text: string): string {
  return text.replace(/[\uFEFF\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '');
}

// Replace superscript alef with regular alef
function replaceSuperscriptAlef(text: string): string {
  return text.replace(/\u0670/g, '\u0627');
}

// Remove tashkeel (diacritics) from Arabic text
export function removeTashkeel(text: string): string {
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0640]/g, '');
}

// Normalize alef variants and similar characters
export function normalizeAlef(text: string): string {
  return text
    .replace(/[\u0671\u0623\u0625\u0622\u0627]/g, '\u0627') // ٱ إ أ آ ا -> ا
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

// Full normalization for comparison
export function normalizeArabic(text: string): string {
  return normalizeAlef(removeTashkeel(replaceSuperscriptAlef(cleanText(text)))).trim();
}

// Extra-fuzzy normalization: also strip internal alefs (handles Quranic rasm differences)
function stripInternalAlefs(word: string): string {
  if (word.length <= 2) return word;
  // Keep first char, strip alefs from middle, keep last char
  return word[0] + word.slice(1, -1).replace(/ا/g, '') + word[word.length - 1];
}

// Check if two words match (with Quranic orthography tolerance)
function wordsMatch(a: string, b: string): boolean {
  if (a === b) return true;
  // Fuzzy: strip internal alefs from both and compare
  return stripInternalAlefs(a) === stripInternalAlefs(b);
}

// Split Arabic text into words
export function splitWords(text: string): string[] {
  return text.split(/\s+/).filter(w => w.length > 0);
}

// Compare two Arabic texts and return similarity score (0-100)
export function compareTexts(original: string, input: string): {
  score: number;
  errors: CompareError[];
  totalWords: number;
  correctWords: number;
} {
  const origWords = splitWords(normalizeArabic(original));
  const inputWords = splitWords(normalizeArabic(input));
  const origWordsRaw = splitWords(cleanText(original));
  const inputWordsRaw = splitWords(cleanText(input));

  // Build fuzzy LCS using wordsMatch
  const lcs = fuzzyLCS(origWords, inputWords);
  const errors: CompareError[] = [];

  const origMatched = new Array(origWords.length).fill(false);
  const inputMatched = new Array(inputWords.length).fill(false);

  // Trace LCS matches
  let oi = 0;
  let ii = 0;
  for (let l = 0; l < lcs.length; l++) {
    while (oi < origWords.length && !wordsMatch(origWords[oi], lcs[l])) oi++;
    while (ii < inputWords.length && !wordsMatch(inputWords[ii], lcs[l])) ii++;
    if (oi < origWords.length && ii < inputWords.length) {
      origMatched[oi] = true;
      inputMatched[ii] = true;
      oi++;
      ii++;
    }
  }

  // Collect unmatched words and pair nearby deletion+addition as substitution
  const deletions: { wordIndex: number; expected: string }[] = [];
  const additions: { wordIndex: number; actual: string }[] = [];

  for (let i = 0; i < origWords.length; i++) {
    if (!origMatched[i]) {
      deletions.push({ wordIndex: i, expected: origWordsRaw[i] || '' });
    }
  }

  for (let i = 0; i < inputWords.length; i++) {
    if (!inputMatched[i]) {
      additions.push({ wordIndex: i, actual: inputWordsRaw[i] || '' });
    }
  }

  // Pair deletions and additions that are positionally close as substitutions
  const usedAdditions = new Set<number>();
  for (const del of deletions) {
    // Find the closest unpaired addition near this deletion position
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let a = 0; a < additions.length; a++) {
      if (usedAdditions.has(a)) continue;
      const dist = Math.abs(del.wordIndex - additions[a].wordIndex);
      if (dist < bestDist && dist <= 2) {
        bestDist = dist;
        bestIdx = a;
      }
    }
    if (bestIdx >= 0) {
      usedAdditions.add(bestIdx);
      errors.push({
        wordIndex: del.wordIndex,
        expected: del.expected,
        actual: additions[bestIdx].actual,
        type: 'substitution',
      });
    } else {
      errors.push({
        wordIndex: del.wordIndex,
        expected: del.expected,
        actual: '',
        type: 'deletion',
      });
    }
  }

  // Remaining unpaired additions
  for (let a = 0; a < additions.length; a++) {
    if (!usedAdditions.has(a)) {
      errors.push({
        wordIndex: additions[a].wordIndex,
        expected: '',
        actual: additions[a].actual,
        type: 'addition',
      });
    }
  }

  const correctWords = origWords.length - errors.filter(e => e.type !== 'addition').length;
  const score = origWords.length > 0 ? Math.round((correctWords / origWords.length) * 100) : 100;

  return { score: Math.max(0, score), errors, totalWords: origWords.length, correctWords: Math.max(0, correctWords) };
}

export interface CompareError {
  wordIndex: number;
  expected: string;
  actual: string;
  type: 'substitution' | 'deletion' | 'addition' | 'order';
}

// Fuzzy LCS that uses wordsMatch instead of strict equality
function fuzzyLCS(a: string[], b: string[]): string[] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (wordsMatch(a[i - 1], b[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const result: string[] = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (wordsMatch(a[i - 1], b[j - 1])) {
      result.unshift(a[i - 1]);
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }

  return result;
}
