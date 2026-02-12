'use client';

import { useMemo } from 'react';
import { UserProgress } from '@/types/progress';

interface ActivityHeatmapProps {
  progress: UserProgress;
}

const DAY_LABELS = ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'];

function getColor(count: number): string {
  if (count === 0) return 'var(--bg-secondary)';
  if (count === 1) return 'var(--color-emerald-200)';
  if (count === 2) return 'var(--color-emerald-400)';
  return 'var(--color-emerald-600)';
}

export default function ActivityHeatmap({ progress }: ActivityHeatmapProps) {
  const { grid, maxWeeks } = useMemo(() => {
    // Count completions per date (last 182 days = 26 weeks)
    const dateCounts: Record<string, number> = {};
    for (const c of Object.values(progress.completedDays)) {
      if (c.completedAt) {
        const date = c.completedAt.split('T')[0];
        dateCounts[date] = (dateCounts[date] || 0) + 1;
      }
    }

    const today = new Date();
    const weeks = 26;
    const cells: { date: string; count: number; dayOfWeek: number; week: number }[] = [];

    // Start from 182 days ago, aligned to Saturday (start of week in Arabic calendar)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (weeks * 7 - 1));
    // Align to Saturday (day 6)
    const startDow = startDate.getDay();
    const satOffset = (startDow + 1) % 7; // days since Saturday
    startDate.setDate(startDate.getDate() - satOffset);

    for (let i = 0; i < weeks * 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      if (d > today) break;
      const iso = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay(); // 0=Sun...6=Sat
      // Map to Arabic week: Sat=0, Sun=1, Mon=2, ...Fri=6
      const arabicDow = (dayOfWeek + 1) % 7;
      const week = Math.floor(i / 7);
      cells.push({ date: iso, count: dateCounts[iso] || 0, dayOfWeek: arabicDow, week });
    }

    return { grid: cells, maxWeeks: weeks };
  }, [progress]);

  return (
    <div className="card">
      <h2 className="text-lg font-bold mb-3">خريطة النشاط</h2>
      <div className="flex gap-1" style={{ direction: 'ltr' }}>
        {/* Day labels */}
        <div className="flex flex-col gap-1 text-xs shrink-0 pt-0" style={{ color: 'var(--text-secondary)' }}>
          {DAY_LABELS.map((label, i) => (
            <div key={i} style={{ height: '14px', lineHeight: '14px', fontSize: '10px' }}>{label}</div>
          ))}
        </div>
        {/* Grid */}
        <div
          className="flex-1 overflow-x-auto"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${maxWeeks}, 14px)`,
            gridTemplateRows: 'repeat(7, 14px)',
            gap: '2px',
            gridAutoFlow: 'column',
          }}
        >
          {grid.map((cell, i) => (
            <div
              key={i}
              title={`${cell.date}: ${cell.count} إنجاز`}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '2px',
                backgroundColor: getColor(cell.count),
                gridRow: cell.dayOfWeek + 1,
              }}
            />
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="flex items-center gap-2 mt-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span>أقل</span>
        {[0, 1, 2, 3].map(n => (
          <div key={n} style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: getColor(n) }} />
        ))}
        <span>أكثر</span>
      </div>
    </div>
  );
}
