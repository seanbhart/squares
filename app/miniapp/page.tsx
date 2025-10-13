import { Suspense } from 'react';
import MiniAppClient from '@/components/miniapp/MiniAppClient';

export const metadata = {
  title: 'Squares Mini App',
  description: 'Map your political positions on Farcaster',
};

export default function MiniAppPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MiniAppClient />
    </Suspense>
  );
}
