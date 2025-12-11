import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface SkeletonImageProps {
    aspectRatio?: 'square' | 'video' | 'portrait';
    className?: string;
}

export function SkeletonImage({ aspectRatio = 'video', className }: SkeletonImageProps) {
    return (
        <div className={cn("relative w-full overflow-hidden rounded-lg", className)}>
            <div className={cn(
                "w-full",
                aspectRatio === 'square' && "aspect-square",
                aspectRatio === 'video' && "aspect-video",
                aspectRatio === 'portrait' && "aspect-[3/4]"
            )}>
                <Skeleton className="h-full w-full" />
            </div>
        </div>
    );
}
