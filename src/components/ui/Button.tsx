import React, { type ButtonHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          {
            'bg-primary text-white hover:bg-primary/90 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30': variant === 'primary',
            'bg-secondary text-white hover:bg-secondary/90 shadow-md shadow-secondary/20': variant === 'secondary',
            'bg-transparent border-2 border-gray-200 text-gray-700 hover:border-primary hover:text-primary': variant === 'outline',
            'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-dark': variant === 'ghost',
            'bg-red-50 text-red-600 hover:bg-red-100': variant === 'danger',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-5 py-2.5 text-base': size === 'md',
            'px-6 py-3.5 text-lg': size === 'lg',
            'w-full': fullWidth,
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
