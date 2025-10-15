import { Suspense } from 'react';
import type { Metadata } from 'next';
import MiniAppClient from '@/components/miniapp/MiniAppClient';
import FullPageLoadingSpinner from '@/components/FullPageLoadingSpinner';

export const metadata: Metadata = {
  title: 'Squares Political Spectrum',
  description: 'Square your political personality across Trade, Abortion, Migration, Economics, and Rights. Compare with the community and discover where you stand.',
  openGraph: {
    title: 'Squares Political Spectrum',
    description: "You're not one word—your politics are unique. Square your political personality into shareable emojis.",
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
    description: "You're not one word—your politics are unique. Square your political personality into shareable emojis.",
    images: ['https://www.squares.vote/og-image.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: 'https://www.squares.vote/miniapp-image.png',
      button: {
        title: 'Square Your Political Personality',
        action: {
          type: 'launch_frame',
          name: 'Squares Political Spectrum',
          url: 'https://www.squares.vote/miniapp',
          splashImageUrl: 'https://www.squares.vote/splash-200x200.png',
          splashBackgroundColor: '#121113',
        },
      },
    }),
  },
};

export default function MiniAppPage() {
  return (
    <Suspense fallback={<FullPageLoadingSpinner />}>
      <MiniAppClient />
    </Suspense>
  );
}
