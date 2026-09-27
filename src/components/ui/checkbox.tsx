'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-4 w-4 rounded-md border border-white/20',
      'bg-notix-surface',
      'data-[state=checked]:bg-notix-accent data-[state=checked]:border-notix-accent',
      'data-[state=checked]:text-notix-bg',
      'focus:outline-none focus:ring-2 focus:ring-notix-accent focus:ring-offset-2 focus:ring-offset-notix-bg',
      'disabled:opacity-50 disabled:pointer-events-none',
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="w-3 h-3" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

export { Checkbox };