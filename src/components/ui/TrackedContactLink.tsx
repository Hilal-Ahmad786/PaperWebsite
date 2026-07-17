'use client';

import type { ReactNode } from 'react';
import {
  contactMethodFromChannel,
  contactMethodFromHref,
  trackContactClick,
  type ContactChannel,
  type ContactMethod,
} from '@/lib/analytics';
import { beaconTrack } from '@/lib/tracking/beacon';

/** contact_method → first-party beacon event (admin "Button clicks" report). */
const BEACON_EVENT: Record<ContactMethod, string> = {
  whatsapp: 'whatsapp_click',
  phone: 'phone_click',
  email: 'email_click',
  live_chat: 'quote_click',
  other: 'quote_click',
};

interface TrackedContactLinkProps {
  href: string;
  /** Legacy prop; still accepted. If omitted, the method is inferred from href. */
  channel?: ContactChannel;
  /** Explicit contact method — wins over `channel` and href inference. */
  contactMethod?: ContactMethod;
  /** Where on the page the link sits, e.g. 'footer', 'contact_link'. */
  clickLocation?: string;
  productCategory?: string;
  sourceComponent?: string;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
}

/**
 * Anchor that pushes a secondary-conversion `contact_click` dataLayer event on
 * click (WhatsApp / tel: / mailto:) plus a first-party beacon. Google Ads /
 * GA4 conversion mapping happens later inside GTM.
 */
export function TrackedContactLink({
  href,
  channel,
  contactMethod,
  clickLocation = 'contact_link',
  productCategory,
  sourceComponent = 'tracked_contact_link',
  className,
  children,
  target,
  rel,
}: TrackedContactLinkProps) {
  const method: ContactMethod =
    contactMethod ?? contactMethodFromChannel(channel) ?? contactMethodFromHref(href);

  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={() => {
        trackContactClick({
          contactMethod: method,
          clickLocation,
          productCategory,
          sourceComponent,
        });
        beaconTrack(BEACON_EVENT[method], { location: clickLocation });
      }}
    >
      {children}
    </a>
  );
}
