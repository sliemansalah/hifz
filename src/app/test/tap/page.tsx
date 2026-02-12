'use client';

import { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import { useQuranText } from '@/hooks/useQuranText';
import { useErrorLog } from '@/hooks/useErrorLog';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { getDay } from '@/data/plan';
import { splitWords, removeTashkeel } from '@/lib/arabic-utils';
import { todayISO } from '@/lib/date-utils';
import { addCertificate } from '@/lib/certificates';
import TestResult from '@/components/testing/TestResult';

type WordStatus = 'hidden' | 'correct' | 'error';

interface WordItem {
  text: string;
  status: WordStatus;
  ayahIndex: number;
  userInput?: string; // what the user typed (for error words)
}

function TapTestContent() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get('day');
  const { currentDay, markTested } = useProgress();
  const dayNumber = dayParam ? Number(dayParam) : currentDay;
  const day = getDay(dayNumber);

  const { ayahs, fullText, loading } = useQuranText(
    day?.surahNumber || 1,
    day?.startAyah,
    day?.endAyah
  );

  const { addErrors: logErrors } = useErrorLog();
  const { addSession } = useSessionHistory();
  const [words, setWords] = useState<WordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [editingWordIndex, setEditingWordIndex] = useState<number | null>(null);
  const [editInput, setEditInput] = useState('');
  const startTimeRef = useRef<number>(Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Build word list from ayahs
  useEffect(() => {
    if (!ayahs.length) return;
    const wordList: WordItem[] = [];
    ayahs.forEach((ayah, ayahIdx) => {
      const ayahWords = splitWords(ayah.text);
      ayahWords.forEach(w => {
        wordList.push({ text: w, status: 'hidden', ayahIndex: ayahIdx });
      });
    });
    setWords(wordList);
    setCurrentWordIndex(0);
    setFinished(false);
    setShowResult(false);
    setEditingWordIndex(null);
    startTimeRef.current = Date.now();
  }, [ayahs]);

  // Auto-scroll to current word
  useEffect(() => {
    if (containerRef.current && editingWordIndex === null) {
      const currentEl = containerRef.current.querySelector(`[data-word-index="${currentWordIndex}"]`);
      currentEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [currentWordIndex, editingWordIndex]);

  // Focus edit input when editing
  useEffect(() => {
    if (editingWordIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingWordIndex]);

  const revealWord = useCallback((markAsError: boolean) => {
    if (currentWordIndex >= words.length || finished || editingWordIndex !== null) return;

    setWords(prev => {
      const updated = [...prev];
      updated[currentWordIndex] = {
        ...updated[currentWordIndex],
        status: markAsError ? 'error' : 'correct',
      };
      return updated;
    });

    if (currentWordIndex >= words.length - 1) {
      setFinished(true);
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  }, [currentWordIndex, words.length, finished, editingWordIndex]);

  // Toggle a revealed word between correct/error
  const toggleWordStatus = useCallback((index: number) => {
    if (words[index].status === 'hidden') return;

    setWords(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status: updated[index].status === 'correct' ? 'error' : 'correct',
        userInput: updated[index].status === 'correct' ? updated[index].userInput : undefined,
      };
      return updated;
    });
  }, [words]);

  // Start editing an error word
  const startEditWord = useCallback((index: number) => {
    if (words[index].status !== 'error') return;
    setEditingWordIndex(index);
    setEditInput(words[index].userInput || '');
  }, [words]);

  // Save edit
  const saveEdit = useCallback(() => {
    if (editingWordIndex === null) return;
    setWords(prev => {
      const updated = [...prev];
      updated[editingWordIndex] = {
        ...updated[editingWordIndex],
        userInput: editInput.trim() || undefined,
      };
      return updated;
    });
    setEditingWordIndex(null);
    setEditInput('');
  }, [editingWordIndex, editInput]);

  // Go back one word
  const goBack = useCallback(() => {
    if (currentWordIndex <= 0 || finished || editingWordIndex !== null) return;
    const prevIndex = currentWordIndex - 1;
    setWords(prev => {
      const updated = [...prev];
      updated[prevIndex] = { ...updated[prevIndex], status: 'hidden', userInput: undefined };
      return updated;
    });
    setCurrentWordIndex(prevIndex);
  }, [currentWordIndex, finished, editingWordIndex]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showResult || !words.length || editingWordIndex !== null) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        if (finished) return;
        revealWord(false); // correct
      } else if (e.code === 'KeyX' || e.code === 'Backspace') {
        e.preventDefault();
        if (finished) return;
        if (e.code === 'Backspace' && currentWordIndex > 0 && !finished) {
          goBack();
        } else {
          revealWord(true); // error
        }
      } else if (e.code === 'KeyZ' && e.ctrlKey) {
        e.preventDefault();
        goBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealWord, showResult, words.length, editingWordIndex, goBack, finished, currentWordIndex]);

  const handleFinish = () => {
    if (!day || !fullText) return;

    const errorWords = words.filter(w => w.status === 'error');
    const totalWords = words.length;
    const correctWords = totalWords - errorWords.length;
    const score = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;
    const duration = Math.round((Date.now() - startTimeRef.current) / 1000);

    // Mark tested
    markTested(dayNumber, score, 'tap');

    // Log errors
    if (errorWords.length > 0) {
      const errorEntries = errorWords.map((w, i) => {
        const globalIndex = words.indexOf(w);
        return {
          id: `${Date.now()}-${i}`,
          sessionId: Date.now().toString(),
          timestamp: todayISO(),
          surahNumber: day.surahNumber,
          ayahNumber: day.startAyah + w.ayahIndex,
          wordIndex: globalIndex,
          expected: removeTashkeel(w.text),
          actual: w.userInput || '',
          type: (w.userInput ? 'substitution' : 'deletion') as 'substitution' | 'deletion',
        };
      });
      logErrors(errorEntries);
    }

    // Save session
    addSession({
      id: Date.now().toString(),
      type: 'test-tap',
      dayNumbers: [dayNumber],
      startedAt: new Date(startTimeRef.current).toISOString(),
      completedAt: new Date().toISOString(),
      duration,
      score,
      errors: errorWords.map(w => ({
        ayahNumber: day.startAyah + w.ayahIndex,
        surahNumber: day.surahNumber,
        wordIndex: words.indexOf(w),
        expected: removeTashkeel(w.text),
        actual: w.userInput || '',
        type: (w.userInput ? 'substitution' : 'deletion') as 'substitution' | 'deletion',
      })),
    });

    // Certificate
    if (score >= 80) {
      addCertificate({
        id: Date.now().toString(),
        dayNumber,
        surahName: day.surahName,
        surahNumber: day.surahNumber,
        startAyah: day.startAyah,
        endAyah: day.endAyah,
        score,
        testType: 'tap',
        errors: errorWords.length,
        date: new Date().toISOString(),
        juz: day.juz,
      });
    }

    setShowResult(true);
  };

  const handleRetry = () => {
    setWords(prev => prev.map(w => ({ ...w, status: 'hidden', userInput: undefined })));
    setCurrentWordIndex(0);
    setFinished(false);
    setShowResult(false);
    setEditingWordIndex(null);
    startTimeRef.current = Date.now();
  };

  if (!day) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">لا يوجد مقرر للاختبار</h1>
        <Link href="/test" className="btn-primary mt-4 inline-block">العودة</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <p style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل...</p>
      </div>
    );
  }

  if (showResult) {
    const errorWords = words.filter(w => w.status === 'error');
    const totalWords = words.length;
    const correctWords = totalWords - errorWords.length;
    const score = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;

    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold">التسميع السريع</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            يوم {dayNumber}: {day.surahName} ({day.startAyah}–{day.endAyah})
          </p>
        </div>
        <TestResult
          score={score}
          totalWords={totalWords}
          correctWords={correctWords}
          errors={errorWords.map(w => ({
            wordIndex: words.indexOf(w),
            expected: w.text,
            actual: w.userInput || '',
            type: w.userInput ? 'substitution' : 'deletion',
          }))}
          onRetry={handleRetry}
          dayNumber={dayNumber}
          surahName={day.surahName}
          surahNumber={day.surahNumber}
          startAyah={day.startAyah}
          endAyah={day.endAyah}
        />
      </div>
    );
  }

  const errorCount = words.filter(w => w.status === 'error').length;
  const revealedCount = words.filter(w => w.status !== 'hidden').length;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">التسميع السريع</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {day.surahName} ({day.startAyah}–{day.endAyah})
          </p>
        </div>
        <div className="text-left text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div>{revealedCount}/{words.length} كلمات</div>
          {errorCount > 0 && <div className="text-red-500">{errorCount} أخطاء</div>}
        </div>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${(revealedCount / Math.max(words.length, 1)) * 100}%` }} />
      </div>

      {/* Instructions */}
      <div className="flex gap-1.5 text-[10px] justify-center flex-wrap" style={{ color: 'var(--text-secondary)' }}>
        <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          مسافة = صحيح
        </span>
        <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
          X = خطأ
        </span>
        <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          Ctrl+Z = رجوع
        </span>
        <span className="px-2 py-1 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          اضغط كلمة = تبديل صح/خطأ
        </span>
      </div>

      {/* Edit modal */}
      {editingWordIndex !== null && (
        <div className="card p-3 space-y-2" style={{ borderColor: '#f97316', borderWidth: '2px' }}>
          <p className="text-sm font-bold">ماذا قلت بدلاً من هذه الكلمة؟</p>
          <p className="quran-text text-lg text-center" style={{ color: '#ef4444' }}>
            {words[editingWordIndex].text}
          </p>
          <input
            ref={editInputRef}
            type="text"
            value={editInput}
            onChange={e => setEditInput(e.target.value)}
            className="w-full p-2 rounded-lg border quran-text text-lg text-center"
            style={{ backgroundColor: 'var(--bg-secondary)', direction: 'rtl' }}
            placeholder="اكتب ما قلته..."
            dir="rtl"
            onKeyDown={e => { if (e.key === 'Enter') saveEdit(); }}
          />
          <div className="flex gap-2">
            <button onClick={saveEdit} className="btn-primary flex-1 py-2 text-sm">حفظ</button>
            <button onClick={() => { setEditingWordIndex(null); setEditInput(''); }}
              className="btn-secondary flex-1 py-2 text-sm">إلغاء</button>
          </div>
        </div>
      )}

      {/* Words display */}
      <div ref={containerRef} className="card min-h-[200px] quran-text text-xl leading-[2.5] text-center">
        {words.map((word, i) => {
          const isCurrentWord = i === currentWordIndex && !finished;

          if (word.status === 'hidden') {
            return (
              <span key={i} data-word-index={i}
                className={`inline-block mx-0.5 px-1 rounded transition-all ${
                  isCurrentWord
                    ? 'bg-emerald-100 border-2 border-emerald-400 border-dashed animate-pulse min-w-[40px] min-h-[32px]'
                    : 'min-w-[30px] min-h-[24px]'
                }`}
                style={!isCurrentWord ? { backgroundColor: 'var(--bg-secondary)' } : undefined}
                onClick={() => {
                  if (isCurrentWord) revealWord(false);
                }}>
                {isCurrentWord ? '\u061F' : '\u00A0'}
              </span>
            );
          }

          return (
            <span key={i} data-word-index={i}
              className={`inline-block mx-0.5 px-1 rounded transition-all cursor-pointer ${
                word.status === 'error'
                  ? 'bg-red-100 text-red-600 border border-red-300'
                  : 'hover:bg-emerald-50'
              }`}
              style={word.status === 'correct' ? { color: 'var(--text-primary)' } : undefined}
              onClick={() => toggleWordStatus(i)}
              onDoubleClick={() => {
                if (word.status === 'error') startEditWord(i);
              }}
              title={word.status === 'error' ? 'اضغط مرتين لكتابة ما قلته • اضغط للتبديل' : 'اضغط للتبديل بين صحيح وخطأ'}>
              {word.text}
              {word.status === 'error' && word.userInput && (
                <span className="text-xs block" style={{ color: '#f97316', fontSize: '0.6em' }}>
                  ({word.userInput})
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Action buttons */}
      {!finished ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => revealWord(false)}
              disabled={editingWordIndex !== null}
              className="py-4 rounded-xl text-lg font-bold transition-all active:scale-95 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-emerald-600)', color: 'white' }}>
              صحيح
            </button>
            <button
              onClick={() => revealWord(true)}
              disabled={editingWordIndex !== null}
              className="py-4 rounded-xl text-lg font-bold transition-all active:scale-95 bg-red-500 text-white disabled:opacity-50">
              خطأ
            </button>
          </div>
          {currentWordIndex > 0 && (
            <button onClick={goBack}
              disabled={editingWordIndex !== null}
              className="w-full py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
              style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
              رجوع كلمة
            </button>
          )}
        </div>
      ) : (
        <button onClick={handleFinish}
          className="btn-primary w-full py-4 text-lg font-bold">
          عرض النتيجة
        </button>
      )}
    </div>
  );
}

export default function TapTestPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20"><p>جارٍ التحميل...</p></div>}>
      <TapTestContent />
    </Suspense>
  );
}
