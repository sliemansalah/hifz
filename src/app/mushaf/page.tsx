'use client';

import { useState, useEffect, useMemo } from 'react';
import { surahMeta } from '@/data/surah-meta';
import { useQuranText } from '@/hooks/useQuranText';
import { getWordErrorStatuses, getAyahErrorStatus, type WordErrorStatus } from '@/lib/error-tracker';
import { splitWords, removeTashkeel } from '@/lib/arabic-utils';
import AudioPlayer from '@/components/quran/AudioPlayer';

const ERROR_COLORS: Record<WordErrorStatus, string> = {
  red: '#ef4444',
  yellow: '#eab308',
  orange: '#f97316',
  none: 'inherit',
};

const ERROR_BG: Record<WordErrorStatus, string> = {
  red: 'rgba(239,68,68,0.15)',
  yellow: 'rgba(234,179,8,0.15)',
  orange: 'rgba(249,115,22,0.15)',
  none: 'transparent',
};

function AyahWithErrors({ surahNumber, ayahNumber, text, absoluteNumber }: {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  absoluteNumber: number;
}) {
  const wordStatuses = useMemo(
    () => getWordErrorStatuses(surahNumber, ayahNumber),
    [surahNumber, ayahNumber]
  );

  const words = text.split(/\s+/);
  const hasErrors = Object.keys(wordStatuses).length > 0;

  return (
    <span className="inline">
      {words.map((word, idx) => {
        const status = wordStatuses[idx] || 'none';
        return (
          <span key={idx}
            style={{
              color: status !== 'none' ? ERROR_COLORS[status] : 'inherit',
              backgroundColor: ERROR_BG[status],
              borderRadius: status !== 'none' ? '0.25rem' : undefined,
              padding: status !== 'none' ? '0 0.15rem' : undefined,
              fontWeight: status !== 'none' ? 'bold' : undefined,
              textDecoration: status === 'red' ? 'underline wavy' : undefined,
              textDecorationColor: status === 'red' ? ERROR_COLORS.red : undefined,
              cursor: status !== 'none' ? 'help' : undefined,
            }}
            title={status === 'red' ? 'أخطأت أكثر من مرة' : status === 'yellow' ? 'أخطأت مرة واحدة' : status === 'orange' ? 'أخطأت سابقا وصححت' : undefined}
          >
            {word}{' '}
          </span>
        );
      })}
      <span className="ayah-number">{ayahNumber}</span>
    </span>
  );
}

function SurahView({ surahNumber }: { surahNumber: number }) {
  const { ayahs, loading, error } = useQuranText(surahNumber);
  const meta = surahMeta.find(s => s.number === surahNumber);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>جارٍ تحميل السورة...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Surah header */}
      <div className="text-center py-4 islamic-border">
        <h2 className="text-2xl font-bold quran-text" style={{ color: 'var(--color-emerald-600)' }}>
          سورة {meta?.name}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {meta?.ayahCount} آيات — {meta?.revelationType === 'meccan' ? 'مكية' : 'مدنية'}
        </p>
      </div>

      {/* Audio player */}
      {ayahs.length > 0 && (
        <AudioPlayer ayahs={ayahs} />
      )}

      {/* Ayahs */}
      <div className="quran-text text-center leading-loose p-4 md:p-6 islamic-border">
        {ayahs.map(ayah => (
          <AyahWithErrors
            key={ayah.numberInSurah}
            surahNumber={surahNumber}
            ayahNumber={ayah.numberInSurah}
            text={ayah.text}
            absoluteNumber={ayah.number}
          />
        ))}
      </div>
    </div>
  );
}

export default function MushafPage() {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [showSurahList, setShowSurahList] = useState(true);

  // Calculate error status per surah (overview)
  const surahErrors = useMemo(() => {
    const result: Record<number, { red: number; yellow: number; orange: number }> = {};
    for (const surah of surahMeta) {
      let red = 0, yellow = 0, orange = 0;
      for (let ayah = 1; ayah <= surah.ayahCount; ayah++) {
        const status = getAyahErrorStatus(surah.number, ayah);
        if (status === 'red') red++;
        else if (status === 'yellow') yellow++;
        else if (status === 'orange') orange++;
      }
      if (red + yellow + orange > 0) {
        result[surah.number] = { red, yellow, orange };
      }
    }
    return result;
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المصحف الشخصي</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            مصحفك مع تتبع الأخطاء
          </p>
        </div>
        <button onClick={() => setShowSurahList(!showSurahList)} className="btn-secondary text-sm">
          {showSurahList ? 'عرض السورة' : 'قائمة السور'}
        </button>
      </div>

      {/* Legend */}
      <div className="card flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: ERROR_COLORS.red }} />
          <span>أخطأت أكثر من مرة</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: ERROR_COLORS.yellow }} />
          <span>أخطأت مرة واحدة</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: ERROR_COLORS.orange }} />
          <span>صححت لاحقا</span>
        </div>
      </div>

      {showSurahList ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {surahMeta.map(surah => {
            const errs = surahErrors[surah.number];
            return (
              <button key={surah.number}
                onClick={() => { setSelectedSurah(surah.number); setShowSurahList(false); }}
                className="card flex items-center gap-3 text-right hover:border-emerald-400 transition-colors cursor-pointer"
                style={{ padding: '0.75rem 1rem' }}>
                <span className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: 'var(--color-emerald-100)', color: 'var(--color-emerald-800)' }}>
                  {surah.number}
                </span>
                <div className="flex-1">
                  <span className="font-bold">{surah.name}</span>
                  <span className="text-xs mr-2" style={{ color: 'var(--text-secondary)' }}>
                    {surah.ayahCount} آيات
                  </span>
                </div>
                {errs && (
                  <div className="flex gap-1">
                    {errs.red > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: ERROR_COLORS.red }}>
                        {errs.red}
                      </span>
                    )}
                    {errs.yellow > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: ERROR_COLORS.yellow }}>
                        {errs.yellow}
                      </span>
                    )}
                    {errs.orange > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: ERROR_COLORS.orange }}>
                        {errs.orange}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <SurahView surahNumber={selectedSurah} />
      )}
    </div>
  );
}
