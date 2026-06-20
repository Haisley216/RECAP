'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { track, Events } from '@/lib/analytics';

export default function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    track(Events.PAGE_VIEW, { path: pathname });
  }, [pathname]);

  return null;
}
