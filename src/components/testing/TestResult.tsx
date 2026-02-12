'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Certificate from './Certificate';
import Confetti from '@/components/ui/Confetti';
import { getAyahErrorSummaries } from '@/lib/error-tracker';

interface TestResultProps {
  score: number;
  totalWords: number;
  correctWords: number;
  errors: { expected: string; actual: string; type: string; wordIndex: number }[];
  onRetry: () => void;
  dayNumber?: number;
  surahName?: string;
  startAyah?: number;
  endAyah?: number;
  surahNumber?: number;
  originalWords?: string[];
}

const ERROR_TYPE_LABELS: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  substitution: { label: 'استبدال', color: '#d97706', bg: 'rgba(217,119,6,0.1)', icon: '🔄' },
  deletion: { label: 'حذف', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '❌' },
  addition: { label: 'إضافة', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: '➕' },
  order: { label: 'ترتيب', color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', icon: '🔀' },
};

export default function TestResult({
  score, totalWords, correctWords, errors, onRetry,
  dayNumber, surahName, startAyah, endAyah, surahNumber,
  originalWords,
}: TestResultProps) {
  const [showCert, setShowCert] = useState(score >= 80 && !!dayNumber);
  const [expandedError, setExpandedError] = useState<number | null>(null);

  // Group errors by type
  const errorsByType = useMemo(() => {
    const groups: Record<string, typeof errors> = {};
    for (const err of errors) {
      if (!groups[err.type]) groups[err.type] = [];
      groups[err.type].push(err);
    }
    return groups;
  }, [errors]);

  // Get historical errors for this ayah
  const historicalErrors = useMemo(() => {
    if (!surahNumber || !startAyah) return [];
    return getAyahErrorSummaries().filter(
      s => s.surahNumber === surahNumber && s.ayahNumber === startAyah
    );
  }, [surahNumber, startAyah]);

  const previousErrorCount = historicalErrors.reduce((sum, h) => sum + h.totalErrors, 0);

  const getScoreColor = () => {
    if (score >= 90) return 'var(--color-emerald-600)';
    if (score >= 70) return 'var(--color-gold-500)';
    return '#ef4444';
  };

  const getScoreMessage = () => {
    if (score === 100) return 'ما شاء الله! حفظ متقن — إتقان كامل';
    if (score >= 95) return 'ما شاء الله! حفظ متقن';
    if (score >= 85) return 'أحسنت! حفظ جيد جداً';
    if (score >= 70) return 'جيد، يحتاج مزيد من المراجعة';
    if (score >= 50) return 'لا بأس، كرر الحفظ وحاول مجدداً';
    return 'يحتاج إعادة حفظ وتكرار أكثر';
  };

  return (
    <div className="space-y-4">
      <Confetti active={score >= 80} />
      {showCert && dayNumber && surahName && startAyah !== undefined && endAyah !== undefined && (
        <Certificate
          dayNumber={dayNumber}
          surahName={surahName}
          startAyah={startAyah}
          endAyah={endAyah}
          score={score}
          date={new Date().toISOString()}
          onClose={() => setShowCert(false)}
        />
      )}

      {/* Score display with circular ring */}
      <div className="text-center py-6">
        <div className="relative inline-block mb-3">
          <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={getScoreColor()} strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 2 * Math.PI * 52} ${2 * Math.PI * 52}`}
              style={{ transition: 'stroke-dasharray 1s ease-out' }} />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold" style={{ color: getScoreColor() }}>{score}%</span>
          </div>
        </div>
        <p className="text-lg font-medium">{getScoreMessage()}</p>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {correctWords} من {totalWords} كلمات صحيحة
        </p>
        {score >= 80 && (
          <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
            تم اجتياز الاختبار
          </div>
        )}
        {score < 80 && (
          <div className="mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600">
            لم يتم الاجتياز — يحتاج 80% أو أكثر
          </div>
        )}
      </div>

      {/* Error type summary */}
      {errors.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.entries(errorsByType).map(([type, errs]) => {
            const info = ERROR_TYPE_LABELS[type] || ERROR_TYPE_LABELS.substitution;
            return (
              <div key={type} className="card text-center py-3" style={{ borderColor: info.color, borderWidth: '1px' }}>
                <div className="text-lg">{info.icon}</div>
                <div className="text-xl font-bold" style={{ color: info.color }}>{errs.length}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{info.label}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Previous error indicator */}
      {previousErrorCount > 0 && (
        <div className="card" style={{ borderColor: '#f97316', borderWidth: '1px' }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h4 className="font-bold text-sm">أخطاء سابقة في هذا المقطع</h4>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                لديك {previousErrorCount} أخطاء مسجلة سابقاً في هذه الآيات. ركّز على الكلمات التي تخطئ فيها.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed error list */}
      {errors.length > 0 && (
        <div className="card">
          <h3 className="font-bold mb-3">تفاصيل الأخطاء ({errors.length})</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {errors.map((err, i) => {
              const info = ERROR_TYPE_LABELS[err.type] || ERROR_TYPE_LABELS.substitution;
              const isExpanded = expandedError === i;
              return (
                <button key={i}
                  onClick={() => setExpandedError(isExpanded ? null : i)}
                  className="w-full text-right p-3 rounded-lg transition-all"
                  style={{ backgroundColor: info.bg }}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg shrink-0">{info.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-0.5 rounded font-bold"
                          style={{ backgroundColor: info.bg, color: info.color, border: `1px solid ${info.color}` }}>
                          {info.label}
                        </span>
                        {err.type === 'deletion' && (
                          <span className="quran-text">
                            {/* Show surrounding context for deletion */}
                            {originalWords && err.wordIndex > 0 && (
                              <span style={{ color: 'var(--text-secondary)' }}>{originalWords[err.wordIndex - 1]} </span>
                            )}
                            <span className="font-bold" style={{ color: info.color }}>[{err.expected}]</span>
                            {originalWords && err.wordIndex < originalWords.length - 1 && (
                              <span style={{ color: 'var(--text-secondary)' }}> {originalWords[err.wordIndex + 1]}</span>
                            )}
                          </span>
                        )}
                        {err.type === 'addition' && (
                          <span className="quran-text" style={{ color: info.color, textDecoration: 'line-through' }}>
                            {err.actual}
                          </span>
                        )}
                        {err.type === 'substitution' && (
                          <span className="quran-text">
                            <span style={{ color: '#ef4444', textDecoration: 'line-through' }}>{err.actual}</span>
                            <span className="mx-1">←</span>
                            <span style={{ color: 'var(--color-emerald-600)' }} className="font-bold">{err.expected}</span>
                          </span>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="mt-2 text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                          {err.expected && <p>الكلمة الصحيحة: <span className="quran-text font-bold" style={{ color: 'var(--text-primary)' }}>{err.expected}</span></p>}
                          {err.actual && <p>ما كتبته: <span className="quran-text" style={{ color: '#ef4444' }}>{err.actual}</span></p>}
                          <p>
                            {err.type === 'deletion' ? 'هذه الكلمة محذوفة — نسيت كتابتها' :
                             err.type === 'addition' ? 'هذه الكلمة زائدة — ليست في النص الأصلي' :
                             err.type === 'substitution' ? 'كتبت كلمة مختلفة عن الأصلية' :
                             'ترتيب الكلمات غير صحيح'}
                          </p>
                        </div>
                      )}
                    </div>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={onRetry} className="btn-primary flex-1">إعادة الاختبار</button>
        {dayNumber && (
          <Link href={`/certificates`} className="btn-accent flex-1 text-center">شهاداتي</Link>
        )}
        <Link href="/test" className="btn-secondary flex-1 text-center">اختبار آخر</Link>
      </div>
    </div>
  );
}
