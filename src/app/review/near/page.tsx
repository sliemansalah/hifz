'use client';

import { useState } from 'react';
import { useReviewSchedule } from '@/hooks/useReviewSchedule';
import AyahRange from '@/components/quran/AyahRange';
import Link from 'next/link';

export default function NearReviewPage() {
  const { nearReview } = useReviewSchedule();
  const [currentIndex, setCurrentIndex] = useState(0);
  const day = nearReview.days[currentIndex];

  if (nearReview.days.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">لا توجد مراجعة قريبة</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>ابدأ بالحفظ أولاً</p>
        <Link href="/memorize" className="btn-primary mt-4 inline-block">ابدأ الحفظ</Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المراجعة القريبة</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {currentIndex + 1} من {nearReview.days.length}
          </p>
        </div>
        <Link href="/review" className="btn-secondary text-sm">رجوع</Link>
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {nearReview.days.map((d, i) => (
          <button key={d.dayNumber}
            onClick={() => setCurrentIndex(i)}
            className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
              i === currentIndex ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
            }`}>
            يوم {d.dayNumber}
          </button>
        ))}
      </div>

      {day && (
        <AyahRange
          surahNumber={day.surahNumber}
          startAyah={day.startAyah}
          endAyah={day.endAyah}
          surahName={day.surahName}
        />
      )}

      <div className="flex gap-3">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(i => i - 1)}
          className="btn-secondary flex-1 disabled:opacity-50">السابق</button>
        {currentIndex < nearReview.days.length - 1 ? (
          <button onClick={() => setCurrentIndex(i => i + 1)} className="btn-primary flex-1">
            التالي
          </button>
        ) : (
          <Link href="/review" className="btn-primary flex-1 text-center">إنهاء المراجعة</Link>
        )}
      </div>
    </div>
  );
}
