import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  const t = useTranslations();

  const productLinks = [
    { href: `/${locale}/products/duplex-board`, label: t('products.duplexBoard.name') },
    { href: `/${locale}/products/testliner-fluting`, label: t('products.testlinerFluting.name') },
    { href: `/${locale}/products/kraftliner-white-top`, label: t('products.kraftlinerWhiteTop.name') },
    { href: `/${locale}/stock-offers`, label: t('nav.stockOffers') },
  ];

  const companyLinks = [
    { href: `/${locale}/about`, label: t('nav.about') },
    { href: `/${locale}/sustainability`, label: t('nav.sustainability') },
    { href: `/${locale}/insights`, label: t('nav.insights') },
    { href: `/${locale}/contact`, label: t('nav.contact') },
  ];

  const legalLinks = [
    { href: `/${locale}/legal/privacy`, label: t('footer.privacy') },
    { href: `/${locale}/legal/terms`, label: t('footer.terms') },
    { href: `/${locale}/legal/imprint`, label: t('footer.imprint') },
  ];

  return (
    <footer className="bg-background-secondary border-t border-border-primary">
      <div className="container mx-auto px-6 lg:px-8 max-w-7xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="text-xl font-bold text-brand-primary mb-4">
              PAPER MARKET WORLD
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
              {t('footer.products')}
            </h4>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-tertiary hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
              {t('footer.company')}
            </h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-tertiary hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-4">
              {t('footer.legal')}
            </h4>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-tertiary hover:text-brand-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border-primary flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-tertiary">
          <div>
            © {new Date().getFullYear()} Paper Market World. {t('footer.rights')}
          </div>
          <div>{t('footer.locations')}</div>
        </div>
      </div>
    </footer>
  );
}
