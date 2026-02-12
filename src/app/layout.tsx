import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import ThemeProvider from '@/components/layout/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import SearchWrapper from '@/components/layout/SearchWrapper';

export const metadata: Metadata = {
  title: 'حفظ القرآن الكريم',
  description: 'تطبيق تتبع حفظ القرآن الكريم - خطة 1304 يوم',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/hifz/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/hifz/sw.js').catch(() => {});
                });
              }
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <ToastProvider>
            <Navbar />
            <SearchWrapper />
            <main className="md:mr-56 pb-20 md:pb-8">
              {children}
            </main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
