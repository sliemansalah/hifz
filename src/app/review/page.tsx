'use client';

import Link from 'next/link';
import { useReviewSchedule } from '@/hooks/useReviewSchedule';
import { getDayRangeText } from '@/lib/plan-utils';

export default function ReviewPage() {
  const { nearReview, farReview, weeklyReview } = useReviewSchedule();

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">المراجعة</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/review/near" className="card hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">🔄</div>
          <h2 className="text-lg font-bold mb-1">المراجعة القريبة</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {nearReview.description}
          </p>
          {nearReview.days.length > 0 && (
            <p className="text-xs mt-2 font-medium" style={{ color: 'var(--color-emerald-600)' }}>
              {getDayRangeText(nearReview.days)}
            </p>
          )}
        </Link>

        <Link href="/review/far" className="card hover:shadow-lg transition-shadow">
          <div className="text-3xl mb-2">🔁</div>
          <h2 className="text-lg font-bold mb-1">المراجعة البعيدة</h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {farReview?.description || 'لا توجد مراجعة بعيدة بعد'}
          </p>
          {farReview && (
            <p className="text-xs mt-2 font-medium" style={{ color: 'var(--color-emerald-600)' }}>
              الجزء {farReview.juz}
            </p>
          )}
        </Link>
      </div>

      <div className="card">
        <div className="text-3xl mb-2">🕌</div>
        <h2 className="text-lg font-bold mb-1">المعاهدة الأسبوعية (الجمعة)</h2>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {weeklyReview.description}
        </p>
        {weeklyReview.days.length > 0 && (
          <p className="text-xs mt-2" style={{ color: 'var(--color-emerald-600)' }}>
            {getDayRangeText(weeklyReview.days)}
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold mb-3">نظام المراجعة</h2>
        <div className="space-y-3 text-sm">
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <span className="font-bold">القريبة (يومياً):</span> مراجعة آخر 5 أيام حفظ
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <span className="font-bold">البعيدة (يومياً):</span> مراجعة جزء كامل من المحفوظ القديم بالدور
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <span className="font-bold">الأسبوعية (الجمعة):</span> مراجعة حفظ الأسبوع كاملاً + تسميع
          </div>
          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <span className="font-bold">الشهرية:</span> يومان مراجعة مكثفة لكل المحفوظ
          </div>
        </div>
      </div>
    </div>
  );
}
