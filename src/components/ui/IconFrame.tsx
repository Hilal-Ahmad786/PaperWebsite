import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type IconTone = 'emerald' | 'lime' | 'sky' | 'amber' | 'teal' | 'rose' | 'slate';
export type IconSize = 'sm' | 'md' | 'lg' | 'hero';

interface IconFrameProps {
  icon: LucideIcon;
  tone?: IconTone;
  size?: IconSize;
  className?: string;
  iconClassName?: string;
  decorative?: boolean;
}

const toneClasses: Record<IconTone, string> = {
  emerald: 'from-emerald-400/30 to-cyan-400/20 text-emerald-300',
  lime: 'from-lime-400/30 to-emerald-500/20 text-lime-300',
  sky: 'from-sky-400/30 to-emerald-400/20 text-sky-300',
  amber: 'from-amber-300/30 to-emerald-400/20 text-amber-200',
  teal: 'from-teal-300/30 to-slate-300/20 text-teal-200',
  rose: 'from-rose-300/30 to-emerald-400/20 text-rose-200',
  slate: 'from-slate-300/25 to-emerald-400/15 text-slate-200',
};

const sizeClasses: Record<IconSize, string> = {
  sm: 'h-12 w-12',
  md: 'h-16 w-16',
  lg: 'h-20 w-20',
  hero: 'h-72 w-72 lg:h-96 lg:w-96',
};

const iconSizeClasses: Record<IconSize, string> = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8',
  lg: 'h-10 w-10',
  hero: 'h-32 w-32 lg:h-44 lg:w-44',
};

export function IconFrame({
  icon: Icon,
  tone = 'emerald',
  size = 'md',
  className,
  iconClassName,
  decorative = true,
}: IconFrameProps) {
  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br shadow-[0_18px_45px_rgba(15,23,42,0.35)]',
        toneClasses[tone],
        sizeClasses[size],
        className
      )}
    >
      <div className="absolute inset-2 rounded-md border border-white/10" />
      <Icon
        className={cn('relative stroke-[1.8]', iconSizeClasses[size], iconClassName)}
        aria-hidden={decorative ? 'true' : undefined}
      />
    </div>
  );
}

export function HeroIconFrame({
  icon,
  tone = 'emerald',
  className,
}: Pick<IconFrameProps, 'icon' | 'tone' | 'className'>) {
  return (
    <div className={cn('absolute right-8 top-1/2 hidden -translate-y-1/2 opacity-25 pointer-events-none lg:block', className)}>
      <IconFrame icon={icon} tone={tone} size="hero" iconClassName="stroke-[1.15]" />
    </div>
  );
}
