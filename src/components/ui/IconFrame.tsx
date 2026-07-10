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
  /** Continuous gentle float (for hero / feature icons). */
  animated?: boolean;
}

// Brighter, more vivid gradients + luminous icon colors (no more washed-out look).
const toneClasses: Record<IconTone, string> = {
  emerald: 'from-emerald-400/45 to-cyan-400/25 text-emerald-200',
  lime: 'from-lime-400/45 to-emerald-500/25 text-lime-200',
  sky: 'from-sky-400/45 to-emerald-400/25 text-sky-200',
  amber: 'from-amber-300/45 to-emerald-400/25 text-amber-100',
  teal: 'from-teal-300/45 to-cyan-400/25 text-teal-100',
  rose: 'from-rose-300/45 to-emerald-400/25 text-rose-100',
  slate: 'from-slate-200/35 to-emerald-400/20 text-slate-100',
};

// Per-tone glow color used behind the icon so it reads as "lit".
const glowClasses: Record<IconTone, string> = {
  emerald: 'bg-emerald-400/30',
  lime: 'bg-lime-400/30',
  sky: 'bg-sky-400/30',
  amber: 'bg-amber-300/30',
  teal: 'bg-teal-300/30',
  rose: 'bg-rose-300/30',
  slate: 'bg-slate-300/20',
};

const sizeClasses: Record<IconSize, string> = {
  sm: 'h-12 w-12 rounded-lg',
  md: 'h-16 w-16 rounded-xl',
  lg: 'h-20 w-20 rounded-2xl',
  hero: 'h-72 w-72 lg:h-96 lg:w-96 rounded-[2rem]',
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
  animated = false,
}: IconFrameProps) {
  return (
    <div
      className={cn(
        'group/icon relative flex shrink-0 items-center justify-center border border-white/15 bg-gradient-to-br shadow-[0_18px_45px_rgba(15,23,42,0.35)] transition-transform duration-300',
        toneClasses[tone],
        sizeClasses[size],
        animated && 'animate-float-soft',
        className
      )}
    >
      {/* Soft glow so the icon looks lit rather than covered */}
      <div className={cn('absolute inset-0 rounded-[inherit] blur-xl opacity-70', glowClasses[tone])} />
      {/* Top-left light catch */}
      <div className="absolute inset-0 rounded-[inherit] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_60%)]" />
      <Icon
        className={cn(
          'relative stroke-[1.8] drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-transform duration-300 group-hover:scale-110 group-hover/icon:scale-110',
          iconSizeClasses[size],
          iconClassName
        )}
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
    <div
      className={cn(
        'pointer-events-none absolute right-8 top-1/2 hidden -translate-y-1/2 lg:block',
        className
      )}
      aria-hidden="true"
    >
      <div className="relative">
        {/* Pulsing halo */}
        <div className="absolute inset-4 rounded-full bg-brand-primary/20 blur-3xl animate-glow-pulse" />
        {/* Rotating orbit rings */}
        <div className="absolute inset-0 rounded-full border border-dashed border-brand-primary/25 animate-spin-slow" />
        <div className="absolute inset-10 rounded-full border border-brand-primary/15 animate-spin-slower" />
        {/* The icon itself — brighter and floating */}
        <div className="animate-float-slow opacity-70">
          <IconFrame icon={icon} tone={tone} size="hero" iconClassName="stroke-[1.2]" />
        </div>
      </div>
    </div>
  );
}
