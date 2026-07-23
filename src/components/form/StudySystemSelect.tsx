import { Check } from 'lucide-react';
import { ValidationMessage } from './ValidationMessage';

export type StudySystemValue = 'arabic' | 'languages';

interface StudySystemOption {
  value: StudySystemValue;
  label: string;
  description: string;
}

const OPTIONS: StudySystemOption[] = [
  { value: 'arabic', label: 'عربي', description: 'نظام الدراسة باللغة العربية' },
  { value: 'languages', label: 'لغات', description: 'نظام الدراسة باللغات' },
];

interface StudySystemSelectProps {
  name: string;
  label: string;
  value: string;
  onChange: (value: StudySystemValue) => void;
  error?: string;
  errorId?: string;
  required?: boolean;
}

export function StudySystemSelect({
  name,
  label,
  value,
  onChange,
  error,
  errorId,
  required,
}: StudySystemSelectProps) {
  const groupName = `${name}-group`;

  return (
    <div className="flex flex-col gap-1.5" role="radiogroup" aria-label={label}>
      <span className="text-sm font-bold text-primary">
        {label}
        {required && <span className="mr-1 text-red-500">*</span>}
      </span>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          const inputId = `${name}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`group relative flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all focus-within:ring-2 focus-within:ring-secondary focus-within:ring-offset-1 ${
                selected
                  ? 'border-secondary bg-secondary-50'
                  : 'border-secondary-100 bg-white hover:border-secondary-200'
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={groupName}
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                aria-checked={selected}
                className="sr-only"
              />
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                  selected ? 'brand-gradient border-transparent' : 'border-secondary-200 bg-white'
                }`}
                aria-hidden="true"
              >
                {selected && <Check className="h-3 w-3 text-white" />}
              </span>
              <span className="flex flex-col">
                <span className={`text-sm font-extrabold ${selected ? 'text-primary' : 'text-ink'}`}>
                  {option.label}
                </span>
                <span className="text-xs text-muted">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>

      {error && <ValidationMessage id={errorId}>{error}</ValidationMessage>}
    </div>
  );
}
