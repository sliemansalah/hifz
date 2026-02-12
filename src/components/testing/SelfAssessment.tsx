'use client';

interface SelfAssessmentProps {
  audioUrl: string | null;
  originalText: string;
  onAssess: (score: number) => void;
}

const assessmentOptions = [
  { label: 'ضعيف', score: 40, color: '#ef4444', desc: 'أخطاء كثيرة وتوقفات' },
  { label: 'مقبول', score: 60, color: '#f97316', desc: 'بعض الأخطاء والتردد' },
  { label: 'جيد', score: 80, color: '#eab308', desc: 'أخطاء قليلة' },
  { label: 'ممتاز', score: 95, color: 'var(--color-emerald-600)', desc: 'خطأ أو خطآن فقط' },
  { label: 'متقن', score: 100, color: 'var(--color-emerald-600)', desc: 'بدون أي أخطاء' },
];

export default function SelfAssessment({ audioUrl, originalText, onAssess }: SelfAssessmentProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-center">قيّم تسميعك</h3>

      {/* Audio playback + original text side by side */}
      <div className="grid grid-cols-1 gap-3">
        {audioUrl && (
          <div className="card p-3">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>تسجيلك:</p>
            <audio src={audioUrl} controls className="w-full" />
          </div>
        )}

        <div className="card p-3">
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>النص الأصلي:</p>
          <p className="quran-text text-lg leading-loose">{originalText}</p>
        </div>
      </div>

      {/* Assessment buttons */}
      <p className="text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
        استمع لتسجيلك وقارنه بالنص، ثم اختر تقييمك:
      </p>
      <div className="space-y-2">
        {assessmentOptions.map(opt => (
          <button key={opt.score}
            onClick={() => onAssess(opt.score)}
            className="w-full p-3 rounded-lg text-right flex items-center justify-between transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div>
              <span className="font-bold" style={{ color: opt.color }}>{opt.label}</span>
              <span className="text-xs mr-2" style={{ color: 'var(--text-secondary)' }}>({opt.score}%)</span>
            </div>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{opt.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
