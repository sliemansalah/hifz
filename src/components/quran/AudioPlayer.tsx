'use client';

import { useAudioPlayer, RepeatMode, RepeatCount } from '@/hooks/useAudioPlayer';
import { Ayah } from '@/types/quran';
import { useEffect, useMemo, useState } from 'react';

interface AudioPlayerProps {
  ayahs: Ayah[];
  compact?: boolean;
}

export default function AudioPlayer({ ayahs, compact = false }: AudioPlayerProps) {
  const player = useAudioPlayer();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const absoluteNumbers = useMemo(() => ayahs.map(a => a.number), [ayahs]);

  const currentAyahInSurah = useMemo(() => {
    if (!player.currentAyah) return null;
    const ayah = ayahs.find(a => a.number === player.currentAyah);
    return ayah?.numberInSurah || null;
  }, [player.currentAyah, ayahs]);

  // Clean up on unmount
  useEffect(() => {
    return () => player.stop();
  }, []);

  const handlePlayAll = () => {
    if (player.playing) {
      player.pause();
    } else if (player.currentAyah) {
      player.resume();
    } else {
      player.playRange(absoluteNumbers);
    }
  };

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const repeatLabel = (count: RepeatCount) => count === 0 ? '∞' : String(count);
  const maxRepeats = player.config.repeatCount === 0 ? '∞' : player.config.repeatCount;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button onClick={handlePlayAll}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
          style={{ backgroundColor: 'var(--color-emerald-600)', color: 'white' }}>
          {player.loading ? (
            <span className="animate-pulse">...</span>
          ) : player.playing ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          )}
          <span>{player.playing ? 'إيقاف' : 'استمع'}</span>
        </button>
        {player.playing && currentAyahInSurah && (
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            آية {currentAyahInSurah}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">القارئ: ياسر الدوسري</h3>
        {currentAyahInSurah && (
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'var(--color-emerald-100)', color: 'var(--color-emerald-800)' }}>
            آية {currentAyahInSurah}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {player.currentAyah && (
        <div className="mb-3">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${player.progress}%` }} />
          </div>
          <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-secondary)' }} dir="ltr">
            <span>{formatTime(player.currentTime)}</span>
            <span>{formatTime(player.duration)}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={player.skipPrev} disabled={!player.currentAyah}
          className="p-2 rounded-full hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>

        <button onClick={handlePlayAll}
          className="p-3 rounded-full transition-all"
          style={{ backgroundColor: 'var(--color-emerald-600)', color: 'white' }}>
          {player.loading ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="animate-spin">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="40 60"/>
            </svg>
          ) : player.playing ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
          )}
        </button>

        <button onClick={player.skipNext} disabled={!player.currentAyah}
          className="p-2 rounded-full hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>

        {player.currentAyah && (
          <button onClick={player.stop}
            className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
            style={{ color: 'var(--text-secondary)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>
          </button>
        )}
      </div>

      {/* Playlist info + repeat counter */}
      {player.playlistLength > 1 && player.currentAyah && (
        <p className="text-center text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
          {player.playlistIndex + 1} / {player.playlistLength} آيات
          {player.config.repeatMode !== 'off' && (
            <span className="mr-2">— تكرار {player.currentRepeat}/{maxRepeats}</span>
          )}
        </p>
      )}

      {/* Single ayah repeat counter */}
      {player.playlistLength <= 1 && player.currentAyah && player.config.repeatMode !== 'off' && (
        <p className="text-center text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
          تكرار {player.currentRepeat}/{maxRepeats}
        </p>
      )}

      {/* Advanced controls toggle */}
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full mt-3 flex items-center justify-center gap-1 text-xs py-1.5 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
        style={{ color: 'var(--text-secondary)' }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"
          className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
          <path d="M7 10l5 5 5-5z"/>
        </svg>
        إعدادات متقدمة
      </button>

      {/* Advanced controls panel */}
      {showAdvanced && (
        <div className="mt-2 space-y-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          {/* Repeat mode */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>وضع التكرار</label>
            <div className="flex gap-1">
              {([['off', 'إيقاف'], ['ayah', 'آية واحدة'], ['range', 'النطاق كاملاً']] as [RepeatMode, string][]).map(([mode, label]) => (
                <button key={mode}
                  onClick={() => player.updateConfig({ repeatMode: mode })}
                  className="flex-1 py-1.5 text-xs rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: player.config.repeatMode === mode ? 'var(--color-emerald-600)' : 'var(--bg-primary)',
                    color: player.config.repeatMode === mode ? 'white' : 'var(--text-primary)',
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat count */}
          {player.config.repeatMode !== 'off' && (
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>عدد التكرارات</label>
              <div className="flex gap-1">
                {([1, 3, 5, 10, 0] as RepeatCount[]).map(count => (
                  <button key={count}
                    onClick={() => player.updateConfig({ repeatCount: count })}
                    className="flex-1 py-1.5 text-xs rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: player.config.repeatCount === count ? 'var(--color-emerald-600)' : 'var(--bg-primary)',
                      color: player.config.repeatCount === count ? 'white' : 'var(--text-primary)',
                    }}>
                    {repeatLabel(count)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Playback speed */}
          <div>
            <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>سرعة التشغيل</label>
            <div className="flex gap-1">
              {[0.5, 0.75, 1, 1.25, 1.5].map(speed => (
                <button key={speed}
                  onClick={() => player.updateConfig({ playbackSpeed: speed })}
                  className="flex-1 py-1.5 text-xs rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: player.config.playbackSpeed === speed ? 'var(--color-emerald-600)' : 'var(--bg-primary)',
                    color: player.config.playbackSpeed === speed ? 'white' : 'var(--text-primary)',
                  }}>
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Auto-pause */}
          {player.config.repeatMode !== 'off' && (
            <div>
              <label className="text-xs font-medium block mb-1.5" style={{ color: 'var(--text-secondary)' }}>وقفة بين التكرارات</label>
              <div className="flex gap-1">
                {[0, 2, 5, 10].map(sec => (
                  <button key={sec}
                    onClick={() => player.updateConfig({ autoPauseSeconds: sec })}
                    className="flex-1 py-1.5 text-xs rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: player.config.autoPauseSeconds === sec ? 'var(--color-emerald-600)' : 'var(--bg-primary)',
                      color: player.config.autoPauseSeconds === sec ? 'white' : 'var(--text-primary)',
                    }}>
                    {sec === 0 ? 'بدون' : `${sec} ث`}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
