import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Better Coaching - AI Coaching Marketplace',
  description:
    'Create AI coaching agents from your expertise, or discover the perfect coach for your journey. Real methodologies from real experts.',
  keywords: [
    'AI coaching',
    'coaching marketplace',
    'personal development',
    'coaching agents',
    'expert guidance',
  ],
  openGraph: {
    title: 'Better Coaching - AI Coaching Marketplace',
    description:
      'Create AI coaching agents from your expertise, or discover the perfect coach for your journey.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
