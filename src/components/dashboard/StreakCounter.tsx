'use client';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  return (
    <div className="card text-center">
      <div className="text-4xl mb-2">🔥</div>
      <div className="text-3xl font-bold" style={{ color: 'var(--color-gold-500)' }}>{streak}</div>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
        {streak === 0 ? 'ابدأ سلسلتك اليوم!' : streak === 1 ? 'يوم واحد' : `${streak} أيام متتالية`}
      </p>
    </div>
  );
}
