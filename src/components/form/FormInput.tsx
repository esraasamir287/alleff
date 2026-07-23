import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { ValidationMessage } from './ValidationMessage';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: ReactNode;
  errorId?: string;
  containerClassName?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      hint,
      errorId,
      containerClassName = '',
      className = '',
      id,
      required,
      ...props
    },
    ref,
  ) => {
    const inputId = id || props.name;
    const describedBy = error ? errorId : undefined;

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        <label htmlFor={inputId} className="text-sm font-bold text-primary">
          {label}
          {required && <span className="mr-1 text-red-500">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-ink transition-all placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
              : 'border-secondary-100 focus:border-secondary'
          } ${className}`}
          {...props}
        />
        {hint && !error && <span className="text-xs text-muted">{hint}</span>}
        {error && (
          <ValidationMessage id={errorId}>{error}</ValidationMessage>
        )}
      </div>
    );
  },
);

FormInput.displayName = 'FormInput';
