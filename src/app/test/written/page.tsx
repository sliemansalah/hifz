'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProgress } from '@/hooks/useProgress';
import { useQuranText } from '@/hooks/useQuranText';
import { useErrorLog } from '@/hooks/useErrorLog';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { getDay } from '@/data/plan';
import { compareTexts, splitWords } from '@/lib/arabic-utils';
import { todayISO } from '@/lib/date-utils';
import { addCertificate } from '@/lib/certificates';
import TestResult from '@/components/testing/TestResult';

function WrittenTestContent() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get('day');
  const { currentDay, markTested } = useProgress();
  const dayNumber = dayParam ? Number(dayParam) : currentDay;
  const day = getDay(dayNumber);

  const { fullText, loading } = useQuranText(
    day?.surahNumber || 1,
    day?.startAyah,
    day?.endAyah
  );

  const { addErrors: logErrors } = useErrorLog();
  const { addSession } = useSessionHistory();
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof compareTexts> | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (!day) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">لا يوجد مقرر للاختبار</h1>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!input.trim() || !fullText) return;
    const res = compareTexts(fullText, input);
    setResult(res);
    setShowResult(true);

    // Mark as tested in progress
    markTested(dayNumber, res.score, 'written');

    // Log errors
    const errorEntries = res.errors.map((err, i) => ({
      id: `${Date.now()}-${i}`,
      sessionId: Date.now().toString(),
      timestamp: todayISO(),
      surahNumber: day.surahNumber,
      ayahNumber: day.startAyah,
      wordIndex: err.wordIndex,
      expected: err.expected,
      actual: err.actual,
      type: err.type as 'substitution' | 'deletion' | 'addition' | 'order',
    }));
    if (errorEntries.length > 0) logErrors(errorEntries);

    // Save session
    addSession({
      id: Date.now().toString(),
      type: 'test-written',
      dayNumbers: [dayNumber],
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      duration: 0,
      score: res.score,
      errors: res.errors.map(e => ({
        ayahNumber: day.startAyah,
        surahNumber: day.surahNumber,
        wordIndex: e.wordIndex,
        expected: e.expected,
        actual: e.actual,
        type: e.type as 'substitution' | 'deletion' | 'addition' | 'order',
      })),
    });

    // Save certificate if score >= 80
    if (res.score >= 80) {
      addCertificate({
        id: Date.now().toString(),
        dayNumber,
        surahName: day.surahName,
        surahNumber: day.surahNumber,
        startAyah: day.startAyah,
        endAyah: day.endAyah,
        score: res.score,
        testType: 'written',
        errors: res.errors.length,
        date: new Date().toISOString(),
        juz: day.juz,
      });
    }
  };

  const handleRetry = () => {
    setInput('');
    setResult(null);
    setShowResult(false);
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <div><div className="skeleton h-8 w-40 mb-2" /><div className="skeleton h-4 w-56" /></div>
        <div className="card space-y-3">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-4 w-64" />
          <div className="skeleton h-48 w-full" />
        </div>
        <div className="skeleton h-12 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">التسميع الكتابي</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          يوم {dayNumber}: {day.surahName} ({day.startAyah}–{day.endAyah})
        </p>
      </div>

      {showResult && result ? (
        <TestResult
          score={result.score}
          totalWords={result.totalWords}
          correctWords={result.correctWords}
          errors={result.errors}
          onRetry={handleRetry}
          dayNumber={dayNumber}
          surahName={day.surahName}
          surahNumber={day.surahNumber}
          startAyah={day.startAyah}
          endAyah={day.endAyah}
        />
      ) : (
        <>
          <div className="card">
            <h2 className="text-lg font-bold mb-3">اكتب الآيات من حفظك</h2>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
              اكتب {day.surahName} من الآية {day.startAyah} إلى {day.endAyah}
            </p>
            {/* First word hint */}
            {fullText && !input.trim() && (
              <div className="mb-2 text-sm px-3 py-1.5 rounded-lg inline-block"
                style={{ backgroundColor: 'var(--color-emerald-50)', color: 'var(--color-emerald-700)' }}>
                ابدأ بـ: <span className="quran-text font-bold">{splitWords(fullText)[0]}</span>
              </div>
            )}
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full p-4 rounded-lg border quran-text text-lg"
              style={{ backgroundColor: 'var(--bg-secondary)', direction: 'rtl', minHeight: '12rem', fieldSizing: 'content' } as React.CSSProperties}
              placeholder="ابدأ الكتابة هنا..."
              dir="rtl"
            />
            {/* Word counter */}
            <div className="flex justify-between mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <span>
                {splitWords(input).length} كلمة مكتوبة
                {fullText && ` / ${splitWords(fullText).length} متوقعة`}
              </span>
            </div>
          </div>
          <button onClick={handleSubmit}
            disabled={!input.trim()}
            className="btn-primary w-full py-3 disabled:opacity-50">
            تحقق من الإجابة
          </button>
        </>
      )}
    </div>
  );
}

export default function WrittenTestPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20"><p>جارٍ التحميل...</p></div>}>
      <WrittenTestContent />
    </Suspense>
  );
}
