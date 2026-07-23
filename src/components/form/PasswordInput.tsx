import { forwardRef, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { ValidationMessage } from './ValidationMessage';

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  errorId?: string;
  show: boolean;
  onToggleShow: () => void;
  containerClassName?: string;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      errorId,
      show,
      onToggleShow,
      containerClassName = '',
      className = '',
      id,
      required,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        <label htmlFor={inputId} className="text-sm font-bold text-primary">
          {label}
          {required && <span className="mr-1 text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={show ? 'text' : 'password'}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`w-full rounded-2xl border bg-white px-4 py-3 pl-11 text-sm text-ink transition-all placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 ${
              error
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-secondary-100 focus:border-secondary'
            } ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={onToggleShow}
            aria-label={show ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            className="absolute inset-y-0 left-0 flex items-center px-3.5 text-muted transition-colors hover:text-primary"
            tabIndex={-1}
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
        {error && <ValidationMessage id={errorId}>{error}</ValidationMessage>}
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
