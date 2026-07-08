'use client';

import type { ReactNode } from 'react';
import { trackContactClick, type ContactChannel } from '@/lib/analytics';

interface TrackedContactLinkProps {
  href: string;
  channel: ContactChannel;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}

/**
 * Anchor that pushes a secondary-conversion dataLayer event on click
 * (WhatsApp / tel: / mailto:). Conversion mapping happens in GTM.
 */
export function TrackedContactLink({
  href,
  channel,
  className,
  children,
  target,
  rel,
}: TrackedContactLinkProps) {
  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={() => trackContactClick(channel)}
    >
      {children}
    </a>
  );
}
