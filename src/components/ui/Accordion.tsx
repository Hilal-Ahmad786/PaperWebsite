'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccordionItem {
    id: string;
    question: string;
    answer: string | React.ReactNode;
}

interface AccordionProps {
    items: AccordionItem[];
    mode?: 'single' | 'multiple';
    defaultOpen?: string[];
    className?: string;
    showSearch?: boolean;
    searchPlaceholder?: string;
}

export function Accordion({
    items,
    mode = 'single',
    defaultOpen = [],
    className,
    showSearch = false,
    searchPlaceholder = "Search FAQs..."
}: AccordionProps) {
    const [openItems, setOpenItems] = useState<string[]>(defaultOpen);
    const [searchQuery, setSearchQuery] = useState('');

    const toggleItem = (id: string) => {
        if (mode === 'single') {
            setOpenItems(prev => prev.includes(id) ? [] : [id]);
        } else {
            setOpenItems(prev =>
                prev.includes(id)
                    ? prev.filter(item => item !== id)
                    : [...prev, id]
            );
        }
    };

    const filteredItems = items.filter(item => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const questionMatch = item.question.toLowerCase().includes(query);
        // Simple check for string answers, more complex check could be added for ReactNode
        const answerMatch = typeof item.answer === 'string' && item.answer.toLowerCase().includes(query);
        return questionMatch || answerMatch;
    });

    // Highlight search terms
    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase()
                ? <mark key={i} className="bg-brand-primary/20 text-brand-primary rounded px-0.5">{part}</mark>
                : part
        );
    };

    return (
        <div className={cn("w-full space-y-4", className)}>
            {showSearch && (
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-background-tertiary border border-border-primary rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-brand-primary transition-colors"
                    />
                </div>
            )}

            <div className="space-y-2">
                {filteredItems.map((item) => (
                    <AccordionItem
                        key={item.id}
                        item={item}
                        isOpen={openItems.includes(item.id)}
                        onToggle={() => toggleItem(item.id)}
                        searchQuery={searchQuery}
                        highlightText={highlightText}
                    />
                ))}

                {filteredItems.length === 0 && searchQuery && (
                    <div className="text-center py-8 text-text-secondary">
                        No results found for "{searchQuery}"
                    </div>
                )}
            </div>
        </div>
    );
}

function AccordionItem({
    item,
    isOpen,
    onToggle,
    searchQuery,
    highlightText
}: {
    item: AccordionItem;
    isOpen: boolean;
    onToggle: () => void;
    searchQuery: string;
    highlightText: (text: string, query: string) => React.ReactNode;
}) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [height, setHeight] = useState<number | undefined>(isOpen ? undefined : 0);

    useEffect(() => {
        if (isOpen) {
            const scrollHeight = contentRef.current?.scrollHeight;
            setHeight(scrollHeight);
        } else {
            setHeight(0);
        }
    }, [isOpen]);

    return (
        <div className={cn(
            "border rounded-lg overflow-hidden transition-colors duration-200",
            isOpen
                ? "bg-background-tertiary border-brand-primary"
                : "bg-background-tertiary/50 border-border-primary hover:border-brand-primary/50"
        )}>
            <button
                type="button"
                onClick={onToggle}
                className="flex items-center justify-between w-full p-4 text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-primary/50"
                aria-expanded={isOpen}
                aria-controls={`accordion-content-${item.id}`}
            >
                <span className={cn(
                    "font-medium text-base pr-4 transition-colors",
                    isOpen ? "text-brand-primary" : "text-text-primary"
                )}>
                    {highlightText(item.question, searchQuery)}
                </span>
                <ChevronDown
                    className={cn(
                        "w-5 h-5 text-text-tertiary transition-transform duration-300 ease-in-out shrink-0",
                        isOpen && "transform rotate-180 text-brand-primary"
                    )}
                />
            </button>

            <div
                id={`accordion-content-${item.id}`}
                role="region"
                aria-labelledby={`accordion-header-${item.id}`}
                className="overflow-hidden transition-[height] duration-300 ease-in-out"
                style={{ height: isOpen ? height : 0 }}
            >
                <div ref={contentRef} className="p-4 pt-0 text-text-secondary text-sm leading-relaxed border-t border-transparent">
                    {typeof item.answer === 'string'
                        ? highlightText(item.answer, searchQuery)
                        : item.answer
                    }
                </div>
            </div>
        </div>
    );
}
