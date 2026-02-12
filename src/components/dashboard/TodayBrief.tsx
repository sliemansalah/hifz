'use client';

import Link from 'next/link';
import { PlanDay } from '@/types/plan';

interface TodayBriefProps {
  day: PlanDay | undefined;
  isCompleted: boolean;
}

export default function TodayBrief({ day, isCompleted }: TodayBriefProps) {
  if (!day) {
    return (
      <div className="card text-center py-8">
        <div className="text-4xl mb-3">🎉</div>
        <h3 className="text-xl font-bold">أتممت الخطة!</h3>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>بارك الله فيك</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-bold">مهمة اليوم</h2>
        {isCompleted && (
          <span className="text-sm font-medium px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
            مكتمل ✓
          </span>
        )}
      </div>
      <div className="mb-3">
        <p className="text-xl font-bold" style={{ color: 'var(--color-emerald-600)' }}>
          يوم {day.dayNumber}
        </p>
        <p className="mt-1">{day.surahName} ({day.startAyah}–{day.endAyah})</p>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {day.ayahCount} آيات — الجزء {day.juz}
        </p>
      </div>
      <div className="flex gap-2">
        <Link href="/today" className="btn-primary text-sm flex-1 text-center">
          عرض التفاصيل
        </Link>
        {!isCompleted && (
          <Link href="/memorize" className="btn-accent text-sm flex-1 text-center">
            ابدأ الحفظ
          </Link>
        )}
      </div>
    </div>
  );
}
