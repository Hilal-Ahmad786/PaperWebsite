import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

interface SkeletonButtonProps {
    className?: string;
    width?: string | number;
}

export function SkeletonButton({ className, width = 120 }: SkeletonButtonProps) {
    return (
        <Skeleton
            className={cn("h-10 rounded-md", className)}
            style={{ width }}
        />
    );
}
