'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/navigation';
import { locales } from '@/i18n';

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

  return (
    <header className="sticky top-0 z-50 bg-background-secondary/80 backdrop-blur-xl border-b border-border-primary">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-bold text-brand-primary tracking-tight hover:text-brand-secondary transition-colors"
          >
            PAPER MARKET WORLD
          </Link>

          {/* Navigation */}
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
          <div className="flex items-center gap-4 pl-8 border-l border-border-primary">
            {/* Language Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors">
                {locale.toUpperCase()}
                <svg
                  className="w-4 h-4 transition-transform group-hover:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
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
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Get Quote Button */}
            <Link
              href="/contact"
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-brand-primary rounded-lg hover:bg-brand-secondary transition-all shadow-lg shadow-brand-primary/20 hover:shadow-brand-secondary/30"
            >
              {t('nav.getQuote')}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
