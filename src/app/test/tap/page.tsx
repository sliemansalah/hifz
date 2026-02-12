'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import { useQuranText } from '@/hooks/useQuranText';
import { useErrorLog } from '@/hooks/useErrorLog';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { getDay } from '@/data/plan';
import { splitWords, removeTashkeel } from '@/lib/arabic-utils';
import { todayISO } from '@/lib/date-utils';
import { addCertificate } from '@/lib/certificates';
import TestResult from '@/components/testing/TestResult';

type WordStatus = 'hidden' | 'correct' | 'error';

function TapTestContent() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get('day');
  const { currentDay, markTested } = useProgress();
  const dayNumber = dayParam ? Number(dayParam) : currentDay;
  const day = getDay(dayNumber);

  const { ayahs, fullText, loading } = useQuranText(
    day?.surahNumber || 1,
    day?.startAyah,
    day?.endAyah
  );

  const { addErrors: logErrors } = useErrorLog();
  const { addSession } = useSessionHistory();
  const [words, setWords] = useState<{ text: string; status: WordStatus; ayahIndex: number }[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);

  // Build word list from ayahs
  useEffect(() => {
    if (!ayahs.length) return;
    const wordList: { text: string; status: WordStatus; ayahIndex: number }[] = [];
    ayahs.forEach((ayah, ayahIdx) => {
      const ayahWords = splitWords(ayah.text);
      ayahWords.forEach(w => {
        wordList.push({ text: w, status: 'hidden', ayahIndex: ayahIdx });
      });
    });
    setWords(wordList);
    setCurrentWordIndex(0);
    setFinished(false);
    setShowResult(false);
    startTimeRef.current = Date.now();
  }, [ayahs]);

  // Auto-scroll to current word
  useEffect(() => {
    if (containerRef.current) {
      const currentEl = containerRef.current.querySelector(`[data-word-index="${currentWordIndex}"]`);
      currentEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentWordIndex]);

  const revealWord = useCallback((markAsError: boolean) => {
    if (currentWordIndex >= words.length || finished) return;

    setWords(prev => {
      const updated = [...prev];
      updated[currentWordIndex] = {
        ...updated[currentWordIndex],
        status: markAsError ? 'error' : 'correct',
      };
      return updated;
    });

    if (currentWordIndex >= words.length - 1) {
      setFinished(true);
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  }, [currentWordIndex, words.length, finished]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResult || !words.length) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        revealWord(false); // correct
      } else if (e.code === 'KeyX' || e.code === 'Backspace') {
        e.preventDefault();
        revealWord(true); // error
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealWord, showResult, words.length]);

  const handleFinish = () => {
    if (!day || !fullText) return;

    const errorWords = words.filter(w => w.status === 'error');
    const totalWords = words.length;
    const correctWords = totalWords - errorWords.length;
    const score = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Mark tested
    markTested(dayNumber, score, 'tap');

    // Log errors
    if (errorWords.length > 0) {
      const errorEntries = errorWords.map((w, i) => {
        const globalIndex = words.indexOf(w);
        return {
          id: `${Date.now()}-${i}`,
          sessionId: Date.now().toString(),
          timestamp: todayISO(),
          surahNumber: day.surahNumber,
          ayahNumber: day.startAyah + w.ayahIndex,
          wordIndex: globalIndex,
          expected: removeTashkeel(w.text),
          actual: '',
          type: 'deletion' as const,
        };
      });
      logErrors(errorEntries);
    }

    // Save session
    addSession({
      id: Date.now().toString(),
      type: 'test-tap',
      dayNumbers: [dayNumber],
      startedAt: new Date(startTimeRef.current).toISOString(),
      completedAt: new Date().toISOString(),
      duration,
      score,
      errors: errorWords.map(w => ({
        ayahNumber: day.startAyah + w.ayahIndex,
        surahNumber: day.surahNumber,
        wordIndex: words.indexOf(w),
        expected: removeTashkeel(w.text),
        actual: '',
        type: 'deletion' as const,
      })),
    });

    // Certificate
    if (score >= 80) {
      addCertificate({
        id: Date.now().toString(),
        dayNumber,
        surahName: day.surahName,
        surahNumber: day.surahNumber,
        startAyah: day.startAyah,
        endAyah: day.endAyah,
        score,
        testType: 'tap',
        errors: errorWords.length,
        date: new Date().toISOString(),
        juz: day.juz,
      });
    }

    setShowResult(true);
  };

  const handleRetry = () => {
    // Reset all words to hidden
    setWords(prev => prev.map(w => ({ ...w, status: 'hidden' })));
    setCurrentWordIndex(0);
    setFinished(false);
    setShowResult(false);
    startTimeRef.current = Date.now();
  };

  if (!day) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">لا يوجد مقرر للاختبار</h1>
        <Link href="/test" className="btn-primary mt-4 inline-block">العودة</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <p style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل...</p>
      </div>
    );
  }

  if (showResult) {
    const errorWords = words.filter(w => w.status === 'error');
    const totalWords = words.length;
    const correctWords = totalWords - errorWords.length;
    const score = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;

    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold">التسميع السريع</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            يوم {dayNumber}: {day.surahName} ({day.startAyah}–{day.endAyah})
          </p>
        </div>
        <TestResult
          score={score}
          totalWords={totalWords}
          correctWords={correctWords}
          errors={errorWords.map(w => ({
            wordIndex: words.indexOf(w),
            expected: w.text,
            actual: '',
            type: 'deletion',
          }))}
          onRetry={handleRetry}
          dayNumber={dayNumber}
          surahName={day.surahName}
          surahNumber={day.surahNumber}
          startAyah={day.startAyah}
          endAyah={day.endAyah}
        />
      </div>
    );
  }

  const errorCount = words.filter(w => w.status === 'error').length;
  const revealedCount = words.filter(w => w.status !== 'hidden').length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">التسميع السريع</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {day.surahName} ({day.startAyah}–{day.endAyah})
          </p>
        </div>
        <div className="text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div>{revealedCount}/{words.length} كلمات</div>
          {errorCount > 0 && <div className="text-red-500">{errorCount} أخطاء</div>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${(revealedCount / Math.max(words.length, 1)) * 100}%` }} />
      </div>

      {/* Instructions */}
      <div className="flex gap-2 text-xs justify-center" style={{ color: 'var(--text-secondary)' }}>
        <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          مسافة/ضغط = صحيح
        </span>
        <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
          X/حذف = خطأ
        </span>
      </div>

      {/* Words display */}
      <div ref={containerRef} className="card min-h-[200px] quran-text text-xl leading-[2.5] text-center">
        {words.map((word, i) => {
          const isCurrentWord = i === currentWordIndex && !finished;

          if (word.status === 'hidden') {
            return (
              <span key={i} data-word-index={i}
                className={`inline-block mx-0.5 px-1 rounded transition-all ${
                  isCurrentWord
                    ? 'bg-emerald-100 border-2 border-emerald-400 border-dashed animate-pulse min-w-[40px] min-h-[32px]'
                    : 'min-w-[30px] min-h-[24px]'
                }`}
                style={!isCurrentWord ? { backgroundColor: 'var(--bg-secondary)' } : undefined}
                onClick={() => {
                  if (isCurrentWord) revealWord(false);
                }}>
                {isCurrentWord ? '؟' : '\u00A0'}
              </span>
            );
          }

          return (
            <span key={i} data-word-index={i}
              className={`inline-block mx-0.5 px-1 rounded transition-all ${
                word.status === 'error' ? 'bg-red-100 text-red-600 line-through' : ''
              }`}
              style={word.status === 'correct' ? { color: 'var(--text-primary)' } : undefined}>
              {word.text}
            </span>
          );
        })}
      </div>

      {/* Action buttons */}
      {!finished ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => revealWord(false)}
            className="py-4 rounded-xl text-lg font-bold transition-all active:scale-95"
            style={{ backgroundColor: 'var(--color-emerald-600)', color: 'white' }}>
            صحيح
          </button>
          <button
            onClick={() => revealWord(true)}
            className="py-4 rounded-xl text-lg font-bold transition-all active:scale-95 bg-red-500 text-white">
            خطأ
          </button>
        </div>
      ) : (
        <button onClick={handleFinish}
          className="btn-primary w-full py-4 text-lg font-bold">
          عرض النتيجة
        </button>
      )}
    </div>
  );
}

export default function TapTestPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20"><p>جارٍ التحميل...</p></div>}>
      <TapTestContent />
    </Suspense>
  );
}
