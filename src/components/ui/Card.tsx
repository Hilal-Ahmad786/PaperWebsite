import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
  border?: boolean;
}

export function Card({
  children,
  hover = false,
  border = true,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'bg-background-secondary p-8 rounded-none',
        border && 'border border-border-primary',
        hover && 'transition-all duration-300 hover:border-brand-primary hover:-translate-y-1 hover:shadow-2xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
