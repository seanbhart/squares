'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SquaresEmbed from '@/components/embed/SquaresEmbed';

function EmbedWidgetContent() {
  const searchParams = useSearchParams();
  const variant = (searchParams.get('variant') as 'card' | 'button') || 'card';
  const buttonText = searchParams.get('buttonText') || 'Map Your Squares';
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // Send height updates to parent window
    const updateHeight = () => {
      const newHeight = document.body.scrollHeight;
      if (newHeight !== height) {
        setHeight(newHeight);
        window.parent.postMessage({
          type: 'squares-resize',
          height: newHeight
        }, '*');
      }
    };

    // Initial update
    updateHeight();

    // Update on resize
    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, [height]);

  return (
    <div style={{ padding: '1rem' }}>
      <SquaresEmbed variant={variant} buttonText={buttonText} />
    </div>
  );
}

export default function EmbedWidgetPage() {
  return (
    <Suspense fallback={<div style={{ padding: '1rem' }}>Loading...</div>}>
      <EmbedWidgetContent />
    </Suspense>
  );
}
