'use client';

import { useState, useEffect } from 'react';
import { ErrorEntry, AyahErrorSummary } from '@/types/error-log';
import { getErrors, addErrors as addErrorsToStorage, getAyahErrorSummaries, getWeakAyahs, clearErrors as clearAll } from '@/lib/error-tracker';

export function useErrorLog() {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [summaries, setSummaries] = useState<AyahErrorSummary[]>([]);

  const refresh = () => {
    setErrors(getErrors());
    setSummaries(getAyahErrorSummaries());
  };

  useEffect(() => { refresh(); }, []);

  const addErrors = (newErrors: ErrorEntry[]) => {
    addErrorsToStorage(newErrors);
    refresh();
  };

  const weakAyahs = getWeakAyahs();

  const clearErrors = () => {
    clearAll();
    refresh();
  };

  return { errors, summaries, weakAyahs, addErrors, clearErrors, refresh };
}
