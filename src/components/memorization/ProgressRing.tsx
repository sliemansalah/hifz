'use client';

interface ProgressRingProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export default function ProgressRing({ value, size = 120, strokeWidth = 8, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="var(--border-color)" strokeWidth={strokeWidth} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
            stroke="var(--color-emerald-500)" strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference}
            strokeDashoffset={offset} className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{Math.round(value)}%</span>
        </div>
      </div>
      {label && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>}
    </div>
  );
}
