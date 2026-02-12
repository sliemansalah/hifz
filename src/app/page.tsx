'use client';

import Link from 'next/link';
import { useProgress } from '@/hooks/useProgress';
import { getDay } from '@/data/plan';
import OverallProgress from '@/components/dashboard/OverallProgress';
import StreakCounter from '@/components/dashboard/StreakCounter';
import TodayBrief from '@/components/dashboard/TodayBrief';
import JuzProgressGrid from '@/components/dashboard/JuzProgressGrid';

const motivationalMessages = [
  'قال ﷺ: «خيركم من تعلم القرآن وعلمه»',
  'قال ﷺ: «اقرؤوا القرآن فإنه يأتي يوم القيامة شفيعاً لأصحابه»',
  'قال ﷺ: «إن الذي ليس في جوفه شيء من القرآن كالبيت الخرب»',
  'قال ﷺ: «الماهر بالقرآن مع السفرة الكرام البررة»',
  'قال ﷺ: «يُقال لصاحب القرآن: اقرأ وارتقِ ورتّل»',
  'قال تعالى: ﴿وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ﴾',
  'قال تعالى: ﴿إِنَّ هَـٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ﴾',
  'قال ﷺ: «من قرأ حرفاً من كتاب الله فله به حسنة، والحسنة بعشر أمثالها»',
  'قال ﷺ: «اقرؤوا الزهراوين: البقرة وآل عمران»',
  'اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا',
  'قال تعالى: ﴿كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ﴾',
  'قال ﷺ: «تعاهدوا هذا القرآن فوالذي نفسي بيده لهو أشد تفلّتاً من الإبل»',
];

const quickActions = [
  { href: '/memorize', label: 'حفظ', icon: '📖', bg: 'var(--color-emerald-50)', color: 'var(--color-emerald-700)' },
  { href: '/test', label: 'تسميع', icon: '✍️', bg: 'var(--color-gold-50)', color: 'var(--color-gold-700)' },
  { href: '/review', label: 'مراجعة', icon: '🔄', bg: '#eff6ff', color: '#1d4ed8' },
  { href: '/mushaf', label: 'المصحف', icon: '📕', bg: '#fdf2f8', color: '#be185d' },
];

export default function DashboardPage() {
  const { progress, overallProgress, streak, completedCount, currentDay, isDayCompleted } = useProgress();
  const todayDay = getDay(currentDay);
  const message = motivationalMessages[currentDay % motivationalMessages.length];

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Motivational message */}
      <header className="card-glass islamic-border text-center py-5 px-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-emerald-600)' }}>
          بسم الله الرحمن الرحيم
        </h1>
        <p className="text-sm mt-2 quran-text" style={{ color: 'var(--text-secondary)' }}>
          {message}
        </p>
      </header>

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-2 stagger-children">
        {quickActions.map(action => (
          <Link
            key={action.href}
            href={action.href}
            className="card-elevated flex flex-col items-center gap-1.5 py-3 rounded-xl text-center animate-fade-in"
            style={{ backgroundColor: action.bg, color: action.color, padding: '0.75rem 0.5rem' }}
          >
            <span className="text-2xl">{action.icon}</span>
            <span className="text-xs font-bold">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <OverallProgress
            completedCount={completedCount}
            overallProgress={overallProgress}
            currentDay={currentDay}
            progress={progress}
          />
        </div>
        <StreakCounter streak={streak} />
      </div>

      <TodayBrief
        day={todayDay}
        isCompleted={todayDay ? isDayCompleted(todayDay.dayNumber) : false}
      />

      <JuzProgressGrid progress={progress} currentDay={currentDay} />
    </div>
  );
}
