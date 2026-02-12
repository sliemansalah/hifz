'use client';

interface SurahHeaderProps {
  name: string;
  number: number;
  ayahCount?: number;
}

export default function SurahHeader({ name, number, ayahCount }: SurahHeaderProps) {
  return (
    <div className="text-center py-4 px-6 rounded-xl mb-4"
         style={{ background: 'linear-gradient(135deg, var(--color-emerald-600), var(--color-emerald-800))' }}>
      <h2 className="text-2xl font-bold text-white">سورة {name}</h2>
      <div className="flex justify-center gap-4 mt-2 text-emerald-100 text-sm">
        <span>رقم {number}</span>
        {ayahCount && <span>{ayahCount} آية</span>}
      </div>
    </div>
  );
}
