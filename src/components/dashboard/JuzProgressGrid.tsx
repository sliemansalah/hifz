'use client';

import { useState, useRef, useEffect } from 'react';
import { UserProgress } from '@/types/progress';
import { TOTAL_JUZ, planDays } from '@/data/plan';
import { getJuzDayNumbers } from '@/lib/plan-utils';

interface JuzProgressGridProps {
  progress: UserProgress;
  currentDay?: number;
}

function getJuzStatus(progress: UserProgress, dayNumbers: number[]) {
  let memorized = 0;
  let tested = 0;
  let totalScore = 0;
  let testedCount = 0;

  for (const dn of dayNumbers) {
    const c = progress.completedDays[dn];
    if (c?.memorized) memorized++;
    if (c?.tested) {
      tested++;
      if (c.score) {
        totalScore += c.score;
        testedCount++;
      }
    }
  }

  return {
    total: dayNumbers.length,
    memorized,
    tested,
    avgScore: testedCount > 0 ? Math.round(totalScore / testedCount) : 0,
    pct: dayNumbers.length > 0 ? Math.round((tested / dayNumbers.length) * 100) : 0,
    memPct: dayNumbers.length > 0 ? Math.round((memorized / dayNumbers.length) * 100) : 0,
  };
}

export default function JuzProgressGrid({ progress, currentDay }: JuzProgressGridProps) {
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [compact, setCompact] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentJuz = currentDay ? planDays.find(d => d.dayNumber === currentDay)?.juz : undefined;

  const juzData = Array.from({ length: TOTAL_JUZ }, (_, i) => {
    const juz = i + 1;
    const dayNumbers = getJuzDayNumbers(juz);
    const status = getJuzStatus(progress, dayNumbers);
    return { juz, ...status };
  });

  const selected = selectedJuz !== null ? juzData.find(j => j.juz === selectedJuz) : null;

  // Scroll to current juz in compact mode
  useEffect(() => {
    if (compact && currentJuz && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-juz="${currentJuz}"]`);
      el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [compact, currentJuz]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">تقدم الأجزاء</h2>
        <button onClick={() => setCompact(!compact)}
          className="text-xs px-2 py-1 rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>
          {compact ? 'عرض مفصل' : 'عرض مضغوط'}
        </button>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-emerald-500)' }}></span>
          مكتمل
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--color-gold-400)' }}></span>
          حفظ فقط
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}></span>
          لم يبدأ
        </span>
      </div>

      {compact ? (
        /* Compact: horizontal scrollable strip */
        <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
          {juzData.map(({ juz, pct, memPct }) => {
            const isComplete = pct === 100;
            const isMemOnly = memPct > 0 && pct < 100;
            const isCurrent = juz === currentJuz;
            return (
              <button key={juz} data-juz={juz}
                onClick={() => setSelectedJuz(selectedJuz === juz ? null : juz)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all cursor-pointer shrink-0 ${
                  selectedJuz === juz ? 'ring-2 ring-emerald-500' : ''
                } ${isCurrent ? 'ring-2 ring-emerald-400 animate-pulse-glow' : ''}`}
                style={{
                  backgroundColor: isComplete
                    ? 'var(--color-emerald-100)'
                    : isMemOnly
                      ? 'var(--color-gold-50)'
                      : 'var(--bg-secondary)',
                  color: isComplete ? 'var(--color-emerald-800)' : 'var(--text-primary)',
                  minWidth: '3rem',
                }}>
                <span className="font-bold">{juz}</span>
                <span className="text-[10px]">{pct}%</span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Detailed: full grid */
        <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-10 gap-2">
          {juzData.map(({ juz, pct, memPct, avgScore }) => {
            const isComplete = pct === 100;
            const isMemOnly = memPct > 0 && pct < 100;
            const isCurrent = juz === currentJuz;
            return (
              <button key={juz}
                onClick={() => setSelectedJuz(selectedJuz === juz ? null : juz)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs transition-all cursor-pointer ${
                  selectedJuz === juz ? 'ring-2 ring-emerald-500' : ''
                } ${isCurrent ? 'ring-2 ring-emerald-400 animate-pulse-glow' : ''}`}
                style={{
                  backgroundColor: isComplete
                    ? 'var(--color-emerald-100)'
                    : isMemOnly
                      ? 'var(--color-gold-50)'
                      : 'var(--bg-secondary)',
                  color: isComplete
                    ? 'var(--color-emerald-800)'
                    : 'var(--text-primary)',
                }}>
                <span className="font-bold">{juz}</span>
                <span className="text-[10px]">{pct}%</span>
                {avgScore > 0 && (
                  <span className="text-[9px] mt-0.5" style={{
                    color: avgScore >= 90 ? 'var(--color-emerald-600)' : avgScore >= 80 ? 'var(--color-gold-600)' : '#ef4444'
                  }}>
                    {avgScore}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Detail panel */}
      {selected && (
        <div className="mt-4 p-4 rounded-lg animate-fade-in" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <h3 className="font-bold mb-3">الجزء {selected.juz}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-sm">
            <div>
              <div className="font-bold text-lg">{selected.total}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>إجمالي الأيام</div>
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: 'var(--color-gold-600)' }}>{selected.memorized}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>تم الحفظ</div>
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: 'var(--color-emerald-600)' }}>{selected.tested}</div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>تم التسميع</div>
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: selected.avgScore >= 90 ? 'var(--color-emerald-600)' : selected.avgScore >= 80 ? 'var(--color-gold-600)' : '#ef4444' }}>
                {selected.avgScore > 0 ? `${selected.avgScore}%` : '—'}
              </div>
              <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>متوسط الدرجة</div>
            </div>
          </div>
          {/* Progress bars */}
          <div className="mt-3 space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>الحفظ</span>
                <span>{selected.memPct}%</span>
              </div>
              <div className="progress-bar">
                <div className="h-full rounded-full transition-all" style={{ width: `${selected.memPct}%`, backgroundColor: 'var(--color-gold-400)' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>التسميع</span>
                <span>{selected.pct}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${selected.pct}%` }} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
