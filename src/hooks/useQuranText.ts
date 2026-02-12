'use client';

import { useState, useEffect } from 'react';
import { Ayah } from '@/types/quran';

interface SurahData {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
}

const surahCache = new Map<number, SurahData>();

export function useQuranText(surahNumber: number, startAyah?: number, endAyah?: number) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
      setLoading(false);
      return;
    }

    async function loadSurah() {
      setLoading(true);
      setError(null);

      try {
        if (surahCache.has(surahNumber)) {
          const data = surahCache.get(surahNumber)!;
          filterAndSet(data.ayahs);
          return;
        }

        const response = await fetch(`/quran/${surahNumber}.json`);
        if (!response.ok) throw new Error(`Failed to load surah ${surahNumber}`);
        const data: SurahData = await response.json();
        surahCache.set(surahNumber, data);
        filterAndSet(data.ayahs);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'خطأ في تحميل السورة');
        setAyahs([]);
      } finally {
        setLoading(false);
      }
    }

    function filterAndSet(allAyahs: Ayah[]) {
      if (startAyah !== undefined && endAyah !== undefined) {
        setAyahs(allAyahs.filter(a => a.numberInSurah >= startAyah && a.numberInSurah <= endAyah));
      } else {
        setAyahs(allAyahs);
      }
    }

    loadSurah();
  }, [surahNumber, startAyah, endAyah]);

  const fullText = ayahs.map(a => a.text).join(' ');

  return { ayahs, loading, error, fullText };
}
