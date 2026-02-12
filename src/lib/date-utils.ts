export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.floor((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24));
}

export function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function isToday(iso: string): boolean {
  return iso === todayISO();
}

export function getWeekDates(centerDate?: string): string[] {
  const center = centerDate ? new Date(centerDate) : new Date();
  const dayOfWeek = center.getDay();
  const saturday = new Date(center);
  saturday.setDate(center.getDate() - ((dayOfWeek + 1) % 7));

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(saturday);
    d.setDate(saturday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}
