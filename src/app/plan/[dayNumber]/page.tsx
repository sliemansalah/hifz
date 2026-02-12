'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import { getDay } from '@/data/plan';
import AyahRange from '@/components/quran/AyahRange';
import Badge from '@/components/ui/Badge';

export default function DayDetailPage() {
  const params = useParams();
  const dayNumber = Number(params.dayNumber);
  const { isDayCompleted, currentDay } = useProgress();

  const day = getDay(dayNumber);
  if (!day) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">اليوم غير موجود</h1>
        <Link href="/plan" className="btn-primary mt-4 inline-block">العودة للخطة</Link>
      </div>
    );
  }

  const completed = isDayCompleted(dayNumber);
  const isCurrent = dayNumber === currentDay;
  const prevDay = getDay(dayNumber - 1);
  const nextDay = getDay(dayNumber + 1);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">يوم {dayNumber}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>الجزء {day.juz}</p>
        </div>
        <div className="flex gap-2">
          {completed && <Badge variant="success">مكتمل</Badge>}
          {isCurrent && <Badge variant="warning">الحالي</Badge>}
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>السورة:</span>
            <span className="font-bold mr-2">{day.surahName}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>الآيات:</span>
            <span className="font-bold mr-2">{day.startAyah} – {day.endAyah}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>عدد الآيات:</span>
            <span className="font-bold mr-2">{day.ayahCount}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-secondary)' }}>المراجعة:</span>
            <span className="font-bold mr-2">{day.nearReview}</span>
          </div>
        </div>
      </div>

      <AyahRange
        surahNumber={day.surahNumber}
        startAyah={day.startAyah}
        endAyah={day.endAyah}
        surahName={day.surahName}
      />

      <div className="flex gap-3">
        {!completed && (
          <Link href="/memorize" className="btn-primary flex-1 text-center">ابدأ الحفظ</Link>
        )}
        <Link href={`/test/written?day=${dayNumber}`} className="btn-accent flex-1 text-center">تسميع كتابي</Link>
      </div>

      <div className="flex justify-between">
        {prevDay ? (
          <Link href={`/plan/${prevDay.dayNumber}`} className="btn-secondary text-sm">
            ← يوم {prevDay.dayNumber}
          </Link>
        ) : <div />}
        {nextDay ? (
          <Link href={`/plan/${nextDay.dayNumber}`} className="btn-secondary text-sm">
            يوم {nextDay.dayNumber} →
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
