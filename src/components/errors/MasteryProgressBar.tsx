import { MasteryStats } from '@/types/mastery';

interface MasteryProgressBarProps {
  stats: MasteryStats;
}

export default function MasteryProgressBar({ stats }: MasteryProgressBarProps) {
  const total = stats.total || 1;
  const newPct = (stats.new / total) * 100;
  const practicingPct = (stats.practicing / total) * 100;
  const masteredPct = (stats.mastered / total) * 100;

  return (
    <div className="card">
      <h3 className="font-bold mb-3">مستوى الإتقان</h3>
      <div className="w-full h-4 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        {masteredPct > 0 && (
          <div style={{ width: `${masteredPct}%`, backgroundColor: '#059669' }} className="transition-all" />
        )}
        {practicingPct > 0 && (
          <div style={{ width: `${practicingPct}%`, backgroundColor: '#eab308' }} className="transition-all" />
        )}
        {newPct > 0 && (
          <div style={{ width: `${newPct}%`, backgroundColor: '#ef4444' }} className="transition-all" />
        )}
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#059669' }} />
          <span>متقن ({stats.mastered})</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#eab308' }} />
          <span>يتدرب ({stats.practicing})</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }} />
          <span>جديد ({stats.new})</span>
        </div>
      </div>
    </div>
  );
}
