'use client';

import { Suspense, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import { useQuranText } from '@/hooks/useQuranText';
import { useErrorLog } from '@/hooks/useErrorLog';
import { useSessionHistory } from '@/hooks/useSessionHistory';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { getDay } from '@/data/plan';
import { compareTexts } from '@/lib/arabic-utils';
import { todayISO } from '@/lib/date-utils';
import { addCertificate } from '@/lib/certificates';
import TestResult from '@/components/testing/TestResult';
import RecordingIndicator from '@/components/testing/RecordingIndicator';
import SelfAssessment from '@/components/testing/SelfAssessment';

type Phase = 'instructions' | 'recording' | 'review' | 'result';

function OralTestContent() {
  const searchParams = useSearchParams();
  const dayParam = searchParams.get('day');
  const { currentDay, markTested } = useProgress();
  const dayNumber = dayParam ? Number(dayParam) : currentDay;
  const day = getDay(dayNumber);

  const { fullText, loading } = useQuranText(
    day?.surahNumber || 1,
    day?.startAyah,
    day?.endAyah
  );

  const { addErrors: logErrors } = useErrorLog();
  const { addSession } = useSessionHistory();
  const recorder = useVoiceRecorder();
  const [phase, setPhase] = useState<Phase>('instructions');
  const [result, setResult] = useState<ReturnType<typeof compareTexts> | null>(null);
  const [editedTranscript, setEditedTranscript] = useState('');
  const startTimeRef = useRef<string>(new Date().toISOString());

  if (!day) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold">لا يوجد مقرر للاختبار</h1>
        <Link href="/test" className="btn-primary mt-4 inline-block">العودة</Link>
      </div>
    );
  }

  const handleStartRecording = () => {
    startTimeRef.current = new Date().toISOString();
    recorder.startRecording();
    setPhase('recording');
  };

  const handleStopRecording = () => {
    recorder.stopRecording();
    setEditedTranscript(recorder.transcript);
    setPhase('review');
  };

  const handleSubmitTranscript = () => {
    if (!fullText) return;

    const textToCompare = editedTranscript.trim() || recorder.transcript.trim();
    const res = compareTexts(fullText, textToCompare);
    setResult(res);
    finalizeResult(res.score, res);
    setPhase('result');
  };

  const handleSelfAssess = (score: number) => {
    if (!fullText) return;

    // Create a simplified result for self-assessment
    const totalWords = fullText.split(/\s+/).filter(w => w.length > 0).length;
    const correctWords = Math.round((score / 100) * totalWords);
    const res = { score, errors: [], totalWords, correctWords };
    setResult(res);
    finalizeResult(score, res);
    setPhase('result');
  };

  const finalizeResult = (score: number, res: { score: number; errors: { wordIndex: number; expected: string; actual: string; type: string }[]; totalWords: number; correctWords: number }) => {
    if (!day) return;

    // Mark as tested
    markTested(dayNumber, score, 'oral');

    // Log errors
    if (res.errors.length > 0) {
      const errorEntries = res.errors.map((err, i) => ({
        id: `${Date.now()}-${i}`,
        sessionId: Date.now().toString(),
        timestamp: todayISO(),
        surahNumber: day.surahNumber,
        ayahNumber: day.startAyah,
        wordIndex: err.wordIndex,
        expected: err.expected,
        actual: err.actual,
        type: err.type as 'substitution' | 'deletion' | 'addition' | 'order',
      }));
      logErrors(errorEntries);
    }

    // Save session
    addSession({
      id: Date.now().toString(),
      type: 'test-oral',
      dayNumbers: [dayNumber],
      startedAt: startTimeRef.current,
      completedAt: new Date().toISOString(),
      duration: recorder.duration,
      score,
      errors: res.errors.map(e => ({
        ayahNumber: day.startAyah,
        surahNumber: day.surahNumber,
        wordIndex: e.wordIndex,
        expected: e.expected,
        actual: e.actual,
        type: e.type as 'substitution' | 'deletion' | 'addition' | 'order',
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
        testType: 'oral',
        errors: res.errors.length,
        date: new Date().toISOString(),
        juz: day.juz,
      });
    }
  };

  const handleRetry = () => {
    recorder.reset();
    setResult(null);
    setEditedTranscript('');
    setPhase('instructions');
  };

  if (loading) {
    return (
      <div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20">
        <p style={{ color: 'var(--text-secondary)' }}>جارٍ التحميل...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">التسميع الشفهي</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          يوم {dayNumber}: {day.surahName} ({day.startAyah}–{day.endAyah})
        </p>
      </div>

      {/* Phase: Instructions */}
      {phase === 'instructions' && (
        <div className="card space-y-4">
          <h2 className="text-lg font-bold">تعليمات التسميع الشفهي</h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>1. اضغط زر "ابدأ التسجيل" ثم اقرأ الآيات من حفظك بصوت واضح</p>
            <p>2. عند الانتهاء اضغط "أوقف التسجيل"</p>
            {recorder.speechSupported ? (
              <p>3. سيتم تحويل كلامك إلى نص تلقائياً ومقارنته بالنص الأصلي</p>
            ) : (
              <p>3. ستقوم بتقييم أدائك ذاتياً بمقارنة تسجيلك بالنص الأصلي</p>
            )}
          </div>

          <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>المقرر:</p>
            <p className="font-bold">{day.surahName} — الآيات {day.startAyah} إلى {day.endAyah}</p>
          </div>

          <button onClick={handleStartRecording} className="btn-primary w-full py-3 text-lg">
            ابدأ التسجيل
          </button>

          {recorder.error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{recorder.error}</div>
          )}
        </div>
      )}

      {/* Phase: Recording */}
      {phase === 'recording' && (
        <div className="card space-y-6 py-8">
          <RecordingIndicator
            duration={recorder.duration}
            interimText={recorder.interimTranscript || recorder.transcript}
          />
          <button onClick={handleStopRecording}
            className="w-full py-3 rounded-lg font-bold text-lg bg-red-500 text-white hover:bg-red-600 transition-colors">
            أوقف التسجيل
          </button>
        </div>
      )}

      {/* Phase: Review */}
      {phase === 'review' && (
        <div className="space-y-4">
          {recorder.speechSupported && recorder.transcript ? (
            <>
              <div className="card space-y-3">
                <h3 className="font-bold">مراجعة النص المحوّل</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  يمكنك تعديل النص قبل المقارنة:
                </p>
                <textarea
                  value={editedTranscript}
                  onChange={e => setEditedTranscript(e.target.value)}
                  className="w-full h-32 p-4 rounded-lg border quran-text text-lg resize-none"
                  style={{ backgroundColor: 'var(--bg-secondary)', direction: 'rtl' }}
                  dir="rtl"
                />

                {recorder.audioUrl && (
                  <div>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>تسجيلك:</p>
                    <audio src={recorder.audioUrl} controls className="w-full" />
                  </div>
                )}
              </div>
              <button onClick={handleSubmitTranscript} className="btn-primary w-full py-3">
                قارن بالنص الأصلي
              </button>
            </>
          ) : (
            <SelfAssessment
              audioUrl={recorder.audioUrl}
              originalText={fullText || ''}
              onAssess={handleSelfAssess}
            />
          )}
        </div>
      )}

      {/* Phase: Result */}
      {phase === 'result' && result && (
        <TestResult
          score={result.score}
          totalWords={result.totalWords}
          correctWords={result.correctWords}
          errors={result.errors}
          onRetry={handleRetry}
          dayNumber={dayNumber}
          surahName={day.surahName}
          surahNumber={day.surahNumber}
          startAyah={day.startAyah}
          endAyah={day.endAyah}
        />
      )}
    </div>
  );
}

export default function OralTestPage() {
  return (
    <Suspense fallback={<div className="p-4 md:p-6 max-w-3xl mx-auto text-center py-20"><p>جارٍ التحميل...</p></div>}>
      <OralTestContent />
    </Suspense>
  );
}
