'use client';

import { useProgress } from '@/hooks/useProgress';
import { getDay } from '@/data/plan';
import OverallProgress from '@/components/dashboard/OverallProgress';
import StreakCounter from '@/components/dashboard/StreakCounter';
import TodayBrief from '@/components/dashboard/TodayBrief';
import JuzProgressGrid from '@/components/dashboard/JuzProgressGrid';

export default function DashboardPage() {
  const { progress, overallProgress, streak, completedCount, currentDay, isDayCompleted } = useProgress();
  const todayDay = getDay(currentDay);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-emerald-600)' }}>
          بسم الله الرحمن الرحيم
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          خيركم من تعلم القرآن وعلمه
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <OverallProgress
            completedCount={completedCount}
            overallProgress={overallProgress}
            currentDay={currentDay}
            progress={progress}
          />
        </div>
        <StreakCounter streak={streak} />
      </div>

      <TodayBrief
        day={todayDay}
        isCompleted={todayDay ? isDayCompleted(todayDay.dayNumber) : false}
      />

      <JuzProgressGrid progress={progress} />
    </div>
  );
}
