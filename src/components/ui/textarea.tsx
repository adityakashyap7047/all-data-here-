'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-white/10 bg-notix-surface px-3 py-2 text-sm text-notix-text placeholder:text-notix-textMuted/50',
          'transition-all duration-200',
          'focus:border-notix-accent focus:outline-none focus:ring-2 focus:ring-notix-accent/20',
          'disabled:opacity-50 disabled:pointer-events-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };