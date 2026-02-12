'use client';

interface StreakCounterProps {
  streak: number;
}

export default function StreakCounter({ streak }: StreakCounterProps) {
  const isStrong = streak > 7;

  return (
    <div className={`card text-center ${isStrong ? 'animate-pulse-glow' : ''}`}
      style={isStrong ? { boxShadow: 'var(--shadow-glow-gold)' } : undefined}>
      <div className="text-4xl mb-2">🔥</div>
      <div className="text-3xl font-bold" style={{ color: 'var(--color-gold-500)' }}>{streak}</div>
      <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
        {streak === 0 ? 'ابدأ سلسلتك اليوم!' : streak === 1 ? 'يوم واحد' : `${streak} أيام متتالية`}
      </p>
      {isStrong && (
        <p className="text-xs mt-2 font-bold" style={{ color: 'var(--color-gold-600)' }}>
          ما شاء الله! استمر
        </p>
      )}
    </div>
  );
}
