import { getItem, setItem, getAllKeys } from './storage';

export interface ExportData {
  version: 1;
  exportDate: string;
  data: Record<string, unknown>;
}

export interface ImportPreview {
  version: number;
  exportDate: string;
  dayCount: number;
  sessionCount: number;
  errorCount: number;
  keys: string[];
}

const ALLOWED_KEYS = [
  'progress',
  'settings',
  'session_history',
  'error_log',
  'certificates',
  'far_review_log',
];

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

export function previewImport(jsonString: string): { success: boolean; preview?: ImportPreview; error?: string } {
  try {
    const parsed = JSON.parse(jsonString) as ExportData;
    if (!parsed.version || !parsed.data) {
      return { success: false, error: 'صيغة الملف غير صحيحة' };
    }
    if (parsed.version !== 1) {
      return { success: false, error: `إصدار غير مدعوم: ${parsed.version}` };
    }

    // Validate keys
    const keys = Object.keys(parsed.data);
    const unknownKeys = keys.filter(k => !ALLOWED_KEYS.includes(k));
    if (unknownKeys.length > 0) {
      return { success: false, error: `مفاتيح غير معروفة: ${unknownKeys.join(', ')}` };
    }

    // Count stats for preview
    const progress = parsed.data.progress as Record<string, unknown> | undefined;
    const completedDays = (progress as { completedDays?: Record<string, unknown> })?.completedDays;
    const dayCount = completedDays ? Object.keys(completedDays).length : 0;

    const sessions = parsed.data.session_history as unknown[] | undefined;
    const sessionCount = Array.isArray(sessions) ? sessions.length : 0;

    const errors = parsed.data.error_log as unknown[] | undefined;
    const errorCount = Array.isArray(errors) ? errors.length : 0;

    return {
      success: true,
      preview: {
        version: parsed.version,
        exportDate: parsed.exportDate,
        dayCount,
        sessionCount,
        errorCount,
        keys,
      },
    };
  } catch {
    return { success: false, error: 'فشل في قراءة الملف' };
  }
}

export function importData(jsonString: string): { success: boolean; error?: string } {
  try {
    const parsed = JSON.parse(jsonString) as ExportData;
    if (!parsed.version || !parsed.data) {
      return { success: false, error: 'صيغة الملف غير صحيحة' };
    }
    if (parsed.version !== 1) {
      return { success: false, error: `إصدار غير مدعوم: ${parsed.version}` };
    }

    // Only import allowed keys
    for (const [key, value] of Object.entries(parsed.data)) {
      if (ALLOWED_KEYS.includes(key)) {
        setItem(key, value);
      }
    }

    return { success: true };
  } catch {
    return { success: false, error: 'فشل في قراءة الملف' };
  }
}
