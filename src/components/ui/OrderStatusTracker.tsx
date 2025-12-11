'use client';

import { useTranslations } from 'next-intl';
import {
    Check,
    Package,
    Truck,
    ClipboardCheck,
    Factory,
    MapPin,
    Download,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface Stage {
    id: number;
    title: string;
    date: string;
    status: 'complete' | 'current' | 'pending';
    description?: string;
    documents?: Array<{
        name: string;
        url: string;
        type: 'invoice' | 'packing_list' | 'other';
    }>;
}

interface OrderStatusTrackerProps {
    currentStage: number; // 1-5
    stages: Stage[];
    estimatedDelivery?: string;
}

export function OrderStatusTracker({
    currentStage,
    stages,
    estimatedDelivery
}: OrderStatusTrackerProps) {
    const t = useTranslations();

    const getIcon = (id: number) => {
        switch (id) {
            case 1: return ClipboardCheck;
            case 2: return Factory;
            case 3: return Package;
            case 4: return Truck;
            case 5: return MapPin;
            default: return ClipboardCheck;
        }
    };

    return (
        <div className="w-full">
            {/* Estimated Delivery Header */}
            {estimatedDelivery && (
                <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-lg p-4 mb-8 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-text-secondary">{t('tracker.estimatedDelivery')}</p>
                        <p className="text-lg font-bold text-text-primary">{estimatedDelivery}</p>
                    </div>
                    <Truck className="w-8 h-8 text-brand-primary opacity-50" />
                </div>
            )}

            {/* Timeline */}
            <div className="relative">
                {/* Mobile Vertical Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border-primary md:hidden" />

                {/* Desktop Horizontal Line */}
                <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-border-primary" />

                <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4">
                    {stages.map((stage, index) => {
                        const Icon = getIcon(stage.id);
                        const isComplete = stage.status === 'complete';
                        const isCurrent = stage.status === 'current';
                        const isPending = stage.status === 'pending';

                        return (
                            <div
                                key={stage.id}
                                className={cn(
                                    "relative flex md:flex-col items-start md:items-center gap-4 md:gap-2 md:flex-1",
                                    isPending && "opacity-50"
                                )}
                            >
                                {/* Icon Circle */}
                                <div
                                    className={cn(
                                        "relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                                        isComplete
                                            ? "bg-brand-primary border-brand-primary text-white"
                                            : isCurrent
                                                ? "bg-background-primary border-brand-primary text-brand-primary shadow-[0_0_0_4px_rgba(34,197,94,0.2)]"
                                                : "bg-background-tertiary border-border-primary text-text-tertiary"
                                    )}
                                >
                                    {isComplete ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <Icon className="w-6 h-6" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 md:text-center pt-1 md:pt-4">
                                    <h4 className={cn(
                                        "font-bold text-sm md:text-base mb-1",
                                        isCurrent ? "text-brand-primary" : "text-text-primary"
                                    )}>
                                        {stage.title}
                                    </h4>
                                    <p className="text-xs text-text-secondary mb-2">
                                        {stage.date}
                                    </p>
                                    {stage.description && (
                                        <p className="text-xs text-text-tertiary mb-3 hidden md:block">
                                            {stage.description}
                                        </p>
                                    )}

                                    {/* Documents */}
                                    {stage.documents && stage.documents.length > 0 && (
                                        <div className="flex flex-wrap md:justify-center gap-2 mt-2">
                                            {stage.documents.map((doc, i) => (
                                                <Button
                                                    key={i}
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-7 text-xs gap-1"
                                                    onClick={() => window.open(doc.url, '_blank')}
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    {doc.name}
                                                </Button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
