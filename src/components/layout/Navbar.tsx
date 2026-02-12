'use client';

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

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'hover:bg-[var(--bg-secondary)]'
                }`}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
        <button onClick={toggleTheme} className="btn-secondary text-sm mt-4">
          {theme === 'dark' ? '☀️ فاتح' : theme === 'light' ? '🌙 داكن' : '💻 نظام'}
        </button>
      </nav>

      {/* Mobile bottom bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t flex justify-around py-2 px-1"
           style={{ backgroundColor: 'var(--bg-card)' }}>
        {navItems.slice(0, 7).map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs transition-colors ${
                isActive ? 'text-emerald-600 font-bold' : ''
              }`}
              style={{ color: isActive ? 'var(--color-emerald-600)' : 'var(--text-secondary)' }}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
