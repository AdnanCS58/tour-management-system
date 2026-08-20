import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// The global stylesheet is processed by Next.js at build time.
// @ts-expect-error CSS side-effect imports are not declared by the editor.
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TripTribe - Tour Management System',
  description: 'Manage your tours, track expenses, and share locations with friends',
  manifest: '/manifest.json',
  themeColor: '#0a0f0d',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TripTribe',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0f0d" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="TripTribe" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Script id="service-worker-registration" strategy="afterInteractive">
            {`if ('serviceWorker' in navigator) {
              window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').catch(function () {});
              });
            }`}
          </Script>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#121816',
                color: '#e8f0eb',
                border: '1px solid #2a322e',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}