import { Layers, Recycle, Globe2, Ship, Scroll, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Animated, business-themed hero visual (paper board, recycling, global trade,
 * shipping, reels). Pure CSS animation — floats and rotates continuously so the
 * hero feels alive. Decorative and desktop-only; respects reduced-motion.
 */
function FloatingBadge({
  icon: Icon,
  className,
  iconClass,
  delay,
  duration,
}: {
  icon: LucideIcon;
  className: string;
  iconClass: string;
  delay: string;
  duration: string;
}) {
  return (
    <div
      className={cn('absolute animate-float-slow', className)}
      style={{ animationDelay: delay, animationDuration: duration }}
    >
      <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/15 bg-background-tertiary/70 shadow-xl backdrop-blur-md xl:h-[4.5rem] xl:w-[4.5rem]">
        <Icon className={cn('h-7 w-7 xl:h-8 xl:w-8', iconClass)} strokeWidth={1.6} />
      </div>
    </div>
  );
}

export function HeroVisual() {
  return (
    <div
      className="pointer-events-none absolute right-0 top-1/2 hidden -translate-y-1/2 xl:right-8 xl:block"
      aria-hidden="true"
    >
      <div className="relative h-[26rem] w-[26rem] xl:h-[30rem] xl:w-[30rem]">
        {/* Ambient glow */}
        <div className="absolute inset-16 rounded-full bg-brand-primary/20 blur-3xl animate-glow-pulse" />

        {/* Rotating orbit rings */}
        <div className="absolute inset-6 rounded-full border border-dashed border-brand-primary/25 animate-spin-slow" />
        <div className="absolute inset-24 rounded-full border border-brand-primary/15 animate-spin-slower" />

        {/* Central board-stack icon (floats gently) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-float-slow">
            <div className="grid h-36 w-36 place-items-center rounded-[2rem] border border-white/15 bg-gradient-to-br from-brand-primary/30 to-emerald-400/10 shadow-2xl backdrop-blur-sm xl:h-40 xl:w-40">
              <div className="absolute inset-0 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_60%)]" />
              <Layers className="relative h-16 w-16 text-brand-primary drop-shadow-[0_4px_16px_rgba(34,197,94,0.5)] xl:h-20 xl:w-20" strokeWidth={1.4} />
            </div>
          </div>
        </div>

        {/* Orbiting business icons */}
        <FloatingBadge icon={Recycle} iconClass="text-lime-300" className="left-4 top-10" delay="0s" duration="6s" />
        <FloatingBadge icon={Globe2} iconClass="text-sky-300" className="right-2 top-24" delay="1.1s" duration="7s" />
        <FloatingBadge icon={Ship} iconClass="text-emerald-300" className="bottom-16 left-2" delay="0.5s" duration="6.5s" />
        <FloatingBadge icon={Scroll} iconClass="text-amber-200" className="bottom-8 right-12" delay="1.7s" duration="7.5s" />
      </div>
    </div>
  );
}
