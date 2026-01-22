import { Suspense } from 'react';
import type { Metadata } from 'next';
import MiniAppClient from '@/components/miniapp/MiniAppClient';
import FullPageLoadingSpinner from '@/components/FullPageLoadingSpinner';

export const metadata: Metadata = {
  title: 'Squares Political Spectrum',
  description: 'Map your political personality across the CORE framework: Civil Rights, Openness, Redistribution, and Ethics. Compare with the community and discover where you stand.',
  openGraph: {
    title: 'Squares Political Spectrum',
    description: "You're not one word—your politics are unique. Map your political personality using the CORE framework.",
    url: 'https://farcaster.squares.vote/miniapp',
    siteName: 'Squares',
    images: [
      {
        url: 'https://farcaster.squares.vote/og-image.png',
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
    description: "You're not one word—your politics are unique. Map your political personality using the CORE framework.",
    images: ['https://farcaster.squares.vote/og-image.png'],
  },
  other: {
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: 'https://farcaster.squares.vote/miniapp-image.png',
      button: {
        title: 'Square Your Politics',
        action: {
          type: 'launch_miniapp',
          name: 'Squares Political Spectrum',
          url: 'https://farcaster.squares.vote/miniapp',
          splashImageUrl: 'https://farcaster.squares.vote/splash-200x200.png',
          splashBackgroundColor: '#121113',
        },
      },
    }),
    'fc:frame': JSON.stringify({
      version: '1',
      imageUrl: 'https://farcaster.squares.vote/miniapp-image.png',
      button: {
        title: 'Square Your Politics',
        action: {
          type: 'launch_frame',
          name: 'Squares Political Spectrum',
          url: 'https://farcaster.squares.vote/miniapp',
          splashImageUrl: 'https://farcaster.squares.vote/splash-200x200.png',
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
