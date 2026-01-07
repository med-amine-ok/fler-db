import React, { type InputHTMLAttributes } from 'react';
import { cn } from './Button';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-sm font-semibold text-gray-700 ml-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-text outline-none transition-all duration-200 placeholder:text-gray-400',
            'focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500 ml-1 font-medium">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
