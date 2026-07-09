'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ClickProtectionTracker } from '@/components/tracking/click-protection-tracker';
import { beaconTrack } from '@/lib/tracking/beacon';

/**
 * Site-wide first-party tracking: mounts the click-protection visitor tracker
 * and beacons a `page_view` on every navigation (feeds the admin Analytics +
 * Button-clicks reports). All fire-and-forget; no-ops when the DB is unset.
 */
export function SiteTracking() {
  const pathname = usePathname();

  useEffect(() => {
    beaconTrack('page_view', { location: 'site' });
  }, [pathname]);

  return <ClickProtectionTracker />;
}
