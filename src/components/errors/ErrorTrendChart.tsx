import { ErrorTrendWeek } from '@/types/mastery';

interface ErrorTrendChartProps {
  trends: ErrorTrendWeek[];
}

export default function ErrorTrendChart({ trends }: ErrorTrendChartProps) {
  const maxCount = Math.max(...trends.map(t => t.errorCount), 1);

  return (
    <div className="card">
      <h3 className="font-bold mb-3">اتجاه الأخطاء (8 أسابيع)</h3>
      <div className="flex items-end gap-1.5 h-32" dir="ltr">
        {trends.map((week, i) => {
          const height = maxCount > 0 ? (week.errorCount / maxCount) * 100 : 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                {week.errorCount > 0 ? week.errorCount : ''}
              </span>
              <div
                className="w-full rounded-t-sm transition-all"
                style={{
                  height: `${Math.max(height, 2)}%`,
                  backgroundColor: week.errorCount === 0
                    ? 'var(--color-emerald-200)'
                    : week.errorCount > maxCount * 0.7
                    ? '#ef4444'
                    : 'var(--color-gold-400)',
                  minHeight: '4px',
                }}
              />
              <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{week.weekLabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
