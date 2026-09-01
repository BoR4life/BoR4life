'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { captureLeadSource } from '@/lib/lead-source';

/**
 * Records where a visit came from, once per page view, into sessionStorage.
 * Renders nothing. The enquiry form reads the result when it mounts, so an
 * enquiry submitted three pages into a visit still carries the referrer and
 * campaign that started it. See lib/lead-source.ts.
 */
export function LeadSourceCapture() {
  const pathname = usePathname();
  useEffect(() => {
    captureLeadSource();
  }, [pathname]);
  return null;
}
