'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
    ChevronRight,
    ChevronLeft,
    Check,
    Package,
    Factory,
    Globe,
    ShoppingCart,
    RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductFinderProps {
    products: Product[];
    onComplete: (selectedProducts: Product[]) => void;
}

type Step = 'application' | 'specs' | 'origin' | 'results';

interface FinderState {
    application: string;
    gsmRange: [number, number];
    grades: string[];
    origins: string[];
    budget: 'economy' | 'standard' | 'premium';
}

const INITIAL_STATE: FinderState = {
    application: '',
    gsmRange: [100, 400],
    grades: [],
    origins: [],
    budget: 'standard'
};

export function ProductFinder({ products, onComplete }: ProductFinderProps) {
    const t = useTranslations();
    const [currentStep, setCurrentStep] = useState<Step>('application');
    const [state, setState] = useState<FinderState>(INITIAL_STATE);
    const [matches, setMatches] = useState<Product[]>([]);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('productFinderState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setState(parsed);
            } catch (e) {
                console.error('Failed to parse saved state', e);
            }
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('productFinderState', JSON.stringify(state));
    }, [state]);

    const steps: Step[] = ['application', 'specs', 'origin', 'results'];
    const progress = ((steps.indexOf(currentStep) + 1) / steps.length) * 100;

    const handleNext = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            const nextStep = steps[currentIndex + 1];
            setCurrentStep(nextStep);

            if (nextStep === 'results') {
                calculateMatches();
            }
        }
    };

    const handleBack = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
    };

    const calculateMatches = () => {
        // Simple matching logic based on application and origin
        // In a real app, this would be more complex involving GSM ranges and grades
        const results = products.filter(product => {
            // Match application (loose match for demo)
            const appMatch = !state.application || product.applications.some(app => app.includes(state.application.toLowerCase()));

            // Match origin
            const originMatch = state.origins.length === 0 || product.origins.some(origin => state.origins.includes(origin));

            return true; // Return all for demo purposes if filters are empty, or implement strict logic
        }).slice(0, 3); // Limit to top 3

        setMatches(results.length > 0 ? results : products.slice(0, 3)); // Fallback to show something
    };

    const resetFinder = () => {
        setState(INITIAL_STATE);
        setCurrentStep('application');
        localStorage.removeItem('productFinderState');
    };

    const renderStep = () => {
        switch (currentStep) {
            case 'application':
                return (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-text-primary mb-4">
                            {t('finder.step1.title')}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { id: 'fmcg', icon: Package, label: 'FMCG & Packaging' },
                                { id: 'pharma', icon: Factory, label: 'Pharmaceuticals' },
                                { id: 'ecommerce', icon: ShoppingCart, label: 'E-commerce' },
                                { id: 'industrial', icon: Factory, label: 'Industrial' },
                            ].map((app) => (
                                <div
                                    key={app.id}
                                    onClick={() => setState({ ...state, application: app.id })}
                                    className={cn(
                                        "p-6 rounded-lg border cursor-pointer transition-all hover:border-brand-primary flex flex-col items-center gap-3 text-center",
                                        state.application === app.id
                                            ? "bg-brand-primary/10 border-brand-primary"
                                            : "bg-background-tertiary border-border-primary"
                                    )}
                                >
                                    <app.icon className={cn(
                                        "w-8 h-8",
                                        state.application === app.id ? "text-brand-primary" : "text-text-secondary"
                                    )} />
                                    <span className="font-medium text-text-primary">{app.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'specs':
                return (
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold text-text-primary mb-4">
                            {t('finder.step2.title')}
                        </h3>

                        {/* GSM Range Slider Mock */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-text-secondary">
                                {t('finder.step2.gsmRange')}
                            </label>
                            <div className="px-2">
                                <input
                                    type="range"
                                    min="100"
                                    max="600"
                                    className="w-full accent-brand-primary"
                                    value={state.gsmRange[1]}
                                    onChange={(e) => setState({ ...state, gsmRange: [state.gsmRange[0], parseInt(e.target.value)] })}
                                />
                                <div className="flex justify-between text-sm text-text-tertiary mt-2 font-mono">
                                    <span>{state.gsmRange[0]} gsm</span>
                                    <span>{state.gsmRange[1]} gsm</span>
                                </div>
                            </div>
                        </div>

                        {/* Grades */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium text-text-secondary">
                                {t('finder.step2.quality')}
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {['Virgin', 'Recycled', 'Mixed', 'Coated', 'Uncoated'].map((grade) => (
                                    <button
                                        key={grade}
                                        onClick={() => {
                                            const newGrades = state.grades.includes(grade)
                                                ? state.grades.filter(g => g !== grade)
                                                : [...state.grades, grade];
                                            setState({ ...state, grades: newGrades });
                                        }}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm border transition-colors",
                                            state.grades.includes(grade)
                                                ? "bg-brand-primary text-white border-brand-primary"
                                                : "bg-transparent text-text-secondary border-border-primary hover:border-brand-primary"
                                        )}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'origin':
                return (
                    <div className="space-y-8">
                        <h3 className="text-xl font-bold text-text-primary mb-4">
                            {t('finder.step3.title')}
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            {['Turkey', 'Europe', 'Asia', 'USA'].map((origin) => (
                                <div
                                    key={origin}
                                    onClick={() => {
                                        const newOrigins = state.origins.includes(origin)
                                            ? state.origins.filter(o => o !== origin)
                                            : [...state.origins, origin];
                                        setState({ ...state, origins: newOrigins });
                                    }}
                                    className={cn(
                                        "p-4 rounded-lg border cursor-pointer flex items-center gap-3",
                                        state.origins.includes(origin)
                                            ? "bg-brand-primary/10 border-brand-primary"
                                            : "bg-background-tertiary border-border-primary"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded border flex items-center justify-center",
                                        state.origins.includes(origin)
                                            ? "bg-brand-primary border-brand-primary"
                                            : "border-text-tertiary"
                                    )}>
                                        {state.origins.includes(origin) && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className="text-text-primary">{origin}</span>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-medium text-text-secondary">
                                {t('finder.step3.budget')}
                            </label>
                            <div className="grid grid-cols-3 gap-4">
                                {['economy', 'standard', 'premium'].map((budget) => (
                                    <button
                                        key={budget}
                                        onClick={() => setState({ ...state, budget: budget as any })}
                                        className={cn(
                                            "py-3 rounded-lg border text-sm capitalize transition-colors",
                                            state.budget === budget
                                                ? "bg-brand-primary/10 border-brand-primary text-brand-primary font-bold"
                                                : "bg-background-tertiary border-border-primary text-text-secondary"
                                        )}
                                    >
                                        {budget}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'results':
                return (
                    <div className="space-y-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-brand-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-brand-primary" />
                            </div>
                            <h3 className="text-2xl font-bold text-text-primary mb-2">
                                {t('finder.results.matchFound', { count: matches.length })}
                            </h3>
                            <p className="text-text-secondary">
                                {t('finder.results.subtitle')}
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {matches.map((product) => (
                                <div
                                    key={product.slug}
                                    className="bg-background-tertiary border border-border-primary rounded-lg p-4 flex items-center justify-between group hover:border-brand-primary transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-background-secondary rounded flex items-center justify-center text-2xl">
                                            📦
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-primary">{t(product.i18nKey + '.name')}</h4>
                                            <p className="text-xs text-text-tertiary">{product.category}</p>
                                        </div>
                                    </div>
                                    <div className="text-brand-primary font-bold text-sm">
                                        98% Match
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                onClick={resetFinder}
                                variant="secondary"
                                className="flex-1"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {t('finder.results.reset')}
                            </Button>
                            <Button
                                onClick={() => onComplete(matches)}
                                className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white"
                            >
                                {t('finder.results.viewDetails')}
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Card className="w-full max-w-2xl mx-auto bg-background-secondary border-border-primary overflow-hidden">
            {/* Progress Bar */}
            <div className="h-1 bg-background-tertiary w-full">
                <div
                    className="h-full bg-brand-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div className="text-sm font-medium text-brand-primary">
                        {t('finder.step', { current: steps.indexOf(currentStep) + 1, total: steps.length })}
                    </div>
                    <div className="flex gap-1">
                        {steps.map((s, i) => (
                            <div
                                key={s}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-colors",
                                    i <= steps.indexOf(currentStep) ? "bg-brand-primary" : "bg-background-tertiary"
                                )}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="min-h-[300px]">
                    {renderStep()}
                </div>

                {/* Footer Navigation */}
                {currentStep !== 'results' && (
                    <div className="flex justify-between mt-8 pt-6 border-t border-border-primary">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            disabled={currentStep === 'application'}
                            className="text-text-secondary hover:text-text-primary"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            {t('common.back')}
                        </Button>
                        <Button
                            onClick={handleNext}
                            disabled={currentStep === 'application' && !state.application}
                            className="bg-brand-primary hover:bg-brand-secondary text-white"
                        >
                            {currentStep === 'origin' ? t('finder.finish') : t('common.next')}
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    );
}
