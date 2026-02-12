import { MasteryLevel } from '@/types/mastery';

interface MasteryBadgeProps {
  level: MasteryLevel;
}

const config: Record<MasteryLevel, { label: string; bg: string; color: string }> = {
  new: { label: 'جديد', bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
  practicing: { label: 'يتدرب', bg: 'rgba(234,179,8,0.15)', color: '#b45309' },
  mastered: { label: 'متقن', bg: 'rgba(16,185,129,0.15)', color: '#059669' },
};

export default function MasteryBadge({ level }: MasteryBadgeProps) {
  const c = config[level];
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
      style={{ backgroundColor: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}
