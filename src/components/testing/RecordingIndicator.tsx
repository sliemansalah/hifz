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
      {/* Pulsing recording indicator */}
      <div className="flex items-center justify-center gap-3">
        <div className="relative">
          <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
          <div className="absolute inset-0 w-4 h-4 rounded-full bg-red-500 animate-ping opacity-30" />
        </div>
        <span className="text-red-500 font-bold text-sm">جارٍ التسجيل</span>
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
