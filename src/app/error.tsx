'use client';

import { useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="card max-w-md w-full text-center space-y-4">
        <div className="text-5xl">&#x26A0;&#xFE0F;</div>
        <h1 className="text-xl font-bold">حدث خطأ غير متوقع</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          عذراً، حدث خطأ أثناء تحميل الصفحة. يمكنك المحاولة مرة أخرى.
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            حاول مجدداً
          </button>
          <a href="/" className="btn-secondary">
            الرئيسية
          </a>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs underline"
          style={{ color: 'var(--text-secondary)' }}
        >
          {showDetails ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </button>
        {showDetails && (
          <pre className="text-xs text-right p-3 rounded-lg overflow-auto max-h-40"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}
            dir="ltr">
            {error.message}
            {error.digest && `\nDigest: ${error.digest}`}
          </pre>
        )}
      </div>
    </div>
  );
}
