import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface QuizTimerProps {
  durationMinutes: number;
  startedAt: string;
  onTimeUp: () => void;
}

export function QuizTimer({ durationMinutes, startedAt, onTimeUp }: QuizTimerProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const start = new Date(startedAt).getTime();
    const totalSeconds = durationMinutes * 60;

    function update() {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = Math.max(0, totalSeconds - elapsed);
      setRemaining(left);
      if (left <= 0) {
        onTimeUp();
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [durationMinutes, startedAt, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  const isLow = remaining <= 60;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
        isLow
          ? 'bg-red-50 text-red-600'
          : 'bg-secondary-50 text-secondary-700'
      }`}
      role="timer"
      aria-live="off"
      aria-label={`الوقت المتبقي: ${minutes} دقيقة و ${seconds} ثانية`}
    >
      <Clock className="h-4 w-4" aria-hidden="true" />
      <span dir="ltr">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
