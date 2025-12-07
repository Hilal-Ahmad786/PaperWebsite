'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Testimonial {
    quote: string;
    company: string;
    author: string;
    role: string;
    locale: string;
}

interface TestimonialCarouselProps {
    testimonials: Testimonial[];
    autoPlay?: boolean;
}

export function TestimonialCarousel({ testimonials, autoPlay = true }: TestimonialCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(1);

    // Responsive items per page
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setItemsPerPage(3);
            } else {
                setItemsPerPage(1);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % Math.ceil(testimonials.length / itemsPerPage));
    }, [testimonials.length, itemsPerPage]);

    const prevSlide = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? Math.ceil(testimonials.length / itemsPerPage) - 1 : prev - 1
        );
    };

    // Auto-rotation
    useEffect(() => {
        if (!autoPlay || isPaused) return;

        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, [autoPlay, isPaused, nextSlide]);

    const totalPages = Math.ceil(testimonials.length / itemsPerPage);

    return (
        <div
            className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {Array.from({ length: totalPages }).map((_, pageIndex) => (
                        <div key={pageIndex} className="w-full flex-shrink-0 flex gap-6">
                            {testimonials
                                .slice(pageIndex * itemsPerPage, (pageIndex + 1) * itemsPerPage)
                                .map((testimonial, index) => (
                                    <div key={index} className="w-full lg:w-1/3">
                                        <Card className="h-full flex flex-col p-8 bg-background-secondary border-border-primary hover:border-brand-primary transition-colors duration-300">
                                            <Quote className="w-8 h-8 text-brand-primary mb-6 opacity-50" />

                                            <blockquote className="flex-grow mb-6">
                                                <p className="text-text-secondary text-lg italic leading-relaxed">
                                                    "{testimonial.quote}"
                                                </p>
                                            </blockquote>

                                            <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border-secondary">
                                                <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg">
                                                    {testimonial.company.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-text-primary font-bold">
                                                        {testimonial.author}
                                                    </div>
                                                    <div className="text-sm text-text-tertiary">
                                                        {testimonial.role}, {testimonial.company}
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 p-2 rounded-full bg-background-tertiary border border-border-primary text-text-secondary hover:text-brand-primary hover:border-brand-primary transition-all z-10"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 p-2 rounded-full bg-background-tertiary border border-border-primary text-text-secondary hover:text-brand-primary hover:border-brand-primary transition-all z-10"
                aria-label="Next slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dot Indicators */}
            <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={cn(
                            "w-2 h-2 rounded-full transition-all duration-300",
                            currentIndex === index
                                ? "w-8 bg-brand-primary"
                                : "bg-border-primary hover:bg-brand-primary/50"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
