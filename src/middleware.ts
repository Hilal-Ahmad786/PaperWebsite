import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './i18n';
import { getCanonicalRedirectPath, pathnames } from './routing';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  pathnames,
  alternateLinks: false,
});

export default function middleware(request: NextRequest) {
  const redirectPath = getCanonicalRedirectPath(request.nextUrl.pathname);

  if (redirectPath) {
    const url = request.nextUrl.clone();
    url.pathname = redirectPath;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/admin`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  // `/admin` is intentionally excluded so the admin panel is NOT locale-prefixed.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)']
};
