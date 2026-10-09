'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 shadow-sm',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:ring-slate-500 border border-slate-200',
      outline:
        'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 focus-visible:ring-indigo-500',
      ghost:
        'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-500',
      destructive:
        'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
      xl: 'px-8 py-4 text-lg gap-3',
    };

    const width = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], width, className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : icon && iconPosition === 'left' ? (
          <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
        ) : null}
        {children}
        {icon && iconPosition === 'right' && !loading && (
          <span className="flex-shrink-0" aria-hidden="true">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';