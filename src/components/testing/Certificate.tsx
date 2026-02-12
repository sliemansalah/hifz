'use client';

import { useRef } from 'react';

interface CertificateProps {
  dayNumber: number;
  surahName: string;
  startAyah: number;
  endAyah: number;
  score: number;
  date: string;
  onClose: () => void;
}

export default function Certificate({ dayNumber, surahName, startAyah, endAyah, score, date, onClose }: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
      <div ref={certRef} className="w-full max-w-lg animate-in" style={{
        background: 'linear-gradient(135deg, #fef9c3, #fefce8, #ffffff, #ecfdf5, #d1fae5)',
        borderRadius: '1.5rem',
        border: '3px solid var(--color-gold-400)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative corners */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, var(--color-gold-400), var(--color-emerald-500), var(--color-gold-400))'
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
          background: 'linear-gradient(90deg, var(--color-gold-400), var(--color-emerald-500), var(--color-gold-400))'
        }} />

        <div className="text-center space-y-4">
          {/* Header */}
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--color-gold-700)' }}>بسم الله الرحمن الرحيم</p>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--color-emerald-700)', fontFamily: 'Amiri, serif' }}>
              شهادة إتقان
            </h1>
            <div className="w-24 h-0.5 mx-auto mt-2" style={{ backgroundColor: 'var(--color-gold-400)' }} />
          </div>

          {/* Star/badge */}
          <div className="text-6xl">
            {score === 100 ? '🏆' : score >= 95 ? '🌟' : '⭐'}
          </div>

          {/* Content */}
          <div className="space-y-2">
            <p className="text-lg" style={{ color: '#374151' }}>
              أتم بنجاح حفظ وتسميع
            </p>
            <p className="text-xl font-bold quran-text" style={{ color: 'var(--color-emerald-700)' }}>
              سورة {surahName}
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              الآيات {startAyah} – {endAyah}
            </p>
            <p className="text-sm" style={{ color: '#6b7280' }}>
              اليوم {dayNumber} من خطة الحفظ
            </p>
          </div>

          {/* Score */}
          <div className="inline-block px-6 py-2 rounded-full" style={{
            backgroundColor: 'var(--color-emerald-100)',
            color: 'var(--color-emerald-800)',
          }}>
            <span className="text-2xl font-bold">{score}%</span>
            <span className="text-sm mr-2">نتيجة التسميع</span>
          </div>

          {/* Date */}
          <p className="text-sm" style={{ color: '#9ca3af' }}>
            {new Date(date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          {/* Seal */}
          <div className="text-sm font-medium" style={{ color: 'var(--color-gold-600)' }}>
            ختم الإتقان
          </div>
        </div>

        {/* Close button */}
        <button onClick={onClose}
          className="mt-6 w-full btn-primary py-3 text-lg">
          ما شاء الله! متابعة
        </button>
      </div>
    </div>
  );
}
