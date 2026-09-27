import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-notix-accent focus:ring-offset-2 focus:ring-offset-notix-bg',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-notix-accent text-notix-bg hover:bg-notix-accentHover',
        secondary: 'border-white/10 bg-notix-surface text-notix-text hover:bg-notix-surfaceHover',
        destructive: 'border-transparent bg-red-600/20 text-red-400 hover:bg-red-600/30',
        outline: 'border-white/10 bg-transparent text-notix-text hover:bg-white/5',
        success: 'border-transparent bg-green-600/20 text-green-400 hover:bg-green-600/30',
        warning: 'border-transparent bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };