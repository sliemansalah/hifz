'use client';

import { useState, useRef } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from '@/hooks/useTheme';
import { downloadExport, importData, previewImport, ImportPreview } from '@/lib/export-import';
import Modal from '@/components/ui/Modal';

export default function SettingsPage() {
  const { settings, updateSetting } = useSettings();
  const { setTheme } = useTheme();
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [pendingImport, setPendingImport] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const json = ev.target?.result as string;
      const result = previewImport(json);
      if (result.success && result.preview) {
        setImportPreview(result.preview);
        setPendingImport(json);
      } else {
        setImportStatus(result.error || 'خطأ');
      }
    };
    reader.readAsText(file);
    // Reset file input
    e.target.value = '';
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    const result = importData(pendingImport);
    setImportStatus(result.success ? 'تم الاستيراد بنجاح! أعد تحميل الصفحة.' : result.error || 'خطأ');
    setImportPreview(null);
    setPendingImport(null);
  };

  const cancelImport = () => {
    setImportPreview(null);
    setPendingImport(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">الإعدادات</h1>

      {/* ── Section: Appearance ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-emerald-600)' }}>
          المظهر
        </h2>

        {/* Theme */}
        <div className="card">
          <h3 className="font-bold mb-3">السمة</h3>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map(t => (
              <button key={t}
                onClick={() => { updateSetting('theme', t); setTheme(t); }}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  settings.theme === t ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
                }`}>
                {t === 'light' ? '☀️ فاتح' : t === 'dark' ? '🌙 داكن' : '💻 نظام'}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div className="card">
          <h3 className="font-bold mb-3">حجم خط القرآن</h3>
          <div className="flex gap-2">
            {([
              { value: 'small' as const, label: 'صغير' },
              { value: 'medium' as const, label: 'متوسط' },
              { value: 'large' as const, label: 'كبير' },
              { value: 'xlarge' as const, label: 'كبير جداً' },
            ]).map(s => (
              <button key={s.value}
                onClick={() => updateSetting('fontSize', s.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.fontSize === s.value ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
                }`}>
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section: Memorization & Testing ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-emerald-600)' }}>
          الحفظ والاختبار
        </h2>

        {/* Repetition goal */}
        <div className="card">
          <h3 className="font-bold mb-3">هدف التكرار اليومي</h3>
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
              <h3 className="font-bold">إظهار التشكيل</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>عرض الحركات على النص القرآني</p>
            </div>
            <button
              onClick={() => updateSetting('showTashkeel', !settings.showTashkeel)}
              className="toggle-switch"
              role="switch"
              aria-checked={settings.showTashkeel}
            />
          </div>
        </div>

        {/* Test difficulty */}
        <div className="card">
          <h3 className="font-bold mb-3">صعوبة اختبار إخفاء الكلمات</h3>
          <div className="flex gap-2">
            {([
              { value: 'easy' as const, label: 'سهل (25%)' },
              { value: 'medium' as const, label: 'متوسط (50%)' },
              { value: 'hard' as const, label: 'صعب (75%)' },
            ]).map(d => (
              <button key={d.value}
                onClick={() => updateSetting('testDifficulty', d.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.testDifficulty === d.value ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
                }`}>
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section: Data ── */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-emerald-600)' }}>
          البيانات
        </h2>

        <div className="card">
          <h3 className="font-bold mb-3">تصدير واستيراد</h3>
          <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
            احفظ نسخة احتياطية من بياناتك أو استعد بيانات سابقة
          </p>
          <div className="flex gap-3">
            <button onClick={downloadExport} className="btn-primary flex-1">
              تصدير البيانات
            </button>
            <button onClick={() => fileRef.current?.click()} className="btn-secondary flex-1">
              استيراد البيانات
            </button>
            <input ref={fileRef} type="file" accept=".json" onChange={handleFileSelect} className="hidden" />
          </div>
          {importStatus && (
            <p className="text-sm mt-2 font-medium" style={{ color: importStatus.includes('نجاح') ? 'var(--color-emerald-600)' : 'red' }}>
              {importStatus}
            </p>
          )}
        </div>
      </div>

      {/* Import confirmation modal */}
      <Modal isOpen={!!importPreview} onClose={cancelImport} title="تأكيد الاستيراد">
        {importPreview && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              سيتم استبدال بياناتك الحالية بالبيانات التالية:
            </p>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-xl font-bold">{importPreview.dayCount}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>أيام مكتملة</div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-xl font-bold">{importPreview.sessionCount}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>جلسات</div>
              </div>
              <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-xl font-bold">{importPreview.errorCount}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>أخطاء</div>
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              تاريخ التصدير: {new Date(importPreview.exportDate).toLocaleDateString('ar-SA')}
            </p>
            <div className="flex gap-3">
              <button onClick={confirmImport} className="btn-primary flex-1">
                تأكيد الاستيراد
              </button>
              <button onClick={cancelImport} className="btn-secondary flex-1">
                إلغاء
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
