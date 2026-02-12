export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  ayahs: Ayah[];
  revelationType: string;
}

export interface AyahRange {
  surahNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
}
