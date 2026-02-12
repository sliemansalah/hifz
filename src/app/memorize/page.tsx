'use client';

import { useState, useCallback } from 'react';
import { useProgress } from '@/hooks/useProgress';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useSettings } from '@/hooks/useSettings';
import { getDay, TOTAL_DAYS } from '@/data/plan';
import { useQuranText as useQuranTextHook } from '@/hooks/useQuranText';
import AyahRange from '@/components/quran/AyahRange';
import RepetitionCounter from '@/components/memorization/RepetitionCounter';
import SessionTimer from '@/components/memorization/SessionTimer';
import Link from 'next/link';

type ViewMode = 'full' | 'first-letters' | 'hidden';

function FirstLettersView({ text }: { text: string }) {
  const words = text.split(/\s+/);
  return (
    <div className="quran-text text-center leading-loose p-4 islamic-border">
      {words.map((w, i) => (
        <span key={i} className="inline-block mx-1">
          <span style={{ color: 'var(--color-emerald-600)' }}>{w[0]}</span>
          <span style={{ color: 'transparent', userSelect: 'none' }}>{w.slice(1)}</span>
          {' '}
        </span>
      ))}
    </div>
  );
}

function ProgressiveReveal({ text }: { text: string }) {
  const sentences = text.split(/(?<=[\u06D6-\u06ED])\s+|(?<=\d)\s+/).filter(Boolean);
  const ayahs = text.split(/\s*(\S+\s*[\u06D6-\u06ED]?)\s*/).filter(Boolean);
  // Split by rough sentence groups (every ~10 words)
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 8) {
    chunks.push(words.slice(i, i + 8).join(' '));
  }

  const [revealed, setRevealed] = useState(0);

  return (
    <div className="space-y-3">
      <div className="quran-text text-center leading-loose p-4 islamic-border">
        {chunks.map((chunk, i) => (
          <span key={i} className={`inline ${i <= revealed ? '' : 'invisible'}`}>
            {chunk}{' '}
          </span>
        ))}
      </div>
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setRevealed(r => Math.max(0, r - 1))}
          disabled={revealed <= 0}
          className="btn-secondary text-sm disabled:opacity-30">
          إخفاء
        </button>
        <span className="text-sm self-center" style={{ color: 'var(--text-secondary)' }}>
          {Math.min(revealed + 1, chunks.length)} / {chunks.length}
        </span>
        <button
          onClick={() => setRevealed(r => Math.min(chunks.length - 1, r + 1))}
          disabled={revealed >= chunks.length - 1}
          className="btn-primary text-sm disabled:opacity-30">
          كشف التالي
        </button>
      </div>
    </div>
  );
}

export default function MemorizePage() {
  const { currentDay, markMemorized, isDayMemorized, isDayTested, isDayCompleted } = useProgress();
  const { addSession } = useSessionHistory();
  const { settings } = useSettings();

  const [selectedDays, setSelectedDays] = useState<number[]>([currentDay]);
  const [repetitions, setRepetitions] = useState(0);
  const [sessionTime, setSessionTime] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [multiMode, setMultiMode] = useState(false);
  const [rangeEnd, setRangeEnd] = useState(currentDay);
  const [viewMode, setViewMode] = useState<ViewMode>('full');

  const activeDayIndex = selectedDays.findIndex(d => !isDayMemorized(d));
  const activeDayNum = activeDayIndex >= 0 ? selectedDays[activeDayIndex] : selectedDays[0];
  const activeDay = getDay(activeDayNum);

  const handleComplete = () => {
    for (const dn of selectedDays) {
      if (!isDayMemorized(dn)) {
        markMemorized(dn, repetitions);
      }
    }

    addSession({
      id: Date.now().toString(),
      type: 'memorize',
      dayNumbers: selectedDays,
      startedAt: new Date(Date.now() - sessionTime * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      duration: sessionTime,
      repetitions,
      errors: [],
    });

    setShowComplete(true);
  };

  const handleTimeUpdate = useCallback((s: number) => setSessionTime(s), []);

  const toggleMultiMode = () => {
    setMultiMode(!multiMode);
    if (!multiMode) {
      setRangeEnd(Math.min(currentDay + 3, TOTAL_DAYS));
    } else {
      setSelectedDays([currentDay]);
    }
  };

  const applyRange = () => {
    const days: number[] = [];
    for (let d = currentDay; d <= Math.min(rangeEnd, TOTAL_DAYS); d++) {
      if (getDay(d)) days.push(d);
    }
    if (days.length > 0) setSelectedDays(days);
  };

  if (showComplete) {
    const needsTest = selectedDays.some(d => !isDayTested(d));
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-3xl font-bold mb-2">أحسنت! أتممت الحفظ</h1>
        <p className="text-lg mb-2" style={{ color: 'var(--text-secondary)' }}>
          {repetitions} تكرارات في {Math.floor(sessionTime / 60)} دقيقة
        </p>

        {needsTest && (
          <div className="card mt-6 text-right">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">📝</span>
              <div>
                <h3 className="font-bold">الخطوة التالية: التسميع</h3>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  اختبر حفظك لتثبيته. نجاحك بنسبة 80% أو أكثر يُكمل اليوم.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/test/written?day=${selectedDays[0]}`} className="btn-accent flex-1 text-center">
                تسميع كتابي
              </Link>
              <Link href={`/test/word-hide?day=${selectedDays[0]}`} className="btn-accent flex-1 text-center">
                إخفاء كلمات
              </Link>
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <button onClick={() => { setShowComplete(false); setRepetitions(0); setSelectedDays([currentDay]); }}
            className="btn-primary">حفظ المزيد</button>
          <Link href="/" className="btn-secondary">الرئيسية</Link>
        </div>
      </div>
    );
  }

  if (!activeDay) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <div className="text-6xl mb-4">📖</div>
        <h1 className="text-2xl font-bold">لا يوجد مهمة حالية</h1>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">جلسة الحفظ</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {selectedDays.length > 1 ? `أيام ${selectedDays[0]}–${selectedDays[selectedDays.length - 1]}` : `يوم ${activeDayNum}`}:
            {' '}{activeDay.surahName} ({activeDay.startAyah}–{activeDay.endAyah})
          </p>
        </div>
        <SessionTimer onTimeUpdate={handleTimeUpdate} />
      </div>

      {/* Day status badges */}
      <div className="flex gap-2 text-xs">
        <span className={`px-2 py-1 rounded-full ${isDayMemorized(activeDayNum) ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
          {isDayMemorized(activeDayNum) ? 'تم الحفظ' : 'لم يُحفظ بعد'}
        </span>
        <span className={`px-2 py-1 rounded-full ${isDayTested(activeDayNum) ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
          {isDayTested(activeDayNum) ? 'تم التسميع' : 'لم يُسمّع بعد'}
        </span>
      </div>

      {/* Multi-day toggle */}
      <div className="card">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">إنجاز عدة أيام</label>
          <button onClick={toggleMultiMode}
            className={`px-3 py-1 rounded-full text-xs font-medium ${multiMode ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
            {multiMode ? 'مفعّل' : 'مغلق'}
          </button>
        </div>
        {multiMode && (
          <div className="mt-3 flex items-center gap-3">
            <span className="text-sm">من يوم {currentDay} إلى يوم</span>
            <input type="number" value={rangeEnd} min={currentDay} max={Math.min(currentDay + 10, TOTAL_DAYS)}
              onChange={e => setRangeEnd(Number(e.target.value))}
              className="w-20 px-2 py-1 rounded border text-center" style={{ backgroundColor: 'var(--bg-secondary)' }} />
            <button onClick={applyRange} className="btn-primary text-xs px-3 py-1">تطبيق</button>
          </div>
        )}
      </div>

      {/* Day tabs if multi */}
      {selectedDays.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {selectedDays.map(dn => (
            <button key={dn}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${
                dn === activeDayNum ? 'bg-emerald-600 text-white' :
                isDayCompleted(dn) ? 'bg-emerald-100 text-emerald-700' :
                isDayMemorized(dn) ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-600'
              }`}>
              يوم {dn} {isDayCompleted(dn) ? '✓' : isDayMemorized(dn) ? '📖' : ''}
            </button>
          ))}
        </div>
      )}

      {/* View mode toggle */}
      <div className="flex gap-2 justify-center">
        {([
          { mode: 'full' as ViewMode, label: 'النص كاملا' },
          { mode: 'first-letters' as ViewMode, label: 'الحروف الأولى' },
          { mode: 'hidden' as ViewMode, label: 'كشف تدريجي' },
        ]).map(({ mode, label }) => (
          <button key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              viewMode === mode ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {/* Quran text in selected view mode */}
      {viewMode === 'full' && (
        <AyahRange
          surahNumber={activeDay.surahNumber}
          startAyah={activeDay.startAyah}
          endAyah={activeDay.endAyah}
          surahName={activeDay.surahName}
        />
      )}
      {viewMode === 'first-letters' && (
        <FirstLettersDisplay surahNumber={activeDay.surahNumber} startAyah={activeDay.startAyah} endAyah={activeDay.endAyah} />
      )}
      {viewMode === 'hidden' && (
        <ProgressiveRevealDisplay surahNumber={activeDay.surahNumber} startAyah={activeDay.startAyah} endAyah={activeDay.endAyah} />
      )}

      {/* Repetition counter */}
      <RepetitionCounter
        count={repetitions}
        goal={settings.dailyGoalRepetitions}
        onIncrement={() => setRepetitions(r => r + 1)}
        onReset={() => setRepetitions(0)}
      />

      {/* Complete button */}
      <button onClick={handleComplete}
        className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
          repetitions >= settings.dailyGoalRepetitions ? 'btn-primary' : 'btn-secondary'
        }`}>
        {repetitions >= settings.dailyGoalRepetitions
          ? 'إتمام الحفظ — انتقل للتسميع'
          : `أكمل ${settings.dailyGoalRepetitions - repetitions} تكرارات أخرى`}
      </button>
    </div>
  );
}

// Wrapper components that use the hook
function FirstLettersDisplay({ surahNumber, startAyah, endAyah }: { surahNumber: number; startAyah: number; endAyah: number }) {
  const { fullText, loading } = useQuranTextHook(surahNumber, startAyah, endAyah);
  if (loading) return <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل...</div>;
  return <FirstLettersView text={fullText} />;
}

function ProgressiveRevealDisplay({ surahNumber, startAyah, endAyah }: { surahNumber: number; startAyah: number; endAyah: number }) {
  const { fullText, loading } = useQuranTextHook(surahNumber, startAyah, endAyah);
  if (loading) return <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل...</div>;
  return <ProgressiveReveal text={fullText} />;
}
