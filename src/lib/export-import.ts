import { getItem, setItem, getAllKeys } from './storage';

export interface ExportData {
  version: 1;
  exportDate: string;
  data: Record<string, unknown>;
}

export function exportAllData(): string {
  const keys = getAllKeys();
  const data: Record<string, unknown> = {};
  for (const key of keys) {
    data[key] = getItem(key, null);
  }

  const exportObj: ExportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    data,
  };

  return JSON.stringify(exportObj, null, 2);
}

export function downloadExport(): void {
  const json = exportAllData();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `hifz-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importData(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString) as ExportData;
    if (!parsed.version || !parsed.data) {
      return { success: false, error: 'صيغة الملف غير صحيحة' };
    }

    for (const [key, value] of Object.entries(parsed.data)) {
      setItem(key, value);
    }

    return { success: true };
  } catch {
    return { success: false, error: 'فشل في قراءة الملف' };
  }
}
