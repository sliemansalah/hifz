'use client';

import { useState } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { planDays, TOTAL_JUZ } from '@/data/plan';
import { getJuzDayNumbers } from '@/lib/plan-utils';
import { calculateJuzProgress } from '@/lib/progress-calculator';
import DayCard from '@/components/memorization/DayCard';
import ProgressBar from '@/components/ui/ProgressBar';

export default function PlanPage() {
  const { progress, currentDay, isDayCompleted } = useProgress();
  const [selectedJuz, setSelectedJuz] = useState(
    planDays.find(d => d.dayNumber === currentDay)?.juz || 1
  );

  const juzDays = planDays.filter(d => d.juz === selectedJuz);
  const juzDayNumbers = getJuzDayNumbers(selectedJuz);
  const juzProgress = calculateJuzProgress(progress, juzDayNumbers);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">الخطة التفصيلية</h1>

      {/* Juz selector */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">اختر الجزء</h2>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {Array.from({ length: TOTAL_JUZ }, (_, i) => i + 1).map(juz => {
            const dayNums = getJuzDayNumbers(juz);
            const pct = calculateJuzProgress(progress, dayNums);
            return (
              <button key={juz}
                onClick={() => setSelectedJuz(juz)}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  juz === selectedJuz
                    ? 'bg-emerald-600 text-white'
                    : pct === 100
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'hover:bg-[var(--bg-secondary)]'
                }`}>
                {juz}
              </button>
            );
          })}
        </div>
      </div>

      {/* Juz progress */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold">الجزء {selectedJuz}</h2>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {juzDays.length} أيام
          </span>
        </div>
        <ProgressBar value={juzProgress} label="تقدم الجزء" />
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {juzDays.map(day => (
          <DayCard
            key={day.dayNumber}
            day={day}
            isCompleted={isDayCompleted(day.dayNumber)}
            isCurrent={day.dayNumber === currentDay}
          />
        ))}
      </div>
    </div>
  );
}
