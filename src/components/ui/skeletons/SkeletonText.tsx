import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface SkeletonTextProps {
    lines?: number;
    className?: string;
    variant?: 'short' | 'medium' | 'long';
}

export function SkeletonText({ lines = 3, className, variant = 'long' }: SkeletonTextProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {Array.from({ length: lines }).map((_, i) => {
                // Vary width for last line to look natural
                const isLast = i === lines - 1;
                let widthClass = "w-full";

                if (isLast) {
                    if (variant === 'short') widthClass = "w-1/3";
                    else if (variant === 'medium') widthClass = "w-1/2";
                    else widthClass = "w-3/4";
                }

                return (
                    <Skeleton
                        key={i}
                        className={cn("h-4", widthClass)}
                    />
                );
            })}
        </div>
    );
}
