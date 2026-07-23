import type { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationMessageProps {
  id?: string;
  children?: ReactNode;
}

export function ValidationMessage({ id, children }: ValidationMessageProps) {
  if (!children) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  );
}
