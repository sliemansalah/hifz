'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingState = 'idle' | 'recording' | 'stopped' | 'transcribing';

interface VoiceRecorderResult {
  state: RecordingState;
  transcript: string;
  interimTranscript: string;
  audioUrl: string | null;
  duration: number;
  speechSupported: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  reset: () => void;
  setTranscript: (text: string) => void;
  error: string | null;
}

export function useVoiceRecorder(): VoiceRecorderResult {
  const [state, setState] = useState<RecordingState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const speechSupported = typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);

    // Clean up previous audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Start MediaRecorder
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      };

      recorder.start();
      setState('recording');

      // Start timer
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - start) / 1000));
      }, 1000);

      // Start Speech Recognition if supported
      if (speechSupported) {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
          const recognition = new SpeechRecognitionAPI();
          recognitionRef.current = recognition;
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'ar-SA';

          let finalTranscript = '';

          recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i];
              if (result.isFinal) {
                finalTranscript += result[0].transcript + ' ';
              } else {
                interim += result[0].transcript;
              }
            }
            setTranscript(finalTranscript.trim());
            setInterimTranscript(interim);
          };

          recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            if (event.error !== 'no-speech' && event.error !== 'aborted') {
              setError(`خطأ في التعرف على الكلام: ${event.error}`);
            }
          };

          recognition.onend = () => {
            // If still recording, restart recognition
            if (mediaRecorderRef.current?.state === 'recording') {
              try { recognition.start(); } catch {}
            }
          };

          recognition.start();
        }
      }
    } catch (err) {
      setError('لم يتم السماح بالوصول إلى الميكروفون');
      setState('idle');
    }
  }, [audioUrl, speechSupported]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    setState('stopped');
  }, []);

  const reset = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);
    setError(null);
    setState('idle');
  }, [audioUrl]);

  return {
    state,
    transcript,
    interimTranscript,
    audioUrl,
    duration,
    speechSupported,
    startRecording,
    stopRecording,
    reset,
    setTranscript,
    error,
  };
}
