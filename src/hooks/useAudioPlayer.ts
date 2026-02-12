'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { surahMeta } from '@/data/surah-meta';

// EveryAyah.com CDN — per-ayah audio, format: {folder}/{SSSAAA}.mp3
const AUDIO_BASE = 'https://everyayah.com/data/Yasser_Ad-Dussary_128kbps';

// Build cumulative ayah count for absolute→surah:ayah conversion
const surahStartAbsolute: number[] = [];
{
  let cumulative = 0;
  for (const s of surahMeta) {
    surahStartAbsolute.push(cumulative);
    cumulative += s.ayahCount;
  }
}

// Convert absolute ayah number (1-6236) to "SSSAAA" format
function absoluteToSSSAAA(absolute: number): string {
  for (let i = surahMeta.length - 1; i >= 0; i--) {
    if (absolute > surahStartAbsolute[i]) {
      const surah = i + 1;
      const ayah = absolute - surahStartAbsolute[i];
      return String(surah).padStart(3, '0') + String(ayah).padStart(3, '0');
      }
  }
  return '001001';
}

export type RepeatMode = 'off' | 'ayah' | 'range';
export type RepeatCount = 1 | 3 | 5 | 10 | 0; // 0 = infinite

export interface AudioConfig {
  repeatMode: RepeatMode;
  repeatCount: RepeatCount;
  playbackSpeed: number;
  autoPauseSeconds: number;
}

export interface AudioPlayerState {
  playing: boolean;
  currentAyah: number | null; // absolute ayah number
  loading: boolean;
  progress: number; // 0-100
  duration: number;
  currentTime: number;
  config: AudioConfig;
  currentRepeat: number; // current repeat iteration (1-based)
  error: string | null;
}

const DEFAULT_CONFIG: AudioConfig = {
  repeatMode: 'off',
  repeatCount: 1,
  playbackSpeed: 1,
  autoPauseSeconds: 0,
};

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    playing: false,
    currentAyah: null,
    loading: false,
    progress: 0,
    duration: 0,
    currentTime: 0,
    config: DEFAULT_CONFIG,
    currentRepeat: 1,
    error: null,
  });
  const playlistRef = useRef<number[]>([]);
  const playlistIndexRef = useRef(0);
  const repeatCounterRef = useRef(1);
  const configRef = useRef<AudioConfig>(DEFAULT_CONFIG);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep configRef in sync
  useEffect(() => {
    configRef.current = state.config;
  }, [state.config]);

  const retryCountRef = useRef(0);
  const MAX_RETRIES = 2;

  const playAyah = useCallback((absoluteAyahNumber: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    retryCountRef.current = 0;
    audio.src = `${AUDIO_BASE}/${absoluteToSSSAAA(absoluteAyahNumber)}.mp3`;
    audio.playbackRate = configRef.current.playbackSpeed;
    audio.play().catch(() => {});
    setState(s => ({ ...s, playing: true, currentAyah: absoluteAyahNumber, progress: 0, error: null }));
  }, []);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      setState(s => ({ ...s, progress, currentTime: audio.currentTime, duration: audio.duration || 0 }));
    });

    audio.addEventListener('ended', () => {
      const config = configRef.current;
      const playlist = playlistRef.current;
      const currentIndex = playlistIndexRef.current;
      const currentRepeat = repeatCounterRef.current;

      // Determine target repeat count
      const maxRepeats = config.repeatCount === 0 ? Infinity : config.repeatCount;

      if (config.repeatMode === 'ayah' && currentRepeat < maxRepeats) {
        // Repeat same ayah
        repeatCounterRef.current++;
        setState(s => ({ ...s, currentRepeat: repeatCounterRef.current }));
        const delay = config.autoPauseSeconds * 1000;
        if (delay > 0) {
          setState(s => ({ ...s, playing: false }));
          pauseTimerRef.current = setTimeout(() => {
            playAyah(playlist[currentIndex]);
          }, delay);
        } else {
          playAyah(playlist[currentIndex]);
        }
        return;
      }

      // Move to next ayah
      const nextIndex = currentIndex + 1;
      if (nextIndex < playlist.length) {
        playlistIndexRef.current = nextIndex;
        repeatCounterRef.current = 1;
        setState(s => ({ ...s, currentRepeat: 1 }));
        const delay = config.autoPauseSeconds * 1000;
        if (delay > 0) {
          setState(s => ({ ...s, playing: false }));
          pauseTimerRef.current = setTimeout(() => {
            playAyah(playlist[nextIndex]);
          }, delay);
        } else {
          playAyah(playlist[nextIndex]);
        }
      } else if (config.repeatMode === 'range' && currentRepeat < maxRepeats) {
        // Repeat entire range
        repeatCounterRef.current++;
        setState(s => ({ ...s, currentRepeat: repeatCounterRef.current }));
        playlistIndexRef.current = 0;
        const delay = config.autoPauseSeconds * 1000;
        if (delay > 0) {
          setState(s => ({ ...s, playing: false }));
          pauseTimerRef.current = setTimeout(() => {
            playAyah(playlist[0]);
          }, delay);
        } else {
          playAyah(playlist[0]);
        }
      } else {
        // Done
        setState(s => ({ ...s, playing: false, currentAyah: null, progress: 0 }));
        repeatCounterRef.current = 1;
        setState(s => ({ ...s, currentRepeat: 1 }));
      }
    });

    audio.addEventListener('loadstart', () => {
      setState(s => ({ ...s, loading: true }));
    });

    audio.addEventListener('canplay', () => {
      setState(s => ({ ...s, loading: false }));
    });

    audio.addEventListener('error', () => {
      const currentAyahNum = playlistRef.current[playlistIndexRef.current];
      if (retryCountRef.current < MAX_RETRIES && currentAyahNum) {
        retryCountRef.current++;
        // Retry after a short delay
        setTimeout(() => {
          audio.src = `${AUDIO_BASE}/${absoluteToSSSAAA(currentAyahNum)}.mp3`;
          audio.play().catch(() => {});
        }, 1000);
      } else {
        setState(s => ({ ...s, loading: false, playing: false, error: 'فشل تحميل الصوت' }));
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, [playAyah]);

  const playRange = useCallback((absoluteAyahNumbers: number[]) => {
    if (absoluteAyahNumbers.length === 0) return;
    playlistRef.current = absoluteAyahNumbers;
    playlistIndexRef.current = 0;
    repeatCounterRef.current = 1;
    setState(s => ({ ...s, currentRepeat: 1 }));
    playAyah(absoluteAyahNumbers[0]);
  }, [playAyah]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    setState(s => ({ ...s, playing: false }));
  }, []);

  const resume = useCallback(() => {
    audioRef.current?.play().catch(() => {});
    setState(s => ({ ...s, playing: true }));
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = '';
    }
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    playlistRef.current = [];
    playlistIndexRef.current = 0;
    repeatCounterRef.current = 1;
    setState(s => ({
      ...s,
      playing: false, currentAyah: null, loading: false, progress: 0,
      duration: 0, currentTime: 0, currentRepeat: 1,
    }));
  }, []);

  const togglePlayPause = useCallback(() => {
    if (state.playing) {
      pause();
    } else if (state.currentAyah) {
      resume();
    }
  }, [state.playing, state.currentAyah, pause, resume]);

  const skipNext = useCallback(() => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    repeatCounterRef.current = 1;
    setState(s => ({ ...s, currentRepeat: 1 }));
    playlistIndexRef.current++;
    if (playlistIndexRef.current < playlistRef.current.length) {
      playAyah(playlistRef.current[playlistIndexRef.current]);
    } else {
      stop();
    }
  }, [playAyah, stop]);

  const skipPrev = useCallback(() => {
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    repeatCounterRef.current = 1;
    setState(s => ({ ...s, currentRepeat: 1 }));
    if (playlistIndexRef.current > 0) {
      playlistIndexRef.current--;
      playAyah(playlistRef.current[playlistIndexRef.current]);
    }
  }, [playAyah]);

  const updateConfig = useCallback((updates: Partial<AudioConfig>) => {
    setState(s => {
      const newConfig = { ...s.config, ...updates };
      // Apply playback speed immediately
      if (updates.playbackSpeed && audioRef.current) {
        audioRef.current.playbackRate = updates.playbackSpeed;
      }
      return { ...s, config: newConfig };
    });
  }, []);

  return {
    ...state,
    playAyah,
    playRange,
    pause,
    resume,
    stop,
    togglePlayPause,
    skipNext,
    skipPrev,
    updateConfig,
    playlistLength: playlistRef.current.length,
    playlistIndex: playlistIndexRef.current,
  };
}
