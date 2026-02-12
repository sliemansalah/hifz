'use client';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'emerald' | 'gold' | 'blue';
}

export default function ProgressBar({ value, label, showPercentage = true, size = 'md', color = 'emerald' }: ProgressBarProps) {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };
  const colors = {
    emerald: 'from-emerald-400 to-emerald-600',
    gold: 'from-gold-400 to-gold-600',
    blue: 'from-blue-400 to-blue-600',
  };

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex justify-between mb-1 text-sm">
          {label && <span style={{ color: 'var(--text-secondary)' }}>{label}</span>}
          {showPercentage && <span className="font-bold">{Math.round(value)}%</span>}
        </div>
      )}
      <div className={`progress-bar ${heights[size]}`}>
        <div
          className={`progress-bar-fill bg-gradient-to-l ${colors[color]}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
