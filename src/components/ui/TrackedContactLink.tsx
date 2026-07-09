'use client';

import type { ReactNode } from 'react';
import { trackContactClick, type ContactChannel } from '@/lib/analytics';
import { beaconTrack } from '@/lib/tracking/beacon';

const CHANNEL_EVENT: Record<string, string> = {
  whatsapp: 'whatsapp_click',
  phone: 'phone_click',
  tel: 'phone_click',
  email: 'email_click',
  mail: 'email_click',
};

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
      onClick={() => {
        trackContactClick(channel);
        beaconTrack(CHANNEL_EVENT[channel] ?? `${channel}_click`, { location: 'contact_link' });
      }}
    >
      {children}
    </a>
  );
}
