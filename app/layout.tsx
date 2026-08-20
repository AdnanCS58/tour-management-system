import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TripTribe - Tour Management System',
  description:
    'Manage your tours, track expenses, and share locations with friends',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TripTribe',
  },
  icons: {
    apple: '/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0f0d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}


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