'use client';

import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import { getDay, planDays } from '@/data/plan';
import { getWeakAyahs } from '@/lib/error-tracker';
import { getCertificates } from '@/lib/certificates';
import { useMemo } from 'react';

export default function TestPage() {
  const { currentDay, isDayMemorized, isDayTested, getDayScore } = useProgress();
  const day = getDay(currentDay);

  const weakAyahs = useMemo(() => getWeakAyahs(2), []);
  const recentCerts = useMemo(() => getCertificates().slice(0, 3), []);

  // Find days that are memorized but not tested
  const untested = useMemo(() => {
    return planDays
      .filter(d => d.dayNumber < currentDay && isDayMemorized(d.dayNumber) && !isDayTested(d.dayNumber))
      .slice(0, 5);
  }, [currentDay, isDayMemorized, isDayTested]);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">التسميع والاختبار</h1>

      {/* Current day test */}
      {day && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">مقرر اليوم {currentDay}</h3>
            {isDayTested(currentDay) && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                تم التسميع {getDayScore(currentDay) ? `(${getDayScore(currentDay)}%)` : ''}
              </span>
            )}
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            {day.surahName} ({day.startAyah}–{day.endAyah})
          </p>
          <div className="flex gap-2">
            <Link href={`/test/written?day=${currentDay}`} className="btn-primary flex-1 text-center text-sm">
              تسميع كتابي
            </Link>
            <Link href={`/test/word-hide?day=${currentDay}`} className="btn-accent flex-1 text-center text-sm">
              إخفاء كلمات
            </Link>
            <Link href={`/test/oral?day=${currentDay}`}
              className="flex-1 text-center text-sm py-2 px-3 rounded-lg font-medium transition-all"
              style={{ backgroundColor: 'var(--color-gold-100)', color: 'var(--color-gold-800)' }}>
              تسميع شفهي
            </Link>
          </div>
          <Link href={`/test/tap?day=${currentDay}`}
            className="block text-center text-sm py-2 px-3 rounded-lg font-medium transition-all mt-2"
            style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: 'var(--color-emerald-700)' }}>
            تسميع سريع (كلمة بكلمة)
          </Link>
        </div>
      )}

      {/* Test types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href={`/test/tap${day ? `?day=${currentDay}` : ''}`}
          className="card hover:shadow-lg transition-shadow text-center py-8 sm:col-span-2"
          style={{ borderColor: 'var(--color-emerald-400)', borderWidth: '2px' }}>
          <div className="text-4xl mb-3">&#x1F446;</div>
          <h2 className="text-xl font-bold mb-2">تسميع سريع</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            كلمة بكلمة — اضغط للكشف وحدد الأخطاء بسرعة
          </p>
        </Link>

        <Link href={`/test/written${day ? `?day=${currentDay}` : ''}`}
          className="card hover:shadow-lg transition-shadow text-center py-8">
          <div className="text-4xl mb-3">&#x270D;&#xFE0F;</div>
          <h2 className="text-xl font-bold mb-2">تسميع كتابي</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            اكتب الآيات من الذاكرة ثم قارن
          </p>
        </Link>

        <Link href={`/test/word-hide${day ? `?day=${currentDay}` : ''}`}
          className="card hover:shadow-lg transition-shadow text-center py-8">
          <div className="text-4xl mb-3">&#x1F50D;</div>
          <h2 className="text-xl font-bold mb-2">إخفاء كلمات</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            أكمل الكلمات المخفية من الآيات
          </p>
        </Link>

        <Link href={`/test/oral${day ? `?day=${currentDay}` : ''}`}
          className="card hover:shadow-lg transition-shadow text-center py-8">
          <div className="text-4xl mb-3">&#x1F3A4;</div>
          <h2 className="text-xl font-bold mb-2">تسميع شفهي</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            سجّل صوتك ثم قارن بالنص الأصلي
          </p>
        </Link>

        <Link href="/errors/drill"
          className="card hover:shadow-lg transition-shadow text-center py-8">
          <div className="text-4xl mb-3">&#x1F3AF;</div>
          <h2 className="text-xl font-bold mb-2">تدريب الأخطاء</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            تدريب مركّز على الآيات الضعيفة
          </p>
        </Link>
      </div>

      {/* Untested memorized days */}
      {untested.length > 0 && (
        <div className="card">
          <h3 className="font-bold mb-3">يحتاج تسميع (حُفظ ولم يُسمَّع)</h3>
          <div className="space-y-2">
            {untested.map(d => (
              <div key={d.dayNumber} className="flex items-center justify-between p-2 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-sm">
                  <span className="font-medium">يوم {d.dayNumber}</span>
                  <span className="mr-2" style={{ color: 'var(--text-secondary)' }}>
                    {d.surahName} ({d.startAyah}–{d.endAyah})
                  </span>
                </div>
                <Link href={`/test/written?day=${d.dayNumber}`}
                  className="text-xs px-2 py-1 rounded-lg font-medium"
                  style={{ backgroundColor: 'var(--color-gold-100)', color: 'var(--color-gold-800)' }}>
                  اختبر
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak ayahs drill */}
      {weakAyahs.length > 0 && (
        <div className="card" style={{ borderColor: '#ef4444', borderWidth: '1px' }}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">&#x1F3AF;</span>
            <h3 className="font-bold">تدريب نقاط الضعف</h3>
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            هذه الآيات فيها أخطاء متكررة — ركّز على مراجعتها:
          </p>
          <div className="space-y-2">
            {weakAyahs.slice(0, 5).map(w => {
              const matchDay = planDays.find(d =>
                d.surahNumber === w.surahNumber && d.startAyah <= w.ayahNumber && d.endAyah >= w.ayahNumber
              );
              return (
                <div key={`${w.surahNumber}:${w.ayahNumber}`}
                  className="flex items-center justify-between p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(239,68,68,0.05)' }}>
                  <div className="text-sm">
                    <span className="font-bold text-red-500 ml-2">{w.totalErrors} أخطاء</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      سورة {matchDay?.surahName || w.surahNumber} — آية {w.ayahNumber}
                    </span>
                  </div>
                  {matchDay && (
                    <Link href={`/test/written?day=${matchDay.dayNumber}`}
                      className="text-xs px-2 py-1 rounded-lg font-medium bg-red-50 text-red-600">
                      تدريب
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <Link href="/errors/drill"
            className="btn-primary text-sm mt-3 block text-center w-full py-2">
            ابدأ التدريب المركّز
          </Link>
        </div>
      )}

      {/* Recent certificates preview */}
      {recentCerts.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">آخر الشهادات</h3>
            <Link href="/certificates" className="text-xs" style={{ color: 'var(--color-emerald-600)' }}>عرض الكل</Link>
          </div>
          <div className="space-y-2">
            {recentCerts.map(c => (
              <div key={c.id} className="flex items-center justify-between p-2 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-sm">
                  <span className="ml-1">{c.score === 100 ? '\u{1F3C6}' : '\u{2B50}'}</span>
                  <span className="font-medium">{c.surahName}</span>
                  <span className="text-xs mr-1" style={{ color: 'var(--text-secondary)' }}>
                    ({c.startAyah}–{c.endAyah})
                  </span>
                </div>
                <span className="font-bold text-sm" style={{
                  color: c.score === 100 ? 'var(--color-emerald-600)' : 'var(--color-gold-600)'
                }}>
                  {c.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
