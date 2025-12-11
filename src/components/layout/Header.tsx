'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { locales } from '@/i18n';
import { Menu, X, ChevronDown, Check } from 'lucide-react';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const navigation = [
    { key: 'products', href: '/products' },
    { key: 'services', href: '/services' },
    { key: 'regions', href: '/regions' },
    { key: 'sustainability', href: '/sustainability' },
    { key: 'insights', href: '/insights' },
    { key: 'stockOffers', href: '/stock-offers' },
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
  ];

  /* Mobile Menu State */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-[999] bg-background-secondary/80 backdrop-blur-xl border-b border-border-primary">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-brand-primary tracking-tight hover:text-brand-secondary transition-colors"
          >
            PAPER MARKET WORLD
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors"
              >
                {t(`nav.${item.key}`)}
              </Link>
            ))}
          </nav>

          {/* Actions Area */}
          <div className="flex items-center gap-4 lg:pl-8 lg:border-l lg:border-border-primary">
            {/* Language Dropdown */}
            <div className="relative group hidden sm:block">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors">
                {locale.toUpperCase()}
                <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
              </button>

              <div className="absolute right-0 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[120px]">
                <div className="bg-background-secondary border border-border-primary rounded-lg shadow-xl overflow-hidden py-1">
                  {locales.map((loc) => (
                    <Link
                      key={loc}
                      href={pathname}
                      locale={loc}
                      className={`block px-4 py-2 text-sm font-medium transition-colors ${locale === loc
                        ? 'bg-brand-primary/10 text-brand-primary'
                        : 'text-text-secondary hover:bg-background-tertiary hover:text-brand-primary'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{loc.toUpperCase()}</span>
                        {locale === loc && (
                          <Check className="w-4 h-4" />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Get Quote Button (Desktop) */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-secondary/30"
            >
              {t('nav.getQuote')}
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 text-text-primary hover:bg-background-tertiary rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay - Moved to Portal */}
      {isMobileMenuOpen && mounted && createPortal(
        <div className="fixed inset-0 top-[64px] z-[9999] bg-background-primary lg:hidden flex flex-col overflow-y-auto animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="p-6 space-y-6">
            <nav className="flex flex-col gap-4">
              {navigation.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  className="text-lg font-medium text-text-secondary hover:text-brand-primary transition-colors py-2 border-b border-border-primary/50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-4 pt-4">
              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={pathname}
                    locale={loc}
                    className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${locale === loc
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'bg-background-tertiary text-text-secondary border-border-primary'
                      }`}
                  >
                    {loc.toUpperCase()}
                  </Link>
                ))}
              </div>

              <Link
                href="/contact"
                className="flex items-center justify-center px-4 py-3 text-base font-bold text-white bg-brand-primary rounded-xl hover:bg-brand-secondary transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.getQuote')}
              </Link>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
