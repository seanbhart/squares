import { Suspense } from 'react';
import type { Metadata } from 'next';
import MiniAppClient from '@/components/miniapp/MiniAppClient';
import LoadingSpinner from '@/components/LoadingSpinner';

export const metadata: Metadata = {
  title: 'Squares Political Spectrum',
  description: 'Map your political positions across Trade, Abortion, Migration, Economics, and Rights using the TAME-R framework.',
  openGraph: {
    title: 'Squares Political Spectrum',
    description: "You're not one word—you're many dimensions. Map your positions with TAME-R.",
    url: 'https://www.squares.vote/miniapp',
    siteName: 'Squares',
    images: [
      {
        url: 'https://www.squares.vote/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Squares Political Spectrum',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Squares Political Spectrum',
    description: "You're not one word—you're many dimensions. Map your positions with TAME-R.",
    images: ['https://www.squares.vote/og-image.png'],
  },
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://www.squares.vote/og-image.png',
    'fc:frame:button:1': 'Map Your Squares',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://www.squares.vote/miniapp',
  },
};

export default function MiniAppPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MiniAppClient />
    </Suspense>
  );
}
