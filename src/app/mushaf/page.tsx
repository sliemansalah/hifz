'use client';

import { useState, useMemo } from 'react';
import { surahMeta } from '@/data/surah-meta';
import { useQuranText } from '@/hooks/useQuranText';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { getWordErrorStatuses, getAyahErrorStatus, type WordErrorStatus } from '@/lib/error-tracker';
import { RepeatMode, RepeatCount } from '@/hooks/useAudioPlayer';

const ERROR_COLORS: Record<WordErrorStatus, string> = {
  red: '#ef4444',
  yellow: '#eab308',
  orange: '#f97316',
  none: 'inherit',
};

const ERROR_BG: Record<WordErrorStatus, string> = {
  red: 'rgba(239,68,68,0.15)',
  yellow: 'rgba(234,179,8,0.15)',
  orange: 'rgba(249,115,22,0.15)',
  none: 'transparent',
};

function AyahWithErrors({ surahNumber, ayahNumber, text, absoluteNumber, isPlaying, onClickAyah }: {
  surahNumber: number;
  ayahNumber: number;
  text: string;
  absoluteNumber: number;
  isPlaying: boolean;
  onClickAyah: (absoluteNumber: number) => void;
}) {
  const wordStatuses = useMemo(
    () => getWordErrorStatuses(surahNumber, ayahNumber),
    [surahNumber, ayahNumber]
  );

  const words = text.split(/\s+/);

  return (
    <span
      className={`inline transition-all ${isPlaying ? 'rounded-lg py-0.5 px-1' : ''}`}
      style={isPlaying ? {
        backgroundColor: 'rgba(16,185,129,0.15)',
        boxShadow: '0 0 0 2px rgba(16,185,129,0.3)',
      } : undefined}
      onClick={() => onClickAyah(absoluteNumber)}
    >
      {words.map((word, idx) => {
        const status = wordStatuses[idx] || 'none';
        return (
          <span key={idx}
            style={{
              color: isPlaying && status === 'none' ? 'var(--color-emerald-700)' : status !== 'none' ? ERROR_COLORS[status] : 'inherit',
              backgroundColor: ERROR_BG[status],
              borderRadius: status !== 'none' ? '0.25rem' : undefined,
              padding: status !== 'none' ? '0 0.15rem' : undefined,
              fontWeight: isPlaying || status !== 'none' ? 'bold' : undefined,
              textDecoration: status === 'red' ? 'underline wavy' : undefined,
              textDecorationColor: status === 'red' ? ERROR_COLORS.red : undefined,
              cursor: 'pointer',
            }}
            title={status === 'red' ? 'أخطأت أكثر من مرة' : status === 'yellow' ? 'أخطأت مرة واحدة' : status === 'orange' ? 'أخطأت سابقا وصححت' : undefined}
          >
            {word}{' '}
          </span>
        );
      })}
      <span className="ayah-number" style={isPlaying ? { color: 'var(--color-emerald-700)' } : undefined}>{ayahNumber}</span>
    </span>
  );
}

function SurahView({ surahNumber }: { surahNumber: number }) {
  const { ayahs, loading, error } = useQuranText(surahNumber);
  const meta = surahMeta.find(s => s.number === surahNumber);
  const player = useAudioPlayer();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const absoluteNumbers = useMemo(() => ayahs.map(a => a.number), [ayahs]);

  const currentAyahInSurah = useMemo(() => {
    if (!player.currentAyah) return null;
    const ayah = ayahs.find(a => a.number === player.currentAyah);
    return ayah?.numberInSurah || null;
  }, [player.currentAyah, ayahs]);

  const handlePlayAll = () => {
    if (player.playing) {
      player.pause();
    } else if (player.currentAyah) {
      player.resume();
    } else {
      player.playRange(absoluteNumbers);
    }
  };

  const handleClickAyah = (absoluteNumber: number) => {
    // Play from this ayah onwards
    const idx = absoluteNumbers.indexOf(absoluteNumber);
    if (idx >= 0) {
      player.playRange(absoluteNumbers.slice(idx));
    }
  };

  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const repeatLabel = (count: RepeatCount) => count === 0 ? '\u221E' : String(count);
  const maxRepeats = player.config.repeatCount === 0 ? '\u221E' : player.config.repeatCount;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse" style={{ color: 'var(--text-secondary)' }}>جارٍ تحميل السورة...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Surah header */}
      <div className="text-center py-4 islamic-border">
        <h2 className="text-2xl font-bold quran-text" style={{ color: 'var(--color-emerald-600)' }}>
          سورة {meta?.name}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          {meta?.ayahCount} آيات — {meta?.revelationType === 'meccan' ? 'مكية' : 'مدنية'}
        </p>
      </div>

      {/* Audio player - integrated */}
      {ayahs.length > 0 && (
        <div className="card sticky top-0 z-10">
          <div className="flex items-center justify-between mb-2">
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
            <div className="mb-2">
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${player.progress}%` }} />
              </div>
              <div className="flex justify-between mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }} dir="ltr">
                <span>{formatTime(player.currentTime)}</span>
                <span>{formatTime(player.duration)}</span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button onClick={player.skipPrev} disabled={!player.currentAyah}
              className="p-2 rounded-full hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button onClick={handlePlayAll}
              className="p-3 rounded-full transition-all"
              style={{ backgroundColor: 'var(--color-emerald-600)', color: 'white' }}>
              {player.loading ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="animate-spin">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="40 60"/>
                </svg>
              ) : player.playing ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              )}
            </button>
            <button onClick={player.skipNext} disabled={!player.currentAyah}
              className="p-2 rounded-full hover:bg-[var(--bg-secondary)] disabled:opacity-30 transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
            {player.currentAyah && (
              <button onClick={player.stop}
                className="p-2 rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
                style={{ color: 'var(--text-secondary)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12"/></svg>
              </button>
            )}
          </div>

          {/* Info */}
          {player.playlistLength > 1 && player.currentAyah && (
            <p className="text-center text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
              {player.playlistIndex + 1} / {player.playlistLength} آيات
              {player.config.repeatMode !== 'off' && (
                <span className="mr-2">— تكرار {player.currentRepeat}/{maxRepeats}</span>
              )}
            </p>
          )}

          {/* Advanced controls toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full mt-2 flex items-center justify-center gap-1 text-xs py-1 rounded-lg transition-colors hover:bg-[var(--bg-secondary)]"
            style={{ color: 'var(--text-secondary)' }}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"
              className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
              <path d="M7 10l5 5 5-5z"/>
            </svg>
            إعدادات
          </button>

          {showAdvanced && (
            <div className="mt-2 space-y-2 p-2 rounded-lg text-xs" style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <label className="font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>التكرار</label>
                <div className="flex gap-1">
                  {([['off', 'إيقاف'], ['ayah', 'آية'], ['range', 'الكل']] as [RepeatMode, string][]).map(([mode, label]) => (
                    <button key={mode}
                      onClick={() => player.updateConfig({ repeatMode: mode })}
                      className="flex-1 py-1 rounded font-medium"
                      style={{
                        backgroundColor: player.config.repeatMode === mode ? 'var(--color-emerald-600)' : 'var(--bg-primary)',
                        color: player.config.repeatMode === mode ? 'white' : 'var(--text-primary)',
                      }}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {player.config.repeatMode !== 'off' && (
                <div>
                  <label className="font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>العدد</label>
                  <div className="flex gap-1">
                    {([1, 3, 5, 10, 0] as RepeatCount[]).map(count => (
                      <button key={count}
                        onClick={() => player.updateConfig({ repeatCount: count })}
                        className="flex-1 py-1 rounded font-medium"
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
              <div>
                <label className="font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>السرعة</label>
                <div className="flex gap-1">
                  {[0.5, 0.75, 1, 1.25, 1.5].map(speed => (
                    <button key={speed}
                      onClick={() => player.updateConfig({ playbackSpeed: speed })}
                      className="flex-1 py-1 rounded font-medium"
                      style={{
                        backgroundColor: player.config.playbackSpeed === speed ? 'var(--color-emerald-600)' : 'var(--bg-primary)',
                        color: player.config.playbackSpeed === speed ? 'white' : 'var(--text-primary)',
                      }}>
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
              {player.config.repeatMode !== 'off' && (
                <div>
                  <label className="font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>وقفة</label>
                  <div className="flex gap-1">
                    {[0, 2, 5, 10].map(sec => (
                      <button key={sec}
                        onClick={() => player.updateConfig({ autoPauseSeconds: sec })}
                        className="flex-1 py-1 rounded font-medium"
                        style={{
                          backgroundColor: player.config.autoPauseSeconds === sec ? 'var(--color-emerald-600)' : 'var(--bg-primary)',
                          color: player.config.autoPauseSeconds === sec ? 'white' : 'var(--text-primary)',
                        }}>
                        {sec === 0 ? 'لا' : `${sec}ث`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Ayahs with highlighting */}
      <div className="quran-text text-center leading-loose p-4 md:p-6 islamic-border">
        {ayahs.map(ayah => (
          <AyahWithErrors
            key={ayah.numberInSurah}
            surahNumber={surahNumber}
            ayahNumber={ayah.numberInSurah}
            text={ayah.text}
            absoluteNumber={ayah.number}
            isPlaying={player.currentAyah === ayah.number}
            onClickAyah={handleClickAyah}
          />
        ))}
      </div>

      <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
        اضغط على أي آية للاستماع من تلك الآية
      </p>
    </div>
  );
}

export default function MushafPage() {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [showSurahList, setShowSurahList] = useState(true);

  // Calculate error status per surah (overview)
  const surahErrors = useMemo(() => {
    const result: Record<number, { red: number; yellow: number; orange: number }> = {};
    for (const surah of surahMeta) {
      let red = 0, yellow = 0, orange = 0;
      for (let ayah = 1; ayah <= surah.ayahCount; ayah++) {
        const status = getAyahErrorStatus(surah.number, ayah);
        if (status === 'red') red++;
        else if (status === 'yellow') yellow++;
        else if (status === 'orange') orange++;
      }
      if (red + yellow + orange > 0) {
        result[surah.number] = { red, yellow, orange };
      }
    }
    return result;
  }, []);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المصحف الشخصي</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            مصحفك مع تتبع الأخطاء
          </p>
        </div>
        <button onClick={() => setShowSurahList(!showSurahList)} className="btn-secondary text-sm">
          {showSurahList ? 'عرض السورة' : 'قائمة السور'}
        </button>
      </div>

      {/* Legend */}
      <div className="card flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: ERROR_COLORS.red }} />
          <span>أخطأت أكثر من مرة</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: ERROR_COLORS.yellow }} />
          <span>أخطأت مرة واحدة</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: ERROR_COLORS.orange }} />
          <span>صححت لاحقا</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded" style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)' }} />
          <span>الآية المقروءة حالياً</span>
        </div>
      </div>

      {showSurahList ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {surahMeta.map(surah => {
            const errs = surahErrors[surah.number];
            return (
              <button key={surah.number}
                onClick={() => { setSelectedSurah(surah.number); setShowSurahList(false); }}
                className="card flex items-center gap-3 text-right hover:border-emerald-400 transition-colors cursor-pointer"
                style={{ padding: '0.75rem 1rem' }}>
                <span className="w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: 'var(--color-emerald-100)', color: 'var(--color-emerald-800)' }}>
                  {surah.number}
                </span>
                <div className="flex-1">
                  <span className="font-bold">{surah.name}</span>
                  <span className="text-xs mr-2" style={{ color: 'var(--text-secondary)' }}>
                    {surah.ayahCount} آيات
                  </span>
                </div>
                {errs && (
                  <div className="flex gap-1">
                    {errs.red > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: ERROR_COLORS.red }}>
                        {errs.red}
                      </span>
                    )}
                    {errs.yellow > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(234,179,8,0.15)', color: ERROR_COLORS.yellow }}>
                        {errs.yellow}
                      </span>
                    )}
                    {errs.orange > 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: ERROR_COLORS.orange }}>
                        {errs.orange}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      ) : (
        <SurahView surahNumber={selectedSurah} />
      )}
    </div>
  );
}
