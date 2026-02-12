'use client';

import { useState, useEffect } from 'react';
import { HiddenWord } from '@/lib/word-hide';

interface WordHideTestProps {
  words: HiddenWord[];
  onComplete: (revealedAll: boolean) => void;
}

export default function WordHideTest({ words: initialWords, onComplete }: WordHideTestProps) {
  const [words, setWords] = useState(initialWords);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Reset when new words come in
  useEffect(() => {
    setWords(initialWords);
    setElapsedSeconds(0);
  }, [initialWords]);

  const hiddenCount = words.filter(w => w.hidden).length;
  const revealedCount = words.filter(w => w.hidden && w.revealed).length;
  const allRevealed = hiddenCount > 0 && revealedCount >= hiddenCount;

  // Timer
  useEffect(() => {
    if (allRevealed || hiddenCount === 0) return;
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [allRevealed, hiddenCount]);

  const timerStr = `${Math.floor(elapsedSeconds / 60)}:${(elapsedSeconds % 60).toString().padStart(2, '0')}`;

  const revealWord = (index: number) => {
    setWords(prev => {
      const next = prev.map((w, i) =>
        i === index ? { ...w, revealed: true } : w
      );
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

  const progressPct = hiddenCount > 0 ? Math.round((revealedCount / hiddenCount) * 100) : 0;

  return (
    <div>
      <div className="flex justify-between mb-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span>اضغط على الكلمة المخفية لكشفها</span>
        <div className="flex items-center gap-3">
          <span className="font-mono" dir="ltr">{timerStr}</span>
          <span>{revealedCount}/{hiddenCount}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar mb-3">
        <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="quran-text text-center leading-loose text-xl p-4 islamic-border">
        {words.map((w, i) => {
          if (!w.hidden) {
            return <span key={i}>{w.word} </span>;
          }
          if (w.revealed) {
            return (
              <span key={i} className="text-emerald-600 font-bold animate-reveal">{w.word} </span>
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
