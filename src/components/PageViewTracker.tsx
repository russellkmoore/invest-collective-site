'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't track admin pages
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Track the page view
    fetch('/api/v1/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: 'page_view',
        page_path: pathname
      }),
    }).catch(() => {
      // Silently fail - don't break the page if analytics fails
    });
  }, [pathname]);

  return null; // This component doesn't render anything
}
