'use client';

import Link from 'next/link';
import { PlanDay } from '@/types/plan';
import Badge from '@/components/ui/Badge';

interface DayCardProps {
  day: PlanDay;
  isCompleted: boolean;
  isCurrent: boolean;
}

export default function DayCard({ day, isCompleted, isCurrent }: DayCardProps) {
  return (
    <Link href={`/plan/${day.dayNumber}`}
      className={`card block transition-all hover:shadow-md ${
        isCurrent ? 'ring-2 ring-emerald-500' : ''
      } ${isCompleted ? 'opacity-80' : ''}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold">يوم {day.dayNumber}</span>
        <div className="flex gap-1">
          {isCompleted && <Badge variant="success">مكتمل</Badge>}
          {isCurrent && <Badge variant="warning">الحالي</Badge>}
        </div>
      </div>
      <p className="text-sm font-medium">{day.surahName} ({day.startAyah}–{day.endAyah})</p>
      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
        {day.ayahCount} آيات — الجزء {day.juz}
      </p>
    </Link>
  );
}
