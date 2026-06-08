import { createLocalizedPathnamesNavigation } from 'next-intl/navigation';
import { defaultLocale, locales } from './i18n';
import { pathnames } from './routing';

export const { Link, redirect, usePathname, useRouter, getPathname } =
    createLocalizedPathnamesNavigation({
        locales,
        defaultLocale,
        localePrefix: 'always',
        pathnames,
    });
