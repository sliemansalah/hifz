'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { getDay } from '@/data/plan';
import { getNearReviewDays, getDayRangeText } from '@/lib/plan-utils';
import { getDueForReview } from '@/lib/mastery-engine';
import AyahRange from '@/components/quran/AyahRange';
import Badge from '@/components/ui/Badge';
import { getSurahMeta } from '@/data/surah-meta';

export default function TodayPage() {
  const { currentDay, isDayCompleted, isDayMemorized, isDayTested, getDayScore } = useProgress();
  const day = getDay(currentDay);
  const nearDays = getNearReviewDays(currentDay);
  const memorized = day ? isDayMemorized(day.dayNumber) : false;
  const tested = day ? isDayTested(day.dayNumber) : false;
  const completed = memorized && tested;
  const score = day ? getDayScore(day.dayNumber) : undefined;

  const dueForReview = useMemo(() => getDueForReview().slice(0, 5), []);

  if (!day) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <div className="text-6xl mb-4">&#x1F389;</div>
        <h1 className="text-3xl font-bold mb-2">ما شاء الله!</h1>
        <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>أتممت حفظ القرآن الكريم كاملاً</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مهمة اليوم</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>يوم {day.dayNumber} — الجزء {day.juz}</p>
        </div>
        {completed ? (
          <Badge variant="success">مكتمل</Badge>
        ) : memorized ? (
          <Badge variant="warning">يحتاج تسميع</Badge>
        ) : null}
      </div>

      {/* Progress steps */}
      <div className="card">
        <h3 className="font-bold mb-3">خطوات إتمام اليوم</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              memorized ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {memorized ? '\u2713' : '1'}
            </div>
            <div className="flex-1">
              <span className={`font-medium ${memorized ? 'line-through' : ''}`} style={{ color: memorized ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                الحفظ (10 تكرارات أو أكثر)
              </span>
            </div>
            {!memorized && (
              <Link href="/memorize" className="text-xs px-3 py-1 rounded-lg font-medium bg-emerald-100 text-emerald-700">
                ابدأ
              </Link>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
              tested ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
            }`}>
              {tested ? '\u2713' : '2'}
            </div>
            <div className="flex-1">
              <span className={`font-medium ${tested ? 'line-through' : ''}`} style={{ color: tested ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                التسميع (نسبة 80% أو أكثر)
              </span>
              {score !== undefined && (
                <span className="text-xs mr-2" style={{ color: score >= 80 ? 'var(--color-emerald-600)' : '#ef4444' }}>
                  {score}%
                </span>
              )}
            </div>
            {memorized && !tested && (
              <Link href={`/test/written?day=${day.dayNumber}`} className="text-xs px-3 py-1 rounded-lg font-medium"
                style={{ backgroundColor: 'var(--color-gold-100)', color: 'var(--color-gold-800)' }}>
                اختبر
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Today's portion */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--color-emerald-600)' }}>
          الحفظ الجديد
        </h2>
        <AyahRange
          surahNumber={day.surahNumber}
          startAyah={day.startAyah}
          endAyah={day.endAyah}
          surahName={day.surahName}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!memorized && (
          <Link href="/memorize" className="btn-primary flex-1 text-center">
            ابدأ الحفظ
          </Link>
        )}
        {memorized && !tested && (
          <>
            <Link href={`/test/written?day=${day.dayNumber}`} className="btn-accent flex-1 text-center">
              تسميع كتابي
            </Link>
            <Link href={`/test/word-hide?day=${day.dayNumber}`} className="btn-accent flex-1 text-center">
              إخفاء كلمات
            </Link>
            <Link href={`/test/oral?day=${day.dayNumber}`}
              className="flex-1 text-center py-2 px-3 rounded-lg font-medium transition-all"
              style={{ backgroundColor: 'var(--color-gold-100)', color: 'var(--color-gold-800)' }}>
              تسميع شفهي
            </Link>
          </>
        )}
        {completed && (
          <Link href="/test" className="btn-accent flex-1 text-center">
            تسميع إضافي
          </Link>
        )}
      </div>

      {/* Due for review ayahs */}
      {dueForReview.length > 0 && (
        <div className="card" style={{ borderColor: '#f97316', borderWidth: '1px' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">&#x1F4CB;</span>
            <h2 className="text-lg font-bold">آيات تحتاج مراجعة</h2>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            هذه الآيات مستحقة للمراجعة بناءً على سجل أخطائك:
          </p>
          <div className="space-y-2">
            {dueForReview.map(a => {
              const surah = getSurahMeta(a.surahNumber);
              return (
                <div key={`${a.surahNumber}:${a.ayahNumber}`}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <div className="text-sm">
                    <span className="font-medium">{surah?.name || `سورة ${a.surahNumber}`}</span>
                    <span className="mr-2" style={{ color: 'var(--text-secondary)' }}>آية {a.ayahNumber}</span>
                    <span className="text-xs text-red-500">{a.totalErrors} أخطاء</span>
                  </div>
                </div>
              );
            })}
          </div>
          <Link href="/errors/drill"
            className="btn-primary text-sm mt-3 block text-center w-full py-2">
            ابدأ التدريب
          </Link>
        </div>
      )}

      {/* Near review */}
      {nearDays.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-bold mb-3">المراجعة القريبة</h2>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            مراجعة آخر {nearDays.length} أيام: {getDayRangeText(nearDays)}
          </p>
          <div className="space-y-2">
            {nearDays.map(d => (
              <div key={d.dayNumber} className="flex justify-between items-center text-sm p-2 rounded"
                   style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <span>يوم {d.dayNumber}: {d.surahName} ({d.startAyah}–{d.endAyah})</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{d.ayahCount} آيات</span>
              </div>
            ))}
          </div>
          <Link href="/review/near" className="btn-secondary text-sm mt-3 block text-center">
            بدء المراجعة القريبة
          </Link>
        </div>
      )}

      {/* Daily schedule */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">الجدول اليومي</h2>
        <div className="space-y-2 text-sm">
          {[
            { time: 'بعد الفجر', task: 'الحفظ الجديد', duration: '30 دقيقة', icon: '\u{1F195}' },
            { time: 'بعد الظهر', task: 'المراجعة القريبة', duration: '15 دقيقة', icon: '\u{1F504}' },
            { time: 'بعد العصر', task: 'التثبيت (10 تكرارات)', duration: '15 دقيقة', icon: '\u{1F4D6}' },
            { time: 'بعد المغرب', task: 'المراجعة البعيدة', duration: '20 دقيقة', icon: '\u{1F501}' },
            { time: 'بعد العشاء', task: 'التسميع', duration: '15 دقيقة', icon: '\u{270D}\u{FE0F}' },
          ].map(item => (
            <div key={item.time} className="flex items-center gap-3 p-2 rounded"
                 style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1">
                <span className="font-medium">{item.task}</span>
                <span className="mr-2 text-xs" style={{ color: 'var(--text-secondary)' }}>— {item.time}</span>
              </div>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.duration}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
