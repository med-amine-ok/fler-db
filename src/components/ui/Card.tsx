import React, { type HTMLAttributes } from 'react';
import { cn } from './Button'; // Reusing cn utility

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-2xl border border-gray-100 shadow-sm transition-all duration-300',
          hover && 'hover:shadow-lg hover:-translate-y-1 hover:border-primary/20 cursor-pointer',
          className
        )}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';
