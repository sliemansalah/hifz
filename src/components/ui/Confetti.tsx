'use client';

import { useMemo } from 'react';

interface ConfettiProps {
  active: boolean;
  duration?: number;
}

const COLORS = ['#059669', '#eab308', '#3b82f6', '#ec4899', '#8b5cf6', '#f97316'];

export default function Confetti({ active, duration = 3 }: ConfettiProps) {
  const pieces = useMemo(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 8,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: Math.random() * 1.5,
      animDuration: 2 + Math.random() * 2,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }));
  }, []);

  if (!active) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {pieces.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-20px',
            width: `${p.size}px`,
            height: p.shape === 'circle' ? `${p.size}px` : `${p.size * 0.6}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animation: `confettiFall ${p.animDuration}s ${p.delay}s ease-in forwards`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}
