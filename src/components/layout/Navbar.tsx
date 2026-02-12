'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/hooks/useTheme';

const navItems = [
  { href: '/', label: 'الرئيسية', icon: '🏠' },
  { href: '/today', label: 'اليوم', icon: '📅' },
  { href: '/memorize', label: 'حفظ', icon: '📖' },
  { href: '/test', label: 'تسميع', icon: '✍️' },
  { href: '/review', label: 'مراجعة', icon: '🔄' },
  { href: '/mushaf', label: 'المصحف', icon: '📕' },
  { href: '/certificates', label: 'شهاداتي', icon: '📜' },
  { href: '/plan', label: 'الخطة', icon: '📋' },
  { href: '/stats', label: 'إحصائيات', icon: '📊' },
  { href: '/settings', label: 'إعدادات', icon: '⚙️' },
];

const mobileMainItems = navItems.slice(0, 4); // الرئيسية, اليوم, حفظ, تسميع
const mobileMoreItems = navItems.slice(4); // مراجعة, المصحف, شهاداتي, الخطة, إحصائيات, إعدادات

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href));
  const isMoreActive = mobileMoreItems.some(item => isActive(item.href));

  return (
    <>
      {/* Desktop sidebar */}
      <nav className="hidden md:flex fixed right-0 top-0 h-full w-56 flex-col border-l p-4 z-50"
           style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="mb-8 text-center">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-emerald-600)' }}>حفظ القرآن</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>تتبع حفظك</p>
        </div>
        <div className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                isActive(item.href)
                  ? 'bg-emerald-600 text-white'
                  : 'hover:bg-[var(--bg-secondary)]'
              }`}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
        <button onClick={toggleTheme} className="btn-secondary text-sm mt-4">
          {theme === 'dark' ? '☀️ فاتح' : theme === 'light' ? '🌙 داكن' : '💻 نظام'}
        </button>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t"
           style={{ backgroundColor: 'var(--bg-card)' }}>
        {/* More menu overlay */}
        {moreOpen && (
          <>
            <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setMoreOpen(false)} />
            <div className="absolute bottom-full left-0 right-0 z-50 p-3 border-t rounded-t-2xl animate-slide-down"
                 style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ backgroundColor: 'var(--border-color)' }} />
              <div className="grid grid-cols-3 gap-2">
                {mobileMoreItems.map(item => (
                  <Link key={item.href} href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl text-xs transition-colors ${
                      isActive(item.href) ? 'font-bold' : ''
                    }`}
                    style={{
                      backgroundColor: isActive(item.href) ? 'var(--color-emerald-50)' : 'var(--bg-secondary)',
                      color: isActive(item.href) ? 'var(--color-emerald-700)' : 'var(--text-primary)',
                    }}>
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Main bottom bar */}
        <div className="flex justify-around py-2 px-1">
          {mobileMainItems.map(item => (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors ${
                isActive(item.href) ? 'font-bold' : ''
              }`}
              style={{ color: isActive(item.href) ? 'var(--color-emerald-600)' : 'var(--text-secondary)' }}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
          {/* Review shortcut */}
          <Link href="/review"
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors ${
              isActive('/review') ? 'font-bold' : ''
            }`}
            style={{ color: isActive('/review') ? 'var(--color-emerald-600)' : 'var(--text-secondary)' }}>
            <span className="text-lg">🔄</span>
            <span>مراجعة</span>
          </Link>
          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-xs transition-colors ${
              isMoreActive && !moreOpen ? 'font-bold' : ''
            }`}
            style={{ color: isMoreActive ? 'var(--color-emerald-600)' : 'var(--text-secondary)' }}>
            <span className="text-lg">{moreOpen ? '✕' : '☰'}</span>
            <span>المزيد</span>
          </button>
        </div>
      </nav>
    </>
  );
}
