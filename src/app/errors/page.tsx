'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useErrorLog } from '@/hooks/useErrorLog';
import { useMastery } from '@/hooks/useMastery';
import { getSurahMeta } from '@/data/surah-meta';
import MasteryProgressBar from '@/components/errors/MasteryProgressBar';
import ErrorTrendChart from '@/components/errors/ErrorTrendChart';
import MasteryBadge from '@/components/errors/MasteryBadge';

type SortMode = 'errors' | 'mastery';

export default function ErrorsPage() {
  const { summaries, weakAyahs, errors, clearErrors } = useErrorLog();
  const { stats, trends, breakdown, getMasteryLevel } = useMastery();
  const [surahFilter, setSurahFilter] = useState<number | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('errors');

  // Get unique surahs from summaries
  const surahOptions = useMemo(() => {
    const set = new Set(summaries.map(s => s.surahNumber));
    return Array.from(set)
      .map(n => ({ number: n, name: getSurahMeta(n)?.name || `سورة ${n}` }))
      .sort((a, b) => a.number - b.number);
  }, [summaries]);

  // Filter and sort summaries
  const filteredSummaries = useMemo(() => {
    let list = [...summaries];
    if (surahFilter !== null) {
      list = list.filter(s => s.surahNumber === surahFilter);
    }
    if (sortMode === 'mastery') {
      const levelOrder = { new: 0, practicing: 1, mastered: 2 };
      list.sort((a, b) => {
        const la = getMasteryLevel(a.surahNumber, a.ayahNumber) || 'new';
        const lb = getMasteryLevel(b.surahNumber, b.ayahNumber) || 'new';
        return levelOrder[la] - levelOrder[lb] || b.totalErrors - a.totalErrors;
      });
    }
    return list;
  }, [summaries, surahFilter, sortMode, getMasteryLevel]);

  const errorTypeConfig = [
    { key: 'substitution' as const, label: 'استبدال', color: '#f97316', icon: '~' },
    { key: 'deletion' as const, label: 'حذف', color: '#ef4444', icon: '-' },
    { key: 'addition' as const, label: 'إضافة', color: '#3b82f6', icon: '+' },
    { key: 'order' as const, label: 'ترتيب', color: '#8b5cf6', icon: '#' },
  ];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">تتبع الأخطاء</h1>
        {errors.length > 0 && (
          <button onClick={clearErrors} className="text-sm text-red-500 hover:text-red-700">
            مسح الكل
          </button>
        )}
      </div>

      {errors.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-4xl mb-3">&#x2728;</div>
          <h2 className="text-xl font-bold">لا توجد أخطاء مسجلة</h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            ابدأ بالتسميع لتتبع أخطاءك
          </p>
        </div>
      ) : (
        <>
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--color-emerald-600)' }}>{errors.length}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>إجمالي الأخطاء</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-500)' }}>{summaries.length}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>آيات بها أخطاء</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-red-500">{weakAyahs.length}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>آيات ضعيفة</div>
            </div>
          </div>

          {/* Mastery progress bar */}
          {stats.total > 0 && <MasteryProgressBar stats={stats} />}

          {/* Error trends */}
          <ErrorTrendChart trends={trends} />

          {/* Error type breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {errorTypeConfig.map(({ key, label, color, icon }) => (
              <div key={key} className="card text-center py-3"
                style={{ borderRight: `3px solid ${color}` }}>
                <div className="text-lg font-bold mb-0.5" style={{ fontFamily: 'monospace' }}>{icon}</div>
                <div className="text-xl font-bold" style={{ color }}>{breakdown[key]}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Start drill button */}
          {weakAyahs.length > 0 && (
            <Link href="/errors/drill"
              className="btn-primary w-full py-3 text-center block text-lg font-bold">
              ابدأ التدريب المركّز
            </Link>
          )}

          {/* Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            <select
              value={surahFilter ?? ''}
              onChange={e => setSurahFilter(e.target.value ? Number(e.target.value) : null)}
              className="text-sm rounded-lg px-3 py-1.5 border"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <option value="">كل السور</option>
              {surahOptions.map(s => (
                <option key={s.number} value={s.number}>{s.name}</option>
              ))}
            </select>
            <div className="flex gap-1">
              <button
                onClick={() => setSortMode('errors')}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: sortMode === 'errors' ? 'var(--color-emerald-600)' : 'var(--bg-secondary)',
                  color: sortMode === 'errors' ? 'white' : 'var(--text-primary)',
                }}>
                حسب الأخطاء
              </button>
              <button
                onClick={() => setSortMode('mastery')}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: sortMode === 'mastery' ? 'var(--color-emerald-600)' : 'var(--bg-secondary)',
                  color: sortMode === 'mastery' ? 'white' : 'var(--text-primary)',
                }}>
                حسب الإتقان
              </button>
            </div>
          </div>

          {/* All error summaries */}
          <div className="card">
            <h2 className="text-lg font-bold mb-3">جميع الآيات بأخطاء ({filteredSummaries.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredSummaries.map(a => {
                const surah = getSurahMeta(a.surahNumber);
                const level = getMasteryLevel(a.surahNumber, a.ayahNumber);
                return (
                  <div key={`${a.surahNumber}:${a.ayahNumber}`}
                    className="flex justify-between items-center p-2.5 text-sm rounded-lg"
                    style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <div className="flex items-center gap-2">
                      {level && <MasteryBadge level={level} />}
                      <span>{surah?.name} — آية {a.ayahNumber}</span>
                    </div>
                    <span className={a.totalErrors >= 3 ? 'text-red-500 font-bold' : ''}>
                      {a.totalErrors} أخطاء
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
