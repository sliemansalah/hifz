'use client';

import { useState, useRef, useCallback } from 'react';
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
  const gridRef = useRef<HTMLDivElement>(null);

  const juzDays = planDays.filter(d => d.juz === selectedJuz);
  const juzDayNumbers = getJuzDayNumbers(selectedJuz);
  const juzProgress = calculateJuzProgress(progress, juzDayNumbers);

  const currentDayJuz = planDays.find(d => d.dayNumber === currentDay)?.juz;
  const isCurrentJuzSelected = selectedJuz === currentDayJuz;

  const scrollToCurrentDay = useCallback(() => {
    // Switch to the juz containing the current day
    if (currentDayJuz && currentDayJuz !== selectedJuz) {
      setSelectedJuz(currentDayJuz);
    }
    // Use a short timeout to let the grid re-render if juz changed
    setTimeout(() => {
      const el = gridRef.current?.querySelector(`[data-day="${currentDay}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [currentDay, currentDayJuz, selectedJuz]);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الخطة التفصيلية</h1>
        <button onClick={scrollToCurrentDay}
          className="btn-primary text-sm py-1.5 px-3">
          انتقل لليوم الحالي
        </button>
      </div>

      {/* Juz selector */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">اختر الجزء</h2>
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {Array.from({ length: TOTAL_JUZ }, (_, i) => i + 1).map(juz => {
            const dayNums = getJuzDayNumbers(juz);
            const pct = calculateJuzProgress(progress, dayNums);
            const isCurrentJuz = juz === currentDayJuz;
            return (
              <button key={juz}
                onClick={() => setSelectedJuz(juz)}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  juz === selectedJuz
                    ? 'bg-emerald-600 text-white'
                    : pct === 100
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : 'hover:bg-[var(--bg-secondary)]'
                } ${isCurrentJuz && juz !== selectedJuz ? 'ring-2 ring-emerald-400' : ''}`}>
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
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {juzDays.map(day => (
          <div key={day.dayNumber} data-day={day.dayNumber}
            className={day.dayNumber === currentDay ? 'ring-2 ring-emerald-500 rounded-xl' : ''}>
            <DayCard
              day={day}
              isCompleted={isDayCompleted(day.dayNumber)}
              isCurrent={day.dayNumber === currentDay}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
