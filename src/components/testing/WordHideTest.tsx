'use client';

import { useState, useEffect } from 'react';
import { HiddenWord } from '@/lib/word-hide';

interface WordHideTestProps {
  words: HiddenWord[];
  onComplete: (revealedAll: boolean) => void;
}

export default function WordHideTest({ words: initialWords, onComplete }: WordHideTestProps) {
  const [words, setWords] = useState(initialWords);

  // Reset when new words come in
  useEffect(() => {
    setWords(initialWords);
  }, [initialWords]);

  const hiddenCount = words.filter(w => w.hidden).length;
  const revealedCount = words.filter(w => w.hidden && w.revealed).length;

  const revealWord = (index: number) => {
    setWords(prev => {
      const next = prev.map((w, i) =>
        i === index ? { ...w, revealed: true } : w
      );
      // Check completion inside updater to avoid stale state
      const newRevealed = next.filter(w => w.hidden && w.revealed).length;
      const totalHidden = next.filter(w => w.hidden).length;
      if (newRevealed >= totalHidden) {
        setTimeout(() => onComplete(true), 300);
      }
      return next;
    });
  };

  if (hiddenCount === 0) {
    return (
      <div className="quran-text text-center leading-loose text-xl p-4 islamic-border">
        {words.map((w, i) => <span key={i}>{w.word} </span>)}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span>اضغط على الكلمة المخفية لكشفها</span>
        <span>{revealedCount}/{hiddenCount}</span>
      </div>
      <div className="quran-text text-center leading-loose text-xl p-4 islamic-border">
        {words.map((w, i) => {
          if (!w.hidden) {
            return <span key={i}>{w.word} </span>;
          }
          if (w.revealed) {
            return (
              <span key={i} className="text-emerald-600 font-bold">{w.word} </span>
            );
          }
          return (
            <button key={i} onClick={() => revealWord(i)}
              className="inline-block mx-1 px-3 py-1 rounded-lg text-transparent select-none cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: 'var(--color-gold-200)', minWidth: `${w.word.length * 0.5 + 1}rem` }}>
              {w.word}
            </button>
          );
        })}
      </div>
    </div>
  );
}
