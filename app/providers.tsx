'use client';

import { SessionProvider } from 'next-auth/react';
import PageViewTracker from '@/components/analytics/PageViewTracker';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PageViewTracker />
      {children}
    </SessionProvider>
  );
}
