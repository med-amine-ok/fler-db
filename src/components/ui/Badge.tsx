import React from 'react';
import { cn } from './Button';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
        {
          'bg-gray-100 text-gray-600': variant === 'default',
          'bg-secondary/10 text-secondary': variant === 'success',
          'bg-orange-50 text-orange-600': variant === 'warning',
          'bg-red-50 text-red-600': variant === 'error',
          'bg-transparent border border-gray-200 text-gray-500': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  );
};
