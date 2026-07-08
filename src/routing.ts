import { type Locale } from './i18n';

type QueryValue = string | number | boolean | null | undefined;

export const pathnames = {
  '/': '/',
  '/products': {
    en: '/products',
    tr: '/ürünler',
    de: '/produkte',
    ar: '/المنتجات',
    it: '/prodotti',
    fr: '/produits',
    es: '/productos',
  },
  '/products/[slug]': {
    en: '/products/[slug]',
    tr: '/ürünler/[slug]',
    de: '/produkte/[slug]',
    ar: '/المنتجات/[slug]',
    it: '/prodotti/[slug]',
    fr: '/produits/[slug]',
    es: '/productos/[slug]',
  },
  '/services': {
    en: '/services',
    tr: '/hizmetler',
    de: '/dienstleistungen',
    ar: '/الخدمات',
    it: '/servizi',
    fr: '/services',
    es: '/servicios',
  },
  '/regions': {
    en: '/regions',
    tr: '/bölgeler',
    de: '/regionen',
    ar: '/المناطق',
    it: '/regioni',
    fr: '/regions',
    es: '/regiones',
  },
  '/sustainability': {
    en: '/sustainability',
    tr: '/sürdürülebilirlik',
    de: '/nachhaltigkeit',
    ar: '/الاستدامة',
    it: '/sostenibilita',
    fr: '/durabilite',
    es: '/sostenibilidad',
  },
  '/insights': {
    en: '/insights',
    tr: '/içgörüler',
    de: '/einblicke',
    ar: '/الرؤى',
    it: '/approfondimenti',
    fr: '/perspectives',
    es: '/perspectivas',
  },
  '/stock-offers': {
    en: '/stock-offers',
    tr: '/stok-teklifleri',
    de: '/lagerangebote',
    ar: '/المخزون-والعروض',
    it: '/offerte-stock',
    fr: '/offres-stock',
    es: '/ofertas-stock',
  },
  '/about': {
    en: '/about',
    tr: '/hakkımızda',
    de: '/ueber-uns',
    ar: '/من-نحن',
    it: '/chi-siamo',
    fr: '/a-propos',
    es: '/sobre-nosotros',
  },
  '/contact': {
    en: '/contact',
    tr: '/iletişim',
    de: '/kontakt',
    ar: '/اتصل-بنا',
    it: '/contatti',
    fr: '/contact',
    es: '/contacto',
  },
  '/track-order': {
    en: '/track-order',
    tr: '/sipariş-takip',
    de: '/auftrag-verfolgen',
    ar: '/تتبع-الطلب',
    it: '/traccia-ordine',
    fr: '/suivi-commande',
    es: '/seguimiento-pedido',
  },
  '/legal/privacy': {
    en: '/legal/privacy',
    tr: '/yasal/gizlilik',
    de: '/rechtliches/datenschutz',
    ar: '/قانوني/الخصوصية',
    it: '/legale/privacy',
    fr: '/mentions-legales/confidentialite',
    es: '/legal/privacidad',
  },
  '/legal/imprint': {
    en: '/legal/imprint',
    tr: '/yasal/künye',
    de: '/rechtliches/impressum',
    ar: '/قانوني/بيانات-الناشر',
    it: '/legale/note-legali',
    fr: '/mentions-legales/mentions-legales',
    es: '/legal/aviso-legal',
  },
  '/thank-you': {
    en: '/thank-you',
    tr: '/teşekkürler',
    de: '/danke',
    ar: '/شكرا',
    it: '/grazie',
    fr: '/merci',
    es: '/gracias',
  },
} as const;

export type AppPathname = keyof typeof pathnames;

export const productSlugMap: Record<Locale, Record<string, string>> = {
  en: {
    'duplex-board': 'duplex-board',
    'testliner-fluting': 'testliner-fluting',
    'kraftliner-white-top': 'kraftliner-white-top',
    'triplex-board': 'triplex-board',
    'paper-cones-tubes': 'paper-cones-tubes',
  },
  tr: {
    'duplex-board': 'dupleks-karton',
    'testliner-fluting': 'testliner-ve-fluting',
    'kraftliner-white-top': 'kraftliner-beyaz-üst',
    'triplex-board': 'tripleks-karton',
    'paper-cones-tubes': 'kağıt-koni-masura',
  },
  de: {
    'duplex-board': 'duplexkarton',
    'testliner-fluting': 'testliner-wellenstoff',
    'kraftliner-white-top': 'kraftliner-weissdecke',
    'triplex-board': 'triplexkarton',
    'paper-cones-tubes': 'papierkonen-spulenhuelsen',
  },
  ar: {
    'duplex-board': 'كرتون-دوبلكس',
    'testliner-fluting': 'تستلاينر-فلوتنج',
    'kraftliner-white-top': 'كرافتلاينر-ابيض',
    'triplex-board': 'كرتون-تربلكس',
    'paper-cones-tubes': 'مخاريط-وانابيب-ورقية',
  },
  it: {
    'duplex-board': 'cartone-duplex',
    'testliner-fluting': 'testliner-fluting',
    'kraftliner-white-top': 'kraftliner-copertina-bianca',
    'triplex-board': 'cartone-triplex',
    'paper-cones-tubes': 'coni-e-tubi-di-carta',
  },
  fr: {
    'duplex-board': 'carton-duplex',
    'testliner-fluting': 'testliner-cannelure',
    'kraftliner-white-top': 'kraftliner-couverture-blanche',
    'triplex-board': 'carton-triplex',
    'paper-cones-tubes': 'cones-et-tubes-papier',
  },
  es: {
    'duplex-board': 'carton-duplex',
    'testliner-fluting': 'testliner-fluting',
    'kraftliner-white-top': 'kraftliner-cubierta-blanca',
    'triplex-board': 'carton-triplex',
    'paper-cones-tubes': 'conos-y-tubos-de-papel',
  },
};

const canonicalProductSlugs = new Set(Object.keys(productSlugMap.en));
const localizedProductSlugLookup = Object.fromEntries(
  Object.entries(productSlugMap).map(([locale, slugs]) => [
    locale,
    Object.fromEntries(Object.entries(slugs).map(([canonical, localized]) => [localized, canonical])),
  ])
) as Record<Locale, Record<string, string>>;

function localizeTemplate(locale: Locale, pathname: AppPathname) {
  const template = pathnames[pathname];
  return typeof template === 'string' ? template : template[locale];
}

function appendQuery(path: string, query?: Record<string, QueryValue>) {
  if (!query) return path;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

export function getLocalizedPath(
  locale: Locale,
  pathname: AppPathname,
  params?: Record<string, string>,
  query?: Record<string, QueryValue>
) {
  let localizedPath: string = localizeTemplate(locale, pathname);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      localizedPath = localizedPath.replace(`[${key}]`, encodeURIComponent(value));
    });
  }

  return appendQuery(`/${locale}${localizedPath}`, query);
}

export function getLocalizedProductSlug(locale: Locale, canonicalSlug: string) {
  return productSlugMap[locale][canonicalSlug] ?? canonicalSlug;
}

export function getCanonicalProductSlug(locale: Locale, slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  return localizedProductSlugLookup[locale][decodedSlug] ?? decodedSlug;
}

export function getLocalizedProductPath(
  locale: Locale,
  canonicalSlug: string,
  query?: Record<string, QueryValue>
) {
  return getLocalizedPath(
    locale,
    '/products/[slug]',
    { slug: getLocalizedProductSlug(locale, canonicalSlug) },
    query
  );
}

export function getCanonicalRedirectPath(pathname: string) {
  const decodedPathname = decodeURI(pathname);
  const [, maybeLocale, ...restParts] = decodedPathname.split('/');
  const locale = maybeLocale as Locale;

  if (!productSlugMap[locale]) return null;

  const restPath = `/${restParts.join('/')}`;
  if (restPath === '/') return null;

  if (restPath.startsWith('/products/')) {
    const slug = restPath.replace('/products/', '');
    const canonicalSlug = getCanonicalProductSlug(locale, slug);

    if (canonicalProductSlugs.has(canonicalSlug)) {
      const localizedPath = getLocalizedProductPath(locale, canonicalSlug);
      return localizedPath === decodedPathname ? null : localizedPath;
    }
  }

  const staticPathnames = Object.keys(pathnames).filter(
    (route): route is AppPathname => route !== '/' && !route.includes('[')
  );

  for (const route of staticPathnames) {
    if (restPath === route) {
      const localizedPath = getLocalizedPath(locale, route);
      return localizedPath === decodedPathname ? null : localizedPath;
    }
  }

  return null;
}

export function getLocalizedAlternatePath(pathname: string, targetLocale: Locale) {
  const decodedPathname = decodeURI(pathname);
  const [, maybeLocale, ...restParts] = decodedPathname.split('/');
  const currentLocale = productSlugMap[maybeLocale as Locale] ? (maybeLocale as Locale) : targetLocale;
  const restPath = `/${restParts.join('/')}`;

  if (restPath === '/') {
    return getLocalizedPath(targetLocale, '/');
  }

  const currentProductTemplate = localizeTemplate(currentLocale, '/products/[slug]');
  const currentProductPrefix = currentProductTemplate.replace('/[slug]', '');

  if (restPath.startsWith(`${currentProductPrefix}/`)) {
    const slug = restPath.slice(currentProductPrefix.length + 1);
    return getLocalizedProductPath(targetLocale, getCanonicalProductSlug(currentLocale, slug));
  }

  if (restPath.startsWith('/products/')) {
    const slug = restPath.replace('/products/', '');
    return getLocalizedProductPath(targetLocale, getCanonicalProductSlug(currentLocale, slug));
  }

  const staticPathnames = Object.keys(pathnames).filter(
    (route): route is AppPathname => route !== '/' && !route.includes('[')
  );

  for (const route of staticPathnames) {
    if (restPath === route || restPath === localizeTemplate(currentLocale, route)) {
      return getLocalizedPath(targetLocale, route);
    }
  }

  return getLocalizedPath(targetLocale, '/');
}
