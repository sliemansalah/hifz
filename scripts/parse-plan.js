const fs = require('fs');
const path = require('path');

const mdPath = path.join(__dirname, '..', 'خطة_حفظ_القرآن_الكريم.md');
const outPath = path.join(__dirname, '..', 'src', 'data', 'plan.ts');

const content = fs.readFileSync(mdPath, 'utf-8');
const lines = content.split('\n');

const surahNumbers = {
  'الفاتحة': 1, 'البقرة': 2, 'آل عمران': 3, 'النساء': 4, 'المائدة': 5,
  'الأنعام': 6, 'الأعراف': 7, 'الأنفال': 8, 'التوبة': 9, 'يونس': 10,
  'هود': 11, 'يوسف': 12, 'الرعد': 13, 'إبراهيم': 14, 'الحجر': 15,
  'النحل': 16, 'الإسراء': 17, 'الكهف': 18, 'مريم': 19, 'طه': 20,
  'الأنبياء': 21, 'الحج': 22, 'المؤمنون': 23, 'النور': 24, 'الفرقان': 25,
  'الشعراء': 26, 'النمل': 27, 'القصص': 28, 'العنكبوت': 29, 'الروم': 30,
  'لقمان': 31, 'السجدة': 32, 'الأحزاب': 33, 'سبأ': 34, 'فاطر': 35,
  'يس': 36, 'الصافات': 37, 'ص': 38, 'الزمر': 39, 'غافر': 40,
  'فصلت': 41, 'الشورى': 42, 'الزخرف': 43, 'الدخان': 44, 'الجاثية': 45,
  'الأحقاف': 46, 'محمد': 47, 'الفتح': 48, 'الحجرات': 49, 'ق': 50,
  'الذاريات': 51, 'الطور': 52, 'النجم': 53, 'القمر': 54, 'الرحمن': 55,
  'الواقعة': 56, 'الحديد': 57, 'المجادلة': 58, 'الحشر': 59, 'الممتحنة': 60,
  'الصف': 61, 'الجمعة': 62, 'المنافقون': 63, 'التغابن': 64, 'الطلاق': 65,
  'التحريم': 66, 'الملك': 67, 'القلم': 68, 'الحاقة': 69, 'المعارج': 70,
  'نوح': 71, 'الجن': 72, 'المزمل': 73, 'المدثر': 74, 'القيامة': 75,
  'الإنسان': 76, 'المرسلات': 77, 'النبأ': 78, 'النازعات': 79, 'عبس': 80,
  'التكوير': 81, 'الانفطار': 82, 'المطففين': 83, 'الانشقاق': 84, 'البروج': 85,
  'الطارق': 86, 'الأعلى': 87, 'الغاشية': 88, 'الفجر': 89, 'البلد': 90,
  'الشمس': 91, 'الليل': 92, 'الضحى': 93, 'الشرح': 94, 'التين': 95,
  'العلق': 96, 'القدر': 97, 'البينة': 98, 'الزلزلة': 99, 'العاديات': 100,
  'القارعة': 101, 'التكاثر': 102, 'العصر': 103, 'الهمزة': 104, 'الفيل': 105,
  'قريش': 106, 'الماعون': 107, 'الكوثر': 108, 'الكافرون': 109, 'النصر': 110,
  'المسد': 111, 'الإخلاص': 112, 'الفلق': 113, 'الناس': 114,
};

const days = [];
const fridays = [];
const monthlies = [];
let currentJuz = 0;

for (const line of lines) {
  // Detect juz header
  const juzMatch = line.match(/###\s*📗\s*الجزء\s*(\d+)/);
  if (juzMatch) {
    currentJuz = parseInt(juzMatch[1]);
    continue;
  }

  // Skip non-table lines
  if (!line.startsWith('|')) continue;

  const cells = line.split('|').map(c => c.trim()).filter(c => c);
  if (cells.length < 7) continue;

  const firstCell = cells[0];

  // Skip header rows
  if (firstCell === 'اليوم' || firstCell.startsWith(':---') || firstCell.startsWith('---')) continue;

  // Friday review
  if (firstCell === '🕌') {
    if (days.length > 0) {
      fridays.push({ afterDay: days[days.length - 1].dayNumber, juz: currentJuz });
    }
    continue;
  }

  // Monthly review
  if (firstCell === '📋') {
    const monthMatch = cells[1].match(/الشهر\s*(\d+)/);
    if (monthMatch) {
      monthlies.push({
        month: parseInt(monthMatch[1]),
        afterDay: days.length > 0 ? days[days.length - 1].dayNumber : 0,
      });
    }
    continue;
  }

  // Regular day
  const dayNumber = parseInt(firstCell);
  if (isNaN(dayNumber)) continue;

  const surahName = cells[1].replace(/\*\*/g, '').trim();
  const startAyah = parseInt(cells[2]);
  const endAyah = parseInt(cells[3]);
  const ayahCount = parseInt(cells[4]);
  const nearReview = cells[6] || '';

  if (isNaN(startAyah) || isNaN(endAyah)) continue;

  const surahNumber = surahNumbers[surahName] || 0;
  if (!surahNumber) {
    console.warn(`Unknown surah: "${surahName}" at day ${dayNumber}`);
  }

  days.push({
    dayNumber,
    juz: currentJuz,
    surahName,
    surahNumber,
    startAyah,
    endAyah,
    ayahCount: isNaN(ayahCount) ? (endAyah - startAyah + 1) : ayahCount,
    nearReview,
  });
}

console.log(`Parsed ${days.length} days, ${fridays.length} fridays, ${monthlies.length} monthlies`);

// Generate TypeScript
let ts = `import { PlanDay } from '@/types/plan';\n\n`;
ts += `export const planDays: PlanDay[] = [\n`;

for (const d of days) {
  const nr = d.nearReview.replace(/'/g, "\\'");
  ts += `  { dayNumber: ${d.dayNumber}, juz: ${d.juz}, surahName: '${d.surahName}', surahNumber: ${d.surahNumber}, startAyah: ${d.startAyah}, endAyah: ${d.endAyah}, ayahCount: ${d.ayahCount}, nearReview: '${nr}' },\n`;
}

ts += `];\n\n`;

ts += `export const fridayReviews: { afterDay: number; juz: number }[] = [\n`;
for (const f of fridays) {
  ts += `  { afterDay: ${f.afterDay}, juz: ${f.juz} },\n`;
}
ts += `];\n\n`;

ts += `export const monthlyReviews: { month: number; afterDay: number }[] = [\n`;
for (const m of monthlies) {
  ts += `  { month: ${m.month}, afterDay: ${m.afterDay} },\n`;
}
ts += `];\n\n`;

ts += `export function getDaysByJuz(juz: number): PlanDay[] {\n  return planDays.filter(d => d.juz === juz);\n}\n\n`;
ts += `export function getDay(dayNumber: number): PlanDay | undefined {\n  return planDays.find(d => d.dayNumber === dayNumber);\n}\n\n`;
ts += `export const TOTAL_DAYS = ${days.length};\nexport const TOTAL_JUZ = 30;\n`;

fs.writeFileSync(outPath, ts, 'utf-8');
console.log(`Written to ${outPath} (${ts.length} bytes)`);
