import type { ReactNode } from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  visual: ReactNode;
}

export function AuthLayout({ title, subtitle, children, visual }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-soft">
      {/* Compact visual on mobile/tablet, full visual on desktop */}
      <div className="lg:hidden">
        <div className="mx-auto max-w-md px-4 pt-6">{visual}</div>
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-16">
        {/* Form column (start in RTL) */}
        <div className="order-2 lg:order-1">
          <div className="mx-auto w-full max-w-md rounded-4xl border border-secondary-100 bg-white p-6 shadow-soft-lg sm:p-8">
            <div className="mb-6 flex flex-col gap-2 text-start">
              <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm leading-relaxed text-muted">{subtitle}</p>
              )}
            </div>
            {children}
          </div>
        </div>

        {/* Visual column (hidden on mobile, shown above on desktop) */}
        <div className="order-1 hidden lg:order-2 lg:block">{visual}</div>
      </div>
    </div>
  );
}
