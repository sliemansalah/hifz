'use client';

import { useState } from 'react';

export default function TestError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="card text-center space-y-4 py-12">
        <div className="text-5xl">&#x270D;&#xFE0F;</div>
        <h1 className="text-xl font-bold">خطأ في صفحة الاختبار</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          حدث خطأ أثناء تحميل الاختبار. حاول مجدداً أو اختر اختباراً آخر.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">حاول مجدداً</button>
          <a href="/test" className="btn-secondary">صفحة الاختبارات</a>
        </div>
        <button onClick={() => setShowDetails(!showDetails)}
          className="text-xs underline" style={{ color: 'var(--text-secondary)' }}>
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </button>
        {showDetails && (
          <pre className="text-xs text-right p-3 rounded-lg overflow-auto max-h-40"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }} dir="ltr">
            {error.message}
          </pre>
        )}
      </div>
    </div>
  );
}
