'use client';

import PageViewTracker from '@/components/analytics/PageViewTracker';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageViewTracker />
      {children}
    </>
  );
}
