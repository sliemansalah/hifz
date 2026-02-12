import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import ThemeProvider from '@/components/layout/ThemeProvider';

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
      </head>
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <Navbar />
          <main className="md:mr-56 pb-20 md:pb-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
