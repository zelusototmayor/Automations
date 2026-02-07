import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { MixpanelProvider } from '@/components/MixpanelProvider';
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
  alternates: {
    canonical: 'https://bettercoachingapp.com',
  },
  openGraph: {
    title: 'Better Coaching - AI Coaching Marketplace',
    description:
      'Create AI coaching agents from your expertise, or discover the perfect coach for your journey.',
    url: 'https://bettercoachingapp.com',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Better Coaching - AI Coaching Marketplace',
    description:
      'Create AI coaching agents from your expertise, or discover the perfect coach for your journey.',
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Better Coaching',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              url: 'https://bettercoachingapp.com/',
              description:
                'Create AI coaching agents from your expertise, or discover the perfect coach for your journey.',
            }),
          }}
        />
        <MixpanelProvider>
          {children}
        </MixpanelProvider>
      </body>
    </html>
  );
}
