'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    className={cn(
      'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full',
      'border-2 border-white/10 bg-white/5',
      'data-[state=checked]:bg-notix-accent data-[state=checked]:border-notix-accent',
      'focus:outline-none focus:ring-2 focus:ring-notix-accent focus:ring-offset-2 focus:ring-offset-notix-bg',
      'disabled:cursor-not-allowed disabled:opacity-50',
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block h-5 w-5 rounded-full bg-white',
        'shadow-lg ring-0',
        'data-[state=checked]:translate-x-5',
        'transition-transform duration-200'
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };