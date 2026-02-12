'use client';

import { useState, useEffect, useRef } from 'react';

interface SessionTimerProps {
  onTimeUpdate?: (seconds: number) => void;
  autoStart?: boolean;
}

export default function SessionTimer({ onTimeUpdate, autoStart = true }: SessionTimerProps) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => {
          const next = s + 1;
          onTimeUpdateRef.current?.(next);
          return next;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const formatTime = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-mono font-bold" dir="ltr">{formatTime(seconds)}</span>
      <button
        onClick={() => setRunning(!running)}
        className="btn-secondary text-xs px-3 py-1"
      >
        {running ? 'إيقاف' : 'استمرار'}
      </button>
    </div>
  );
}
