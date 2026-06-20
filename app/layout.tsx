import type { Metadata, Viewport } from 'next';
import './globals.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'rico — AI 면접 회고',
  description: '면접 직후 기억을 빠르게 복기하고, AI가 다음 면접을 준비해드려요',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <div className="min-h-screen sm:bg-slate-100 sm:flex sm:justify-center">
            <div className="app-container">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
