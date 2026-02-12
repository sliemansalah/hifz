'use client';

import { useState, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { downloadExport, importData } from '@/lib/export-import';
import { UserSettings } from '@/types/settings';

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings();
  const { setTheme } = useTheme();
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importData(ev.target?.result as string);
      setImportStatus(result.success ? 'تم الاستيراد بنجاح! أعد تحميل الصفحة.' : result.error || 'خطأ');
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      {/* Theme */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">المظهر</h2>
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map(t => (
            <button key={t}
              onClick={() => { updateSetting('theme', t); setTheme(t); }}
              className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium ${
                settings.theme === t ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
              }`}>
              {t === 'light' ? '☀️ فاتح' : t === 'dark' ? '🌙 داكن' : '💻 نظام'}
            </button>
          ))}
        </div>
      </div>

      {/* Font size */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">حجم خط القرآن</h2>
        <div className="flex gap-2">
          {([
            { value: 'small' as const, label: 'صغير' },
            { value: 'medium' as const, label: 'متوسط' },
            { value: 'large' as const, label: 'كبير' },
            { value: 'xlarge' as const, label: 'كبير جداً' },
          ]).map(s => (
            <button key={s.value}
              onClick={() => updateSetting('fontSize', s.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                settings.fontSize === s.value ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Repetition goal */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">هدف التكرار اليومي</h2>
        <div className="flex items-center gap-4">
          <input
            type="range" min={3} max={20} value={settings.dailyGoalRepetitions}
            onChange={e => updateSetting('dailyGoalRepetitions', Number(e.target.value))}
            className="flex-1"
          />
          <span className="text-xl font-bold w-12 text-center">{settings.dailyGoalRepetitions}</span>
        </div>
      </div>

      {/* Tashkeel */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">إظهار التشكيل</h2>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>عرض الحركات على النص القرآني</p>
          </div>
          <button
            onClick={() => updateSetting('showTashkeel', !settings.showTashkeel)}
            className={`w-12 h-6 rounded-full transition-colors ${settings.showTashkeel ? 'bg-emerald-600' : 'bg-gray-300'}`}>
            <div className={`w-5 h-5 rounded-full bg-white transition-transform ${settings.showTashkeel ? '-translate-x-6' : '-translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Test difficulty */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">صعوبة اختبار إخفاء الكلمات</h2>
        <div className="flex gap-2">
          {([
            { value: 'easy' as const, label: 'سهل (25%)' },
            { value: 'medium' as const, label: 'متوسط (50%)' },
            { value: 'hard' as const, label: 'صعب (75%)' },
          ]).map(d => (
            <button key={d.value}
              onClick={() => updateSetting('testDifficulty', d.value)}
              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                settings.testDifficulty === d.value ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Export/Import */}
      <div className="card">
        <h2 className="text-lg font-bold mb-3">البيانات</h2>
        <div className="flex gap-3">
          <button onClick={downloadExport} className="btn-primary flex-1">
            تصدير البيانات
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn-secondary flex-1">
            استيراد البيانات
          </button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        </div>
        {importStatus && (
          <p className="text-sm mt-2 font-medium" style={{ color: importStatus.includes('نجاح') ? 'var(--color-emerald-600)' : 'red' }}>
            {importStatus}
          </p>
        )}
      </div>
    </div>
  );
}
