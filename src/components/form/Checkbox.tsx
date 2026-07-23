import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

interface CheckboxProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: ReactNode;
  error?: string;
  errorId?: string;
  required?: boolean;
}

export function Checkbox({
  id,
  checked,
  onChange,
  label,
  error,
  errorId,
  required,
}: CheckboxProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-2.5">
        <button
          type="button"
          role="checkbox"
          id={id}
          aria-checked={checked}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          onClick={() => onChange(!checked)}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 ${
            checked
              ? 'brand-gradient border-transparent text-white'
              : 'border-secondary-200 bg-white'
          }`}
        >
          {checked && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
        <label htmlFor={id} className="cursor-pointer text-sm leading-relaxed text-ink">
          {label}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="mr-7 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
