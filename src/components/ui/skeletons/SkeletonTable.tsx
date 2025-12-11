import { Skeleton } from "@/components/ui/Skeleton";

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="w-full space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between py-4 border-b border-border-primary">
                <Skeleton className="h-8 w-[200px]" />
                <div className="flex gap-2">
                    <Skeleton className="h-8 w-[100px]" />
                    <Skeleton className="h-8 w-[100px]" />
                </div>
            </div>

            {/* Rows */}
            <div className="space-y-2">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b border-border-primary/50">
                        <Skeleton className="h-4 w-[40px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-8 w-[80px]" />
                    </div>
                ))}
            </div>
        </div>
    );
}
