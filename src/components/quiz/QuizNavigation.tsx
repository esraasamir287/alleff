import { ArrowRight, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

interface QuizNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
  canProceed: boolean;
  submitting: boolean;
}

export function QuizNavigation({
  onPrevious,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  canProceed,
  submitting,
}: QuizNavigationProps) {
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirst}
        className="inline-flex items-center gap-2 rounded-full border-2 border-secondary-100 bg-white px-5 py-3 text-sm font-bold text-primary transition-all hover:border-secondary-200 hover:bg-soft disabled:opacity-40 disabled:pointer-events-none"
      >
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
        السابق
      </button>

      {isLast ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed || submitting}
          className="inline-flex items-center gap-2 rounded-full brand-gradient px-6 py-3 text-sm font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-soft-lg disabled:opacity-50 disabled:pointer-events-none"
        >
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              جارٍ التسليم...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              مراجعة وتسليم الامتحان
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-bold text-white shadow-soft transition-all hover:bg-secondary-800 hover:-translate-y-0.5 disabled:opacity-40 disabled:pointer-events-none"
        >
          التالي
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
