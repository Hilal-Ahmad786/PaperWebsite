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

          {/* Language Switcher */}
          <div className="flex items-center gap-2 pl-8 border-l border-border-primary">
            {locales.map((loc) => (
              <Link
                key={loc}
                href={pathname}
                locale={loc}
                className={`px-3 py-1.5 text-xs font-semibold transition-all border ${locale === loc
                  ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
                  : 'bg-background-tertiary/50 border-border-primary text-text-tertiary hover:border-brand-primary hover:text-brand-primary'
                  }`}
              >
                {loc.toUpperCase()}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
