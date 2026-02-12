'use client';

import { useQuranText } from '@/hooks/useQuranText';
import AyahDisplay from './AyahDisplay';
import AudioPlayer from './AudioPlayer';

interface AyahRangeProps {
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  showSurahHeader?: boolean;
  surahName?: string;
  showAudio?: boolean;
  highlightAyah?: number | null;
}

export default function AyahRange({ surahNumber, startAyah, endAyah, showSurahHeader = true, surahName, showAudio = true, highlightAyah }: AyahRangeProps) {
  const { ayahs, loading, error } = useQuranText(surahNumber, startAyah, endAyah);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-center" style={{ color: 'var(--text-secondary)' }}>
          جارٍ تحميل الآيات...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="islamic-border p-4 md:p-6">
      {showSurahHeader && surahName && (
        <div className="text-center mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h3 className="text-lg font-bold" style={{ color: 'var(--color-emerald-600)' }}>
            سورة {surahName}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            الآيات {startAyah} – {endAyah}
          </p>
        </div>
      )}
      <div className="quran-text text-center leading-loose">
        {ayahs.map(ayah => (
          <AyahDisplay key={ayah.numberInSurah} ayah={ayah} highlight={ayah.numberInSurah === highlightAyah} />
        ))}
      </div>
      {showAudio && ayahs.length > 0 && (
        <div className="mt-4 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
          <AudioPlayer ayahs={ayahs} />
        </div>
      )}
    </div>
  );
}
