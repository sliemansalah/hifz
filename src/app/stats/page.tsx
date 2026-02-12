'use client';

import { useProgress } from '@/hooks/useProgress';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useErrorLog } from '@/hooks/useErrorLog';
import { TOTAL_DAYS, TOTAL_JUZ, planDays } from '@/data/plan';
import { getJuzDayNumbers } from '@/lib/plan-utils';
import { calculateJuzProgress } from '@/lib/progress-calculator';
import ProgressBar from '@/components/ui/ProgressBar';

export default function StatsPage() {
  const { progress, overallProgress, streak, completedCount, currentDay } = useProgress();
  const { sessions, getTotalTime } = useSessionHistory();
  const { errors } = useErrorLog();

  const totalMinutes = Math.round(getTotalTime() / 60);
  const avgScore = sessions.filter(s => s.score !== undefined).length > 0
    ? Math.round(sessions.filter(s => s.score !== undefined).reduce((a, s) => a + (s.score || 0), 0) / sessions.filter(s => s.score !== undefined).length)
    : 0;

  const juzProgressData = Array.from({ length: TOTAL_JUZ }, (_, i) => {
    const juz = i + 1;
    const dayNums = getJuzDayNumbers(juz);
    return { juz, progress: calculateJuzProgress(progress, dayNums) };
  });

  const completedJuz = juzProgressData.filter(j => j.progress === 100).length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">الإحصائيات</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'أيام مكتملة', value: completedCount, icon: '📅' },
          { label: 'أجزاء مكتملة', value: completedJuz, icon: '📗' },
          { label: 'سلسلة الأيام', value: streak, icon: '🔥' },
          { label: 'اليوم الحالي', value: currentDay, icon: '📍' },
        ].map(item => (
          <div key={item.label} className="card text-center">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-2xl font-bold">{item.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</div>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">التقدم الإجمالي</h2>
        <ProgressBar value={overallProgress} size="lg" />
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
          {completedCount} من {TOTAL_DAYS} يوم
          {completedCount > 0 && ` — المتبقي ${TOTAL_DAYS - completedCount} يوم`}
        </p>
      </div>

      {/* Session stats */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">إحصائيات الجلسات</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div>
            <div className="text-xl font-bold">{sessions.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>جلسات</div>
          </div>
          <div>
            <div className="text-xl font-bold">{totalMinutes}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>دقيقة</div>
          </div>
          <div>
            <div className="text-xl font-bold">{avgScore}%</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>متوسط التسميع</div>
          </div>
          <div>
            <div className="text-xl font-bold">{errors.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>أخطاء</div>
          </div>
        </div>
      </div>

      {/* Juz progress */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">تقدم الأجزاء</h2>
        <div className="space-y-2">
          {juzProgressData.map(({ juz, progress: pct }) => (
            <div key={juz} className="flex items-center gap-3">
              <span className="text-sm font-medium w-16">الجزء {juz}</span>
              <div className="flex-1">
                <ProgressBar value={pct} showPercentage={false} size="sm"
                  color={pct === 100 ? 'emerald' : pct > 0 ? 'gold' : 'emerald'} />
              </div>
              <span className="text-xs w-10 text-left">{pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
