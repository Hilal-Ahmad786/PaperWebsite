'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    children?: React.ReactNode;
    footer?: React.ReactNode;
    variant?: 'alert' | 'confirm' | 'custom';
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    description?: string;
}

export function Modal({
    isOpen,
    onClose,
    title,
    size = 'md',
    children,
    footer,
    variant = 'custom',
    onConfirm,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    description
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Lock body scroll
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Trap focus (simple implementation)
    useEffect(() => {
        if (isOpen && modalRef.current) {
            modalRef.current.focus();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl'
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-background-primary/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Dialog */}
            <div
                ref={modalRef}
                tabIndex={-1}
                className={cn(
                    "relative w-full bg-background-tertiary border border-border-primary rounded-lg shadow-2xl outline-none",
                    "transform transition-all animate-in fade-in zoom-in-95 duration-200",
                    sizeClasses[size]
                )}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border-primary">
                    <h3 id="modal-title" className="text-lg font-semibold text-text-primary">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-text-tertiary hover:text-text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary rounded-full p-1"
                    >
                        <X className="w-5 h-5" />
                        <span className="sr-only">Close</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {description && (
                        <p className="text-text-secondary mb-4">{description}</p>
                    )}
                    {children}
                </div>

                {/* Footer */}
                {(footer || variant !== 'custom') && (
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-border-primary bg-background-secondary/50 rounded-b-lg">
                        {variant === 'custom' ? (
                            footer
                        ) : (
                            <>
                                {variant === 'confirm' && (
                                    <Button variant="secondary" onClick={onClose}>
                                        {cancelText}
                                    </Button>
                                )}
                                <Button onClick={onConfirm || onClose}>
                                    {confirmText}
                                </Button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
