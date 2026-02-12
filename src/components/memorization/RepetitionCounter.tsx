'use client';

interface RepetitionCounterProps {
  count: number;
  goal: number;
  onIncrement: () => void;
  onReset: () => void;
}

export default function RepetitionCounter({ count, goal, onIncrement, onReset }: RepetitionCounterProps) {
  const progress = Math.min(100, (count / goal) * 100);
  const isComplete = count >= goal;

  return (
    <div className="card text-center">
      <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>عدد التكرارات</h3>
      <div className="relative inline-flex items-center justify-center w-32 h-32 mb-3">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="var(--border-color)" strokeWidth="8" />
          <circle cx="64" cy="64" r="56" fill="none"
            stroke={isComplete ? 'var(--color-emerald-500)' : 'var(--color-gold-500)'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${progress * 3.52} 352`} />
        </svg>
        <span className="absolute text-3xl font-bold">{count}</span>
      </div>
      <p className="text-sm mb-4" style={{ color: isComplete ? 'var(--color-emerald-600)' : 'var(--text-secondary)' }}>
        {isComplete ? 'أحسنت! أتممت الهدف' : `الهدف: ${goal} تكرارات`}
      </p>
      <div className="flex gap-2 justify-center">
        <button onClick={onIncrement} className="btn-primary text-lg px-8 py-3">
          +1
        </button>
        <button onClick={onReset} className="btn-secondary text-sm px-4">
          إعادة
        </button>
      </div>
    </div>
  );
}
