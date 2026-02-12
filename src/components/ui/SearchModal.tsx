'use client';

import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { surahMeta } from '@/data/surah-meta';
import { planDays } from '@/data/plan';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  label: string;
  description: string;
  href: string;
  category: string;
  icon: string;
}

const navItems: SearchResult[] = [
  { label: 'الرئيسية', description: 'لوحة القيادة', href: '/', category: 'صفحات', icon: '🏠' },
  { label: 'مهمة اليوم', description: 'الحفظ اليومي', href: '/today', category: 'صفحات', icon: '📅' },
  { label: 'حفظ', description: 'جلسة حفظ جديدة', href: '/memorize', category: 'صفحات', icon: '📖' },
  { label: 'تسميع', description: 'اختبار الحفظ', href: '/test', category: 'صفحات', icon: '✍️' },
  { label: 'مراجعة', description: 'مراجعة المحفوظ', href: '/review', category: 'صفحات', icon: '🔄' },
  { label: 'المصحف', description: 'مصحف شخصي', href: '/mushaf', category: 'صفحات', icon: '📕' },
  { label: 'الخطة', description: 'خطة 1304 يوم', href: '/plan', category: 'صفحات', icon: '📋' },
  { label: 'إحصائيات', description: 'تقدمك وإنجازاتك', href: '/stats', category: 'صفحات', icon: '📊' },
  { label: 'شهاداتي', description: 'شهادات الإنجاز', href: '/certificates', category: 'صفحات', icon: '📜' },
  { label: 'إعدادات', description: 'تخصيص التطبيق', href: '/settings', category: 'صفحات', icon: '⚙️' },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    if (!query.trim()) return navItems.slice(0, 6);

    const q = query.trim().toLowerCase();
    const matches: SearchResult[] = [];

    // Search pages
    for (const item of navItems) {
      if (item.label.includes(q) || item.description.includes(q)) {
        matches.push(item);
      }
    }

    // Search surahs
    for (const s of surahMeta) {
      if (s.name.includes(q) || s.englishName.toLowerCase().includes(q)) {
        matches.push({
          label: s.name,
          description: `سورة ${s.name} — ${s.ayahCount} آية`,
          href: `/mushaf?surah=${s.number}`,
          category: 'سور',
          icon: '📗',
        });
      }
    }

    // Search plan days (only if query looks like a number)
    const dayNum = parseInt(q);
    if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= planDays.length) {
      const day = planDays[dayNum - 1];
      matches.push({
        label: `يوم ${day.dayNumber}`,
        description: `${day.surahName} (${day.startAyah}–${day.endAyah})`,
        href: `/plan/${day.dayNumber}`,
        category: 'الخطة',
        icon: '📋',
      });
    }

    return matches.slice(0, 15);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const navigate = useCallback((href: string) => {
    onClose();
    router.push(href);
  }, [onClose, router]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex].href);
    }
  }, [results, selectedIndex, navigate]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 150,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '15vh',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        className="animate-scale-in"
        style={{
          position: 'relative',
          width: '90%',
          maxWidth: '500px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
      >
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="ابحث عن صفحة أو سورة أو يوم..."
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
          <kbd style={{
            fontSize: '0.625rem',
            padding: '0.125rem 0.375rem',
            borderRadius: '0.25rem',
            border: '1px solid var(--border-color)',
            color: 'var(--text-secondary)',
          }}>
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '0.5rem' }}>
          {results.length === 0 && (
            <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              لا توجد نتائج
            </p>
          )}
          {results.map((result, i) => (
            <button
              key={`${result.href}-${i}`}
              onClick={() => navigate(result.href)}
              onMouseEnter={() => setSelectedIndex(i)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.625rem 0.75rem',
                borderRadius: '0.5rem',
                textAlign: 'right',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: i === selectedIndex ? 'var(--bg-secondary)' : 'transparent',
                color: 'var(--text-primary)',
                transition: 'background-color 0.1s',
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{result.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{result.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {result.description}
                </div>
              </div>
              <span style={{ fontSize: '0.625rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                {result.category}
              </span>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '0.5rem 1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '1rem',
          fontSize: '0.625rem',
          color: 'var(--text-secondary)',
        }}>
          <span>↑↓ للتنقل</span>
          <span>↵ للفتح</span>
          <span>ESC للإغلاق</span>
        </div>
      </div>
    </div>
  );
}
