'use client';

import { useEffect, useState } from 'react';
import {
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Info,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast, type Toast as ToastType } from '@/lib/toast';

export function ToastContainer() {
    const [toasts, setToasts] = useState<ToastType[]>([]);

    useEffect(() => {
        return toast.subscribe((newToasts) => {
            setToasts(newToasts);
        });
    }, []);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4 md:p-0">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} />
            ))}
        </div>
    );
}

function ToastItem({ toast: t }: { toast: ToastType }) {
    const [isPaused, setIsPaused] = useState(false);
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        if (!t.duration || isPaused) return;

        const startTime = Date.now();
        const endTime = startTime + t.duration;

        const timer = setInterval(() => {
            const now = Date.now();
            const remaining = endTime - now;
            const newProgress = (remaining / t.duration!) * 100;

            if (newProgress <= 0) {
                clearInterval(timer);
                toast.remove(t.id);
            } else {
                setProgress(newProgress);
            }
        }, 10);

        return () => clearInterval(timer);
    }, [t, isPaused]);

    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />
    };

    const borderColors = {
        success: 'border-green-500/20',
        error: 'border-red-500/20',
        warning: 'border-yellow-500/20',
        info: 'border-blue-500/20'
    };

    const progressColors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    return (
        <div
            className={cn(
                "pointer-events-auto relative overflow-hidden bg-background-tertiary border rounded-lg shadow-lg p-4 flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-right-full",
                borderColors[t.type]
            )}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="shrink-0 mt-0.5">
                {icons[t.type]}
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">
                    {t.message}
                </p>
            </div>

            <button
                onClick={() => toast.remove(t.id)}
                className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
            >
                <X className="w-4 h-4" />
            </button>

            {/* Progress Bar */}
            {t.duration && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-background-primary">
                    <div
                        className={cn("h-full transition-all duration-100 ease-linear", progressColors[t.type])}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}
