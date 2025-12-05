import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center font-semibold transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          
          // Size variants
          {
            'px-6 py-2 text-sm': size === 'sm',
            'px-8 py-4 text-base': size === 'md',
            'px-10 py-5 text-lg': size === 'lg',
          },
          
          // Color variants
          {
            'bg-brand-primary text-background-primary hover:bg-brand-secondary hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(34,197,94,0.3)]':
              variant === 'primary',
            'bg-background-tertiary border border-border-primary text-text-primary hover:border-brand-primary hover:bg-background-secondary':
              variant === 'secondary',
            'bg-transparent text-text-secondary hover:text-brand-primary':
              variant === 'ghost',
          },
          
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
