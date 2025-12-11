'use client';

import Link from 'next/link';
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    maxItems?: number;
    className?: string;
}

export function Breadcrumbs({
    items,
    separator = <ChevronRight className="w-4 h-4" />,
    maxItems = 4,
    className
}: BreadcrumbsProps) {

    const renderItems = () => {
        if (items.length <= maxItems) {
            return items;
        }

        const firstItem = items[0];
        const lastItems = items.slice(-(maxItems - 2)); // Keep last (maxItems - 2) items

        return [
            firstItem,
            { label: '...', href: '#', isEllipsis: true },
            ...lastItems
        ];
    };

    const displayItems = renderItems();

    return (
        <nav
            aria-label="Breadcrumb"
            className={cn("flex items-center text-sm text-text-secondary", className)}
        >
            <ol className="flex items-center flex-wrap gap-1 md:gap-2">
                {/* Home Icon */}
                <li className="flex items-center">
                    <Link
                        href="/"
                        className="flex items-center hover:text-brand-primary transition-colors p-1 rounded-md hover:bg-brand-primary/10"
                        aria-label="Home"
                    >
                        <Home className="w-4 h-4" />
                    </Link>
                    <span className="mx-1 text-text-tertiary" aria-hidden="true">
                        {separator}
                    </span>
                </li>

                {displayItems.map((item: any, index) => {
                    const isLast = index === displayItems.length - 1;
                    const isEllipsis = item.isEllipsis;

                    return (
                        <li key={`${item.href}-${index}`} className="flex items-center">
                            {isEllipsis ? (
                                <span className="flex items-center justify-center w-6 h-6 text-text-tertiary">
                                    <MoreHorizontal className="w-4 h-4" />
                                </span>
                            ) : isLast ? (
                                <span
                                    className="font-medium text-text-primary px-1 truncate max-w-[150px] md:max-w-none"
                                    aria-current="page"
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="hover:text-brand-primary transition-colors px-1 rounded-md hover:bg-brand-primary/10 truncate max-w-[100px] md:max-w-none"
                                >
                                    {item.label}
                                </Link>
                            )}

                            {!isLast && (
                                <span className="mx-1 text-text-tertiary" aria-hidden="true">
                                    {separator}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
