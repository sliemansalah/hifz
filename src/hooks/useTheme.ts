'use client';

import { useEffect } from 'react';
import { useSettings } from './useSettings';

export function useTheme() {
  const { settings, updateSetting } = useSettings();

  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    const next = settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
    updateSetting('theme', next);
  };

  return { theme: settings.theme, toggleTheme, setTheme: (t: 'light' | 'dark' | 'system') => updateSetting('theme', t) };
}
