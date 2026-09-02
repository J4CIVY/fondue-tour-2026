import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fondue-tour-2026.jayfarei.chatgpt.site'),
  title: 'Fondue Tour 2026 — Alpine Roadbook',
  description: 'A mobile roadbook with interactive routes, restart navigation and TomTom GPX downloads for the 2026 Fondue Tour.',
  openGraph: {
    title: 'Fondue Tour 2026',
    description: 'Five days. One Alpine line. Restart navigation and TomTom routes included.',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Fondue Tour 2026 — Five days. One Alpine line.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fondue Tour 2026',
    description: 'Five days. One Alpine line. Restart navigation and TomTom routes included.',
    images: ['/og.png'],
  },
  icons: {
    icon: '/brand/fondue-tour-mark.png',
    apple: '/brand/fondue-tour-mark.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
