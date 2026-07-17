'use client';

import { useEffect } from 'react';
import { trackLeadThankYouView } from '@/lib/analytics';

interface LeadThankYouTrackerProps {
  pageLanguage?: string;
}

/**
 * Fires the backup/diagnostic `lead_thank_you_view` dataLayer event once when
 * the /thank-you page mounts. It deliberately does NOT fire `generate_lead`
 * (that already fired on the successful form submit) so conversions are not
 * double counted. Renders nothing.
 */
export function LeadThankYouTracker({ pageLanguage }: LeadThankYouTrackerProps) {
  useEffect(() => {
    trackLeadThankYouView({ pageLanguage, sourceComponent: 'thank_you_page' });
  }, [pageLanguage]);

  return null;
}
