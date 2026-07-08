import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: 'default' | 'dark' | 'darker';
  container?: boolean;
}

export function Section({
  children,
  variant = 'default',
  container = true,
  className,
  ...props
}: SectionProps) {
  const content = container ? (
    <div className="container mx-auto px-4 lg:px-6 max-w-screen-2xl">{children}</div>
  ) : (
    children
  );

  return (
    <section
      className={cn(
        'py-20 lg:py-32',
        {
          'bg-background-primary': variant === 'default',
          'bg-background-secondary': variant === 'dark',
          'bg-background-tertiary': variant === 'darker',
        },
        className
      )}
      {...props}
    >
      {content}
    </section>
  );
}
