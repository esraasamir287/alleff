import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { governorates } from '../../data/governorates';
import { ValidationMessage } from './ValidationMessage';

interface SearchableGovernorateSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  errorId?: string;
  name?: string;
  required?: boolean;
  placeholder?: string;
}

export function SearchableGovernorateSelect({
  label,
  value,
  onChange,
  error,
  errorId,
  name = 'governorate',
  required,
  placeholder = 'ابحث عن المحافظة...',
}: SearchableGovernorateSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = governorates.filter((g) => g.includes(query.trim()));

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(-1);
    }
  }, [open]);

  const selectGovernorate = (g: string) => {
    onChange(g);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        selectGovernorate(filtered[activeIndex]);
      }
    }
  };

  useEffect(() => {
    if (open && activeIndex >= 0 && listRef.current) {
      const el = listRef.current.children[activeIndex] as HTMLElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, open]);

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-bold text-primary">
        {label}
        {required && <span className="mr-1 text-red-500">*</span>}
      </label>
      <div ref={containerRef} className="relative">
        {/* Hidden input for form submission semantics */}
        <input type="hidden" name={name} value={value} />

        {/* Trigger */}
        <button
          type="button"
          id={name}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={onKeyDown}
          className={`flex w-full items-center justify-between rounded-2xl border bg-white px-4 py-3 text-sm text-ink transition-all focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-1 ${
            error
              ? 'border-red-400 focus:border-red-400 focus:ring-red-400'
              : 'border-secondary-100 focus:border-secondary'
          }`}
        >
          <span className={value ? 'text-ink' : 'text-muted/60'}>
            {value || placeholder}
          </span>
          <ChevronDown
            className={`h-5 w-5 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {/* Popover */}
        {open && (
          <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-soft-lg">
            <div className="flex items-center gap-2 border-b border-secondary-50 px-3 py-2.5">
              <Search className="h-4 w-4 text-muted" aria-hidden="true" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={onKeyDown}
                placeholder="ابحث..."
                aria-label="بحث عن المحافظة"
                className="w-full bg-transparent text-sm text-ink placeholder:text-muted/60 focus:outline-none"
                autoFocus
              />
            </div>
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-52 overflow-y-auto py-1"
            >
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-center text-sm text-muted">
                  لا توجد نتائج
                </li>
              )}
              {filtered.map((g, i) => (
                <li key={g} role="option" aria-selected={g === value}>
                  <button
                    type="button"
                    onClick={() => selectGovernorate(g)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                      i === activeIndex
                        ? 'bg-secondary-50 text-secondary-700'
                        : 'text-ink hover:bg-soft'
                    }`}
                  >
                    <span>{g}</span>
                    {g === value && <Check className="h-4 w-4 text-secondary" aria-hidden="true" />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {error && <ValidationMessage id={errorId}>{error}</ValidationMessage>}
    </div>
  );
}
