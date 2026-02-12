'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useProgress } from '@/hooks/useProgress';
import { useQuranText } from '@/hooks/useQuranText';
import { useSettings } from '@/hooks/useSettings';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { getDay } from '@/data/plan';
import { generateHiddenWords, type Difficulty } from '@/lib/word-hide';
import { getWeakWordIndices } from '@/lib/error-tracker';
import { addCertificate } from '@/lib/certificates';
import WordHideTest from '@/components/testing/WordHideTest';
import Certificate from '@/components/testing/Certificate';
import Link from 'next/link';

function WordHideContent() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get('day');
  const { currentDay, markTested } = useProgress();
  const { addSession } = useSessionHistory();
  const dayNumber = dayParam ? Number(dayParam) : currentDay;
  const day = getDay(dayNumber);
  const { settings } = useSettings();

  const { fullText, loading } = useQuranText(
    day?.surahNumber || 1,
    day?.startAyah,
    day?.endAyah
  );

  const [difficulty, setDifficulty] = useState<Difficulty>(settings.testDifficulty);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showCert, setShowCert] = useState(false);
  const [words, setWords] = useState<ReturnType<typeof generateHiddenWords>>([]);

  useEffect(() => {
    if (fullText && started) {
      const weakWords = day ? getWeakWordIndices(day.surahNumber, day.startAyah) : [];
      setWords(generateHiddenWords(fullText, difficulty, weakWords));
    }
  }, [fullText, started, difficulty, day]);

  const handleComplete = () => {
    setCompleted(true);
    setShowCert(true);

    if (day) {
      // Word-hide completion counts as 100% (all words revealed)
      markTested(dayNumber, 100, 'word-hide');

      addSession({
        id: Date.now().toString(),
        type: 'test-word-hide',
        dayNumbers: [dayNumber],
        startedAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        duration: 0,
        score: 100,
        errors: [],
      });

      addCertificate({
        id: Date.now().toString(),
        dayNumber,
        surahName: day.surahName,
        surahNumber: day.surahNumber,
        startAyah: day.startAyah,
        endAyah: day.endAyah,
        score: 100,
        testType: 'word-hide',
        errors: 0,
        date: new Date().toISOString(),
        juz: day.juz,
      });
    }
  };

  if (!day) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">لا يوجد مقرر للاختبار</h1>
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

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">إخفاء كلمات</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          يوم {dayNumber}: {day.surahName} ({day.startAyah}–{day.endAyah})
        </p>
      </div>

      {!started ? (
        <div className="card text-center py-8">
          <h2 className="text-lg font-bold mb-4">اختر مستوى الصعوبة</h2>
          <div className="flex gap-3 justify-center mb-6">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
              <button key={d}
                onClick={() => setDifficulty(d)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  d === difficulty
                    ? 'bg-emerald-600 text-white'
                    : 'bg-[var(--bg-secondary)]'
                }`}>
                {d === 'easy' ? 'سهل (25%)' : d === 'medium' ? 'متوسط (50%)' : 'صعب (75%)'}
              </button>
            ))}
          </div>
          <button onClick={() => setStarted(true)} className="btn-primary px-8 py-3">
            ابدأ الاختبار
          </button>
        </div>
      ) : completed ? (
        <div className="text-center py-8">
          {showCert && (
            <Certificate
              dayNumber={dayNumber}
              surahName={day.surahName}
              startAyah={day.startAyah}
              endAyah={day.endAyah}
              score={100}
              date={new Date().toISOString()}
              onClose={() => setShowCert(false)}
            />
          )}
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold mb-2">أحسنت!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>أكملت جميع الكلمات</p>
          <div className="flex gap-3 justify-center mt-6">
            <button onClick={() => { setStarted(false); setCompleted(false); setShowCert(false); }} className="btn-primary">
              إعادة
            </button>
            <Link href="/test" className="btn-secondary">اختبار آخر</Link>
          </div>
        </div>
      ) : (
        <WordHideTest words={words} onComplete={handleComplete} />
      )}
    </div>
  );
}

export default function WordHidePage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20"><p>جارٍ التحميل...</p></div>}>
      <WordHideContent />
    </Suspense>
  );
}
