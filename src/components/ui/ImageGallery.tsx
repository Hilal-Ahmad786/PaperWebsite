'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryImage {
    src: string;
    alt: string;
    caption?: string;
}

interface ImageGalleryProps {
    images: GalleryImage[];
    columns?: number;
}

export function ImageGallery({ images, columns = 3 }: ImageGalleryProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);

    // Reset zoom when changing images
    useEffect(() => {
        setZoomLevel(1);
    }, [currentIndex]);

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'Escape':
                setIsOpen(false);
                break;
            case 'ArrowLeft':
                setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                break;
            case 'ArrowRight':
                setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                break;
        }
    }, [isOpen, images.length]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Navigation handlers
    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const toggleZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setZoomLevel((prev) => (prev === 1 ? 2 : 1));
    };

    return (
        <>
            {/* Grid Layout */}
            <div
                className={cn(
                    "grid gap-4",
                    "grid-cols-1 sm:grid-cols-2",
                    columns === 3 && "lg:grid-cols-3",
                    columns === 4 && "lg:grid-cols-4"
                )}
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-background-secondary"
                        onClick={() => {
                            setCurrentIndex(index);
                            setIsOpen(true);
                        }}
                    >
                        <img
                            src={image.src}
                            alt={image.alt}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                            <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0" />
                        </div>

                        {/* Caption Overlay */}
                        {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white text-sm font-medium truncate">
                                    {image.caption}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A0E14]/95 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Close Button */}
                    <button
                        className="absolute top-4 right-4 p-2 text-text-secondary hover:text-white transition-colors z-50"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    {/* Navigation */}
                    <button
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-brand-primary hover:text-white transition-all z-50 hidden sm:block"
                        onClick={prevImage}
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>

                    <button
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 text-white hover:bg-brand-primary hover:text-white transition-all z-50 hidden sm:block"
                        onClick={nextImage}
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>

                    {/* Main Image Container */}
                    <div
                        className="relative w-full h-full max-w-7xl max-h-screen p-4 flex items-center justify-center overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="relative transition-transform duration-300 ease-out"
                            style={{ transform: `scale(${zoomLevel})` }}
                        >
                            <img
                                src={images[currentIndex].src}
                                alt={images[currentIndex].alt}
                                className="max-h-[85vh] max-w-full object-contain shadow-2xl rounded-sm"
                                onClick={toggleZoom}
                                style={{ cursor: zoomLevel === 1 ? 'zoom-in' : 'zoom-out' }}
                            />
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div
                        className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-white font-medium text-lg">
                                {images[currentIndex].caption || images[currentIndex].alt}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-text-secondary">
                                <span>
                                    {currentIndex + 1} / {images.length}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setZoomLevel(prev => Math.min(prev + 0.5, 3))}
                                        className="hover:text-brand-primary transition-colors"
                                    >
                                        <ZoomIn className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setZoomLevel(prev => Math.max(prev - 0.5, 1))}
                                        className="hover:text-brand-primary transition-colors"
                                    >
                                        <ZoomOut className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
