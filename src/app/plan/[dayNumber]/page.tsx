import { planDays } from '@/data/plan';
import DayDetailClient from './DayDetailClient';

export function generateStaticParams() {
  return planDays.map(d => ({ dayNumber: String(d.dayNumber) }));
}

export default function DayDetailPage() {
  return <DayDetailClient />;
}
