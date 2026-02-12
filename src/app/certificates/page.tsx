'use client';

import { useState, useMemo } from 'react';
import { getCertificates } from '@/lib/certificates';
import Certificate from '@/components/testing/Certificate';
import Link from 'next/link';

export default function CertificatesPage() {
  const [certs] = useState(() => getCertificates());
  const [selectedCert, setSelectedCert] = useState<(typeof certs)[0] | null>(null);
  const [filterJuz, setFilterJuz] = useState<number | null>(null);

  const filtered = useMemo(() => {
    if (filterJuz === null) return certs;
    return certs.filter(c => c.juz === filterJuz);
  }, [certs, filterJuz]);

  const juzNumbers = useMemo(() => {
    const set = new Set(certs.map(c => c.juz));
    return Array.from(set).sort((a, b) => a - b);
  }, [certs]);

  const stats = useMemo(() => ({
    total: certs.length,
    perfect: certs.filter(c => c.score === 100).length,
    avgScore: certs.length > 0 ? Math.round(certs.reduce((a, c) => a + c.score, 0) / certs.length) : 0,
  }), [certs]);

  const getScoreColor = (score: number) => {
    if (score === 100) return 'var(--color-emerald-600)';
    if (score >= 90) return 'var(--color-emerald-500)';
    if (score >= 80) return 'var(--color-gold-500)';
    return '#ef4444';
  };

  const getScoreBadge = (score: number) => {
    if (score === 100) return '🏆';
    if (score >= 95) return '🌟';
    if (score >= 90) return '⭐';
    return '📝';
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">
      {selectedCert && (
        <Certificate
          dayNumber={selectedCert.dayNumber}
          surahName={selectedCert.surahName}
          startAyah={selectedCert.startAyah}
          endAyah={selectedCert.endAyah}
          score={selectedCert.score}
          date={selectedCert.date}
          onClose={() => setSelectedCert(null)}
        />
      )}

      <div>
        <h1 className="text-2xl font-bold">شهاداتي</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>سجل إنجازاتك في حفظ القرآن الكريم</p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center py-3">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-emerald-600)' }}>{stats.total}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>شهادة</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-2xl font-bold" style={{ color: 'var(--color-gold-500)' }}>{stats.perfect}</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>إتقان كامل</div>
        </div>
        <div className="card text-center py-3">
          <div className="text-2xl font-bold">{stats.avgScore}%</div>
          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>متوسط الدرجة</div>
        </div>
      </div>

      {/* Filter by juz */}
      {juzNumbers.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button onClick={() => setFilterJuz(null)}
            className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
              filterJuz === null ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
            }`}>
            الكل
          </button>
          {juzNumbers.map(j => (
            <button key={j} onClick={() => setFilterJuz(j)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                filterJuz === j ? 'bg-emerald-600 text-white' : 'bg-[var(--bg-secondary)]'
              }`}>
              جزء {j}
            </button>
          ))}
        </div>
      )}

      {/* Certificate list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📜</div>
          <h2 className="text-xl font-bold mb-2">لا توجد شهادات بعد</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            أكمل اختبارات التسميع للحصول على شهادات الإتقان
          </p>
          <Link href="/test" className="btn-primary">ابدأ الاختبار</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(cert => (
            <button key={cert.id}
              onClick={() => setSelectedCert(cert)}
              className="card text-right hover:shadow-lg transition-shadow cursor-pointer"
              style={{ padding: '1rem' }}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{getScoreBadge(cert.score)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold truncate">سورة {cert.surahName}</h3>
                    <span className="text-lg font-bold shrink-0" style={{ color: getScoreColor(cert.score) }}>
                      {cert.score}%
                    </span>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    آيات {cert.startAyah}–{cert.endAyah} | يوم {cert.dayNumber}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      {cert.testType === 'written' ? 'كتابي' : 'إخفاء كلمات'}
                    </span>
                    {cert.errors > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                        {cert.errors} أخطاء
                      </span>
                    )}
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(cert.date).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
