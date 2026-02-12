interface RecordingIndicatorProps {
  duration: number;
  interimText?: string;
}

export default function RecordingIndicator({ duration, interimText }: RecordingIndicatorProps) {
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;
  const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="text-center space-y-4">
      {/* Waveform recording indicator */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-end gap-1 h-6">
          <div className="waveform-bar" />
          <div className="waveform-bar" />
          <div className="waveform-bar" />
          <div className="waveform-bar" />
          <div className="waveform-bar" />
        </div>
        <span className="text-red-500 font-bold text-sm">جارٍ التسجيل</span>
        <div className="flex items-end gap-1 h-6">
          <div className="waveform-bar" style={{ animationDelay: '0.5s' }} />
          <div className="waveform-bar" style={{ animationDelay: '0.35s' }} />
          <div className="waveform-bar" style={{ animationDelay: '0.2s' }} />
          <div className="waveform-bar" style={{ animationDelay: '0.65s' }} />
          <div className="waveform-bar" style={{ animationDelay: '0.8s' }} />
        </div>
      </div>

      {/* Timer */}
      <div className="text-3xl font-mono font-bold" dir="ltr">
        {timeStr}
      </div>

      {/* Live transcript preview */}
      {interimText && (
        <div className="p-3 rounded-lg text-sm quran-text" style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
          {interimText}...
        </div>
      )}
    </div>
  );
}
