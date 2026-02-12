'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { getWeakestForDrill, recordDrillResult } from '@/lib/mastery-engine';
import { AyahMastery, MasteryLevel } from '@/types/mastery';
import { useQuranText } from '@/hooks/useQuranText';
import { compareTexts } from '@/lib/arabic-utils';
import { getSurahMeta } from '@/data/surah-meta';
import MasteryBadge from '@/components/errors/MasteryBadge';

interface DrillItem {
  mastery: AyahMastery;
  surahName: string;
}

function AyahDrill({ item, onComplete }: {
  item: DrillItem;
  onComplete: (score: number, errors: number, levelChange: { previousLevel: MasteryLevel; newLevel: MasteryLevel }) => void;
}) {
  const { ayahs, loading } = useQuranText(item.mastery.surahNumber, item.mastery.ayahNumber, item.mastery.ayahNumber);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof compareTexts> | null>(null);

  const originalText = ayahs[0]?.text || '';

  const handleCheck = () => {
    if (!input.trim() || !originalText) return;
    const res = compareTexts(originalText, input);
    setResult(res);

    const levelChange = recordDrillResult(
      item.mastery.surahNumber,
      item.mastery.ayahNumber,
      res.score,
      res.errors.length
    );
    onComplete(res.score, res.errors.length, levelChange);
  };

  if (loading) {
    return <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-bold">{item.surahName}</span>
          <span className="text-sm mr-2" style={{ color: 'var(--text-secondary)' }}>آية {item.mastery.ayahNumber}</span>
        </div>
        <MasteryBadge level={item.mastery.level} />
      </div>

      {!result ? (
        <>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            className="w-full h-32 p-4 rounded-lg border quran-text text-lg resize-none"
            style={{ backgroundColor: 'var(--bg-secondary)', direction: 'rtl' }}
            placeholder="اكتب الآية من حفظك..."
            dir="rtl"
            autoFocus
          />
          <button onClick={handleCheck}
            disabled={!input.trim()}
            className="btn-primary w-full py-3 disabled:opacity-50">
            تحقق
          </button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="text-center py-4">
            <div className="text-4xl font-bold mb-1" style={{
              color: result.score >= 90 ? 'var(--color-emerald-600)' :
                     result.score >= 70 ? 'var(--color-gold-500)' : '#ef4444'
            }}>
              {result.score}%
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {result.correctWords} من {result.totalWords} كلمات
            </p>
          </div>

          {/* Show original text */}
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p className="text-xs mb-1 font-medium" style={{ color: 'var(--text-secondary)' }}>النص الصحيح:</p>
            <p className="quran-text text-lg leading-loose">{originalText}</p>
          </div>

          {result.errors.length > 0 && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(239,68,68,0.05)' }}>
              <p className="text-xs font-medium mb-2 text-red-500">الأخطاء:</p>
              <div className="space-y-1">
                {result.errors.map((err, i) => (
                  <div key={i} className="text-sm flex gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium"
                      style={{
                        backgroundColor: err.type === 'deletion' ? 'rgba(239,68,68,0.1)' :
                                        err.type === 'addition' ? 'rgba(59,130,246,0.1)' : 'rgba(217,119,6,0.1)',
                        color: err.type === 'deletion' ? '#ef4444' :
                               err.type === 'addition' ? '#3b82f6' : '#d97706',
                      }}>
                      {err.type === 'deletion' ? 'حذف' : err.type === 'addition' ? 'إضافة' : 'استبدال'}
                    </span>
                    <span className="quran-text">
                      {err.expected && <span style={{ color: 'var(--color-emerald-600)' }}>{err.expected}</span>}
                      {err.actual && <span className="mr-1" style={{ color: '#ef4444', textDecoration: 'line-through' }}>{err.actual}</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DrillPage() {
  const [drillItems, setDrillItems] = useState<DrillItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<{ score: number; errors: number; levelChange: { previousLevel: MasteryLevel; newLevel: MasteryLevel } }[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const weakest = getWeakestForDrill(5);
    const items: DrillItem[] = weakest.map(m => ({
      mastery: m,
      surahName: getSurahMeta(m.surahNumber)?.name || `سورة ${m.surahNumber}`,
    }));
    setDrillItems(items);
  }, []);

  const handleComplete = (score: number, errors: number, levelChange: { previousLevel: MasteryLevel; newLevel: MasteryLevel }) => {
    setResults(prev => [...prev, { score, errors, levelChange }]);
  };

  const handleNext = () => {
    if (currentIndex < drillItems.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const avgScore = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0;

  const levelLabels: Record<MasteryLevel, string> = { new: 'جديد', practicing: 'يتدرب', mastered: 'متقن' };

  if (drillItems.length === 0) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <div className="text-4xl mb-3">&#x2728;</div>
        <h1 className="text-2xl font-bold">لا توجد آيات للتدريب</h1>
        <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>جميع آياتك في حالة جيدة!</p>
        <Link href="/errors" className="btn-primary mt-4 inline-block">العودة</Link>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">&#x1F3AF;</div>
          <h1 className="text-2xl font-bold">انتهى التدريب!</h1>
          <div className="text-4xl font-bold mt-3" style={{
            color: avgScore >= 90 ? 'var(--color-emerald-600)' :
                   avgScore >= 70 ? 'var(--color-gold-500)' : '#ef4444'
          }}>
            {avgScore}%
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>متوسط النتيجة</p>
        </div>

        <div className="card">
          <h3 className="font-bold mb-3">تفاصيل النتائج</h3>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg"
                style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <div className="text-sm">
                  <span className="font-medium">{drillItems[i]?.surahName}</span>
                  <span className="mr-2" style={{ color: 'var(--text-secondary)' }}>
                    آية {drillItems[i]?.mastery.ayahNumber}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {r.levelChange.previousLevel !== r.levelChange.newLevel && (
                    <span className="text-xs" style={{ color: 'var(--color-emerald-600)' }}>
                      {levelLabels[r.levelChange.previousLevel]} ← {levelLabels[r.levelChange.newLevel]}
                    </span>
                  )}
                  <span className="font-bold" style={{
                    color: r.score >= 90 ? 'var(--color-emerald-600)' :
                           r.score >= 70 ? 'var(--color-gold-500)' : '#ef4444'
                  }}>
                    {r.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <Link href="/errors" className="btn-secondary flex-1 text-center">تتبع الأخطاء</Link>
          <Link href="/test" className="btn-primary flex-1 text-center">التسميع</Link>
        </div>
      </div>
    );
  }

  const currentItem = drillItems[currentIndex];

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">تدريب الأخطاء</h1>
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {currentIndex + 1} / {drillItems.length}
        </span>
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${((currentIndex + (results.length > currentIndex ? 1 : 0)) / drillItems.length) * 100}%` }} />
      </div>

      <div className="card">
        <AyahDrill
          key={`${currentItem.mastery.surahNumber}:${currentItem.mastery.ayahNumber}`}
          item={currentItem}
          onComplete={handleComplete}
        />
      </div>

      {results.length > currentIndex && (
        <button onClick={handleNext} className="btn-primary w-full py-3">
          {currentIndex < drillItems.length - 1 ? 'التالي' : 'عرض النتائج'}
        </button>
      )}
    </div>
  );
}
