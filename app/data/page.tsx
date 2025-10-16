import { Suspense } from 'react';
import type { Metadata } from 'next';
import DataViewer from '@/components/data/DataViewer';
import FullPageLoadingSpinner from '@/components/FullPageLoadingSpinner';

export const metadata: Metadata = {
  title: 'Public Data',
  description: 'Explore public political spectrum data from the Squares community. View distributions, export data, and analyze political diversity.',
  openGraph: {
    title: 'Squares Public Data',
    description: 'Explore public political spectrum data from the Squares community.',
    url: 'https://squares.vote/data',
    siteName: 'Squares',
    images: [
      {
        url: 'https://squares.vote/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Squares Public Data',
      },
    ],
    type: 'website',
  },
};

export default function DataPage() {
  return (
    <Suspense fallback={<FullPageLoadingSpinner />}>
      <DataViewer />
    </Suspense>
  );
}
