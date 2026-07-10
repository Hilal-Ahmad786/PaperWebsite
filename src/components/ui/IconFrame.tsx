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

/**
 * Centered, always-visible animated hero emblem: a themed icon in a glowing
 * glass tile that floats continuously. Works on every screen size (unlike the
 * side HeroIconFrame), so centered heroes still get clear, live motion.
 */
export function HeroEmblem({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex justify-center animate-fade-up', className)}>
      <div className="relative animate-float-soft">
        <div className="absolute inset-0 rounded-2xl bg-brand-primary/25 blur-2xl animate-glow-pulse" />
        <div className="relative grid h-20 w-20 place-items-center rounded-2xl border border-white/15 bg-gradient-to-br from-brand-primary/30 to-emerald-400/10 shadow-2xl backdrop-blur-md lg:h-24 lg:w-24">
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_60%)]" />
          <Icon
            className="relative h-10 w-10 text-brand-primary drop-shadow-[0_4px_16px_rgba(34,197,94,0.45)] lg:h-12 lg:w-12"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Inner-page hero visual: a small stack of drifting "paper sheets" with the
 * page's themed icon floating on top — a grounded, on-brand animation (paper
 * board) rather than an abstract spinning badge. Decorative, desktop-only.
 */
export function HeroIconFrame({
  icon: Icon,
  className,
}: Pick<IconFrameProps, 'icon' | 'tone' | 'className'>) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 xl:right-12 lg:block',
        className
      )}
      aria-hidden="true"
    >
      <div className="relative h-72 w-64 lg:h-80 lg:w-72">
        {/* Soft glow */}
        <div className="absolute inset-8 rounded-[3rem] bg-brand-primary/15 blur-3xl animate-glow-pulse" />

        {/* Drifting paper / board sheets */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-64 w-48 lg:h-72 lg:w-52">
            <div className="absolute inset-0 -rotate-[14deg] rounded-2xl border border-white/10 bg-gradient-to-br from-slate-200/10 to-slate-500/5 shadow-xl backdrop-blur-sm animate-float-slow [animation-duration:8.5s]" />
            <div className="absolute inset-0 -rotate-[5deg] rounded-2xl border border-white/12 bg-gradient-to-br from-slate-100/12 to-slate-400/5 shadow-xl backdrop-blur-sm animate-float-slow [animation-duration:7s] [animation-delay:0.5s]" />
            <div className="absolute inset-0 rotate-[7deg] rounded-2xl border border-white/15 bg-gradient-to-br from-emerald-300/12 to-cyan-400/5 shadow-xl backdrop-blur-sm animate-float-slow [animation-duration:7.8s] [animation-delay:1s]" />
          </div>
        </div>

        {/* Themed icon tile floating on top */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-float-soft">
            <div className="relative grid h-28 w-28 place-items-center rounded-3xl border border-white/15 bg-gradient-to-br from-brand-primary/30 to-emerald-400/10 shadow-2xl backdrop-blur-md lg:h-32 lg:w-32">
              <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.28),transparent_60%)]" />
              <Icon
                className="relative h-14 w-14 text-brand-primary drop-shadow-[0_4px_16px_rgba(34,197,94,0.45)] lg:h-16 lg:w-16"
                strokeWidth={1.4}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
