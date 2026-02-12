'use client';

import { useState, useEffect, useCallback } from 'react';
import { getItem, setItem } from '@/lib/storage';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const value = getItem(key, initialValue);
    setStoredValue(value);
    setIsLoaded(true);
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue(prev => {
      const newValue = value instanceof Function ? value(prev) : value;
      setItem(key, newValue);
      return newValue;
    });
  }, [key]);

  return [isLoaded ? storedValue : initialValue, setValue];
}
