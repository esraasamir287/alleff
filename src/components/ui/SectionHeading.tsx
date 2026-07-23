import type { ReactNode } from 'react';

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'center' | 'start';
  id?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  id,
}: SectionHeadingProps) {
  const isCenter = align === 'center';

  return (
    <div
      id={id}
      className={`flex flex-col gap-3 ${isCenter ? 'items-center text-center' : 'items-start text-start'}`}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary-50 px-4 py-1.5 text-sm font-bold text-secondary-700">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {eyebrow}
        </span>
      )}
      <h2 className="max-w-2xl text-3xl font-extrabold leading-tight text-primary sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
