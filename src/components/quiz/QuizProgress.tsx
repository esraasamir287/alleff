interface QuizProgressProps {
  current: number;
  total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="flex flex-col gap-2" role="group" aria-label="تقدّم الامتحان">
      <div className="flex items-center justify-between text-sm font-bold text-primary">
        <span aria-live="polite">
          السؤال {current} من {total}
        </span>
        <span className="text-muted">{percent}%</span>
      </div>
      <div
        className="h-2.5 w-full overflow-hidden rounded-full bg-secondary-100"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-label="شريط التقدّم"
      >
        <div
          className="h-full rounded-full brand-gradient transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
