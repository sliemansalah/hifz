'use client';

import { useLocalStorage } from './useLocalStorage';
import { UserSettings, defaultSettings } from '@/types/settings';

export function useSettings() {
  const [settings, setSettings] = useLocalStorage<UserSettings>('settings', defaultSettings);

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, setSettings, updateSetting };
}
