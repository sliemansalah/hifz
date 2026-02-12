'use client';

import ProgressBar from '@/components/ui/ProgressBar';
import { TOTAL_DAYS } from '@/data/plan';
import { UserProgress } from '@/types/progress';
import { daysBetween, todayISO, addDays, formatDate } from '@/lib/date-utils';

interface OverallProgressProps {
  completedCount: number;
  overallProgress: number;
  currentDay: number;
  progress?: UserProgress;
}

export default function OverallProgress({ completedCount, overallProgress, currentDay, progress }: OverallProgressProps) {
  const memorizedOnly = progress ? Object.values(progress.completedDays).filter(c => c.memorized && !c.tested).length : 0;
  const fullyDone = progress ? Object.values(progress.completedDays).filter(c => c.memorized && c.tested).length : completedCount;

  // Estimated completion date
  let estimatedDateStr: string | null = null;
  if (progress && fullyDone > 0) {
    const daysSinceStart = daysBetween(progress.startDate, todayISO());
    if (daysSinceStart > 0) {
      const daysPerDay = fullyDone / daysSinceStart;
      const remainingDays = TOTAL_DAYS - fullyDone;
      const daysNeeded = Math.ceil(remainingDays / daysPerDay);
      estimatedDateStr = formatDate(addDays(todayISO(), daysNeeded));
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">التقدم الإجمالي</h2>
        <span className="text-2xl font-bold animate-scale-in" style={{ color: 'var(--color-emerald-600)' }}>
          {overallProgress}%
        </span>
      </div>
      <ProgressBar value={overallProgress} showPercentage={false} size="lg" />
      <div className="flex justify-between mt-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
        <span>{fullyDone} يوم مكتمل من {TOTAL_DAYS}</span>
        <span>اليوم الحالي: {currentDay}</span>
      </div>
      {memorizedOnly > 0 && (
        <div className="mt-2 text-xs px-2 py-1 rounded-lg inline-block"
          style={{ backgroundColor: 'var(--color-gold-50)', color: 'var(--color-gold-700)' }}>
          {memorizedOnly} يوم بانتظار التسميع
        </div>
      )}
      {estimatedDateStr && (
        <div className="mt-2 text-xs px-2 py-1 rounded-lg inline-block"
          style={{ backgroundColor: 'var(--color-emerald-50)', color: 'var(--color-emerald-700)' }}>
          الإنتهاء المتوقع: {estimatedDateStr}
        </div>
      )}
    </div>
  );
}
