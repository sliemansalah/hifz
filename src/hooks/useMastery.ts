'use client';

import { useState, useEffect, useCallback } from 'react';
import { MasteryStats, ErrorTrendWeek, ErrorTypeBreakdown, AyahMastery, MasteryLevel } from '@/types/mastery';
import {
  syncMasteryFromErrors,
  getMasteryStats,
  getErrorTrends,
  getErrorTypeBreakdown,
  getWeakestForDrill,
  getDueForReview,
  recordDrillResult,
  getAyahMasteryLevel,
} from '@/lib/mastery-engine';

export function useMastery() {
  const [stats, setStats] = useState<MasteryStats>({ total: 0, new: 0, practicing: 0, mastered: 0 });
  const [trends, setTrends] = useState<ErrorTrendWeek[]>([]);
  const [breakdown, setBreakdown] = useState<ErrorTypeBreakdown>({ substitution: 0, deletion: 0, addition: 0, order: 0 });
  const [weakest, setWeakest] = useState<AyahMastery[]>([]);
  const [dueForReview, setDueForReview] = useState<AyahMastery[]>([]);

  const refresh = useCallback(() => {
    syncMasteryFromErrors();
    setStats(getMasteryStats());
    setTrends(getErrorTrends());
    setBreakdown(getErrorTypeBreakdown());
    setWeakest(getWeakestForDrill(5));
    setDueForReview(getDueForReview());
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const drill = useCallback((surahNumber: number, ayahNumber: number, score: number, errors: number) => {
    const result = recordDrillResult(surahNumber, ayahNumber, score, errors);
    refresh();
    return result;
  }, [refresh]);

  const getMasteryLevel = useCallback((surahNumber: number, ayahNumber: number): MasteryLevel | null => {
    return getAyahMasteryLevel(surahNumber, ayahNumber);
  }, []);

  return {
    stats,
    trends,
    breakdown,
    weakest,
    dueForReview,
    refresh,
    drill,
    getMasteryLevel,
  };
}
