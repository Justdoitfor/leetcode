import React from 'react';
import { cn } from './Card';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        // Variants
        variant === 'primary' && 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] focus:ring-[var(--color-primary)]',
        variant === 'secondary' && 'bg-white text-[var(--color-text-secondary)] border border-[var(--color-border-strong)] hover:bg-[#F1EFE8] focus:ring-gray-200',
        variant === 'danger' && 'bg-[var(--color-hard)] text-white hover:bg-red-800 focus:ring-red-600',
        variant === 'ghost' && 'bg-transparent text-[var(--color-text-secondary)] hover:bg-gray-100 focus:ring-gray-200',
        // Sizes
        size === 'sm' && 'rounded-[var(--radius-sm)] px-2 py-1 text-xs',
        size === 'md' && 'rounded-[var(--radius-md)] px-3.5 py-1.5 text-[13px]',
        size === 'lg' && 'rounded-[var(--radius-md)] px-5 py-2.5 text-sm',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
