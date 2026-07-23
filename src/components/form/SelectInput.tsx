import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { ValidationMessage } from './ValidationMessage';

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  error?: string;
  errorId?: string;
  placeholder?: string;
  containerClassName?: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  (
    {
      label,
      options,
      error,
      errorId,
      placeholder = 'اختر...',
      containerClassName = '',
      className = '',
      id,
      required,
      ...props
    },
    ref,
  ) => {
    const selectId = id || props.name;

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        <label htmlFor={selectId} className="text-sm font-bold text-primary">
          {label}
          {required && <span className="mr-1 text-red-500">*</span>}
        </label>
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={`w-full appearance-none rounded-2xl border bg-white px-4 py-3 pl-10 text-sm text-ink transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 ${
              error
                ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
                : 'border-secondary-100 focus:border-secondary'
            } ${className}`}
            {...props}
          >
            <option value="" disabled>
              {placeholder}
            </option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute inset-y-0 left-3 my-auto h-5 w-5 text-muted"
            aria-hidden="true"
          />
        </div>
        {error && <ValidationMessage id={errorId}>{error}</ValidationMessage>}
      </div>
    );
  },
);

SelectInput.displayName = 'SelectInput';
