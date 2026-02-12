'use client';

import { Ayah } from '@/types/quran';

interface AyahDisplayProps {
  ayah: Ayah;
  showNumber?: boolean;
  highlight?: boolean;
  className?: string;
}

export default function AyahDisplay({ ayah, showNumber = true, highlight, className = '' }: AyahDisplayProps) {
  return (
    <span
      className={`quran-text inline rounded px-1 ${className}`}
      style={highlight ? { backgroundColor: 'var(--color-gold-100)', transition: 'background-color 0.3s' } : undefined}
    >
      {ayah.text}
      {showNumber && (
        <span className="ayah-number">{ayah.numberInSurah}</span>
      )}
    </span>
  );
}
