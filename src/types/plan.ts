export interface PlanDay {
  dayNumber: number;
  juz: number;
  surahName: string;
  surahNumber: number;
  startAyah: number;
  endAyah: number;
  ayahCount: number;
  nearReview: string;
}

export interface FridayReview {
  afterDay: number;
  juz: number;
  description: string;
}

export interface MonthlyReview {
  month: number;
  afterDay: number;
  juz: number;
}

export interface PlanJuz {
  juzNumber: number;
  days: PlanDay[];
  fridays: FridayReview[];
}
