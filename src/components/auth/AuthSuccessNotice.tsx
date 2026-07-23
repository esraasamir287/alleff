import { CheckCircle2 } from 'lucide-react';

interface AuthSuccessNoticeProps {
  message: string;
}

export function AuthSuccessNotice({ message }: AuthSuccessNoticeProps) {
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3.5"
    >
      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" aria-hidden="true" />
      <p className="text-sm font-bold text-green-700">{message}</p>
    </div>
  );
}
