import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  as?: 'button' | 'a' | 'link';
  href?: string;
  to?: string;
  target?: string;
  rel?: string;
  children: ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'brand-gradient text-white shadow-soft hover:shadow-soft-lg hover:-translate-y-0.5',
  secondary:
    'bg-secondary text-white shadow-soft hover:bg-secondary-800 hover:-translate-y-0.5',
  accent:
    'bg-accent text-primary shadow-soft hover:bg-accent-light hover:-translate-y-0.5',
  outline:
    'border-2 border-secondary text-secondary bg-transparent hover:bg-secondary hover:text-white',
  ghost:
    'text-primary bg-transparent hover:bg-soft',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 disabled:opacity-60 disabled:pointer-events-none';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      as = 'button',
      href,
      to,
      target,
      rel,
      children,
      className = '',
      ...props
    },
    ref,
  ) => {
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    if (as === 'link' && to) {
      return (
        <Link to={to} className={classes} aria-label={props['aria-label']} onClick={props.onClick}>
          {children}
        </Link>
      );
    }

    if (as === 'a' && href) {
      return (
        <a
          href={href}
          target={target}
          rel={rel}
          className={classes}
          aria-label={props['aria-label']}
        >
          {children}
        </a>
      );
    }

    return (
      <button ref={ref} className={classes} {...props}>
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
