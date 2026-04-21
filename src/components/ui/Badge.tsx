import React from 'react';
import { cn } from './Card';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'Easy' | 'Medium' | 'Hard' | 'default';
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors',
        variant === 'Easy' && 'bg-[var(--color-easy-bg)] text-[var(--color-easy)]',
        variant === 'Medium' && 'bg-[var(--color-medium-bg)] text-[var(--color-medium)]',
        variant === 'Hard' && 'bg-[var(--color-hard-bg)] text-[var(--color-hard)]',
        variant === 'default' && 'bg-gray-100 text-gray-800',
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
