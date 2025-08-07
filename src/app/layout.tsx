import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow | Collaborative Task Management',
  description: 'A modern task management app with real-time collaboration, AI-powered suggestions, and seamless workflow.',
  authors: [{ name: 'TaskFlow Team' }],
  keywords: ['task management', 'productivity', 'collaboration', 'real-time', 'AI'],
  openGraph: {
    title: 'TaskFlow - Modern Task Management',
    description: 'Boost your team productivity with real-time task collaboration and AI assistance',
    url: 'https://taskflow.app',
    siteName: 'TaskFlow',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TaskFlow App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TaskFlow - Modern Task Management',
    description: 'Boost your team productivity with real-time task collaboration and AI assistance',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}