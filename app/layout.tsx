import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import FeedbackForm from '@/components/FeedbackForm';
import { SiteHeader } from '@/components/shell/SiteHeader';
import { SiteFooter } from '@/components/shell/SiteFooter';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'GovSource - AI-Powered Legislative Insights | Track Members of Congress',
  description: 'Track US Congress members, congressman, and legislative activities with AI-powered insights. Discover bills, laws, and government information.',
  keywords: 'congressman, members of congress, congress members, us congressman, legislative tracking, government data, bills, laws',
  icons: {
    icon: '/favicon.png',
  },
  openGraph: {
    title: 'GovSource - AI-Powered Legislative Insights | Track Members of Congress',
    description: 'Track US Congress members, congressman, and legislative activities with AI-powered insights. Discover bills, laws, and government information.',
    url: 'https://www.govsrc.com',
    siteName: 'GovSource',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className={`${inter.className} font-sans`}>
        <AuthProvider>
          <div className="min-h-screen bg-slate-100">
            <SiteHeader />
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-10 lg:px-8">
              {children}
            </main>
            <SiteFooter />
          </div>
          <FeedbackForm />
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
