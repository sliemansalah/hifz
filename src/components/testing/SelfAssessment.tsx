'use client';

interface SelfAssessmentProps {
  audioUrl: string | null;
  originalText: string;
  onAssess: (score: number) => void;
}

const assessmentOptions = [
  { label: 'ضعيف', score: 40, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', desc: 'أخطاء كثيرة وتوقفات' },
  { label: 'مقبول', score: 60, color: '#f97316', bg: 'rgba(249,115,22,0.1)', desc: 'بعض الأخطاء والتردد' },
  { label: 'جيد', score: 80, color: '#eab308', bg: 'rgba(234,179,8,0.1)', desc: 'أخطاء قليلة' },
  { label: 'ممتاز', score: 95, color: 'var(--color-emerald-600)', bg: 'rgba(5,150,105,0.1)', desc: 'خطأ أو خطآن فقط' },
  { label: 'متقن', score: 100, color: 'var(--color-emerald-600)', bg: 'rgba(5,150,105,0.15)', desc: 'بدون أي أخطاء' },
];

export default function SelfAssessment({ audioUrl, originalText, onAssess }: SelfAssessmentProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-center">قيّم تسميعك</h3>

      {/* Audio playback + original text side by side on wider screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {audioUrl && (
          <div className="card p-3">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>تسجيلك:</p>
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}

        <div className={`card p-3 ${!audioUrl ? 'md:col-span-2' : ''}`}>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>النص الأصلي:</p>
          <p className="quran-text text-lg leading-loose">{originalText}</p>
        </div>
      </div>

      {/* Assessment buttons */}
      <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
        استمع لتسجيلك وقارنه بالنص، ثم اختر تقييمك:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {assessmentOptions.map(opt => (
          <button key={opt.score}
            onClick={() => onAssess(opt.score)}
            className="p-3 rounded-lg text-right flex items-center justify-between transition-all hover:scale-[1.02] active:scale-95"
            style={{ backgroundColor: opt.bg, borderWidth: '1px', borderColor: opt.color }}>
            <div>
              <span className="font-bold text-base" style={{ color: opt.color }}>{opt.label}</span>
              <span className="text-xs mr-2" style={{ color: 'var(--text-secondary)' }}>({opt.score}%)</span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
