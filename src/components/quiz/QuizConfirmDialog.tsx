import { AlertTriangle } from 'lucide-react';

interface QuizConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}

export function QuizConfirmDialog({ open, onConfirm, onCancel, submitting }: QuizConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-primary/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quiz-confirm-title"
    >
      <div className="w-full max-w-md rounded-4xl bg-white p-6 shadow-soft-lg sm:p-8">
        <div className="mb-5 flex flex-col items-center text-center">
          <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/20">
            <AlertTriangle className="h-7 w-7 text-accent-dark" aria-hidden="true" />
          </span>
          <h2 id="quiz-confirm-title" className="text-xl font-extrabold text-primary">
            تأكيد تسليم الامتحان
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            هل أنت متأكد من تسليم الامتحان؟ لن تتمكن من تعديل إجاباتك بعد التسليم.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="flex-1 rounded-full border-2 border-secondary-100 bg-white px-5 py-3 text-sm font-bold text-primary transition-all hover:bg-soft disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 rounded-full brand-gradient px-5 py-3 text-sm font-bold text-white shadow-soft transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {submitting ? 'جارٍ التسليم...' : 'تسليم الامتحان'}
          </button>
        </div>
      </div>
    </div>
  );
}
