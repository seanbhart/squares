'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import SquaresEmbed from '@/components/embed/SquaresEmbed';

function EmbedWidgetContent() {
  const searchParams = useSearchParams();
  const variant = (searchParams.get('variant') as 'card' | 'button') || 'card';
  const buttonText = searchParams.get('buttonText') || 'Map Your Squares';
  const elementId = searchParams.get('elementId') || 'squares-widget';
  const primaryColor = searchParams.get('primaryColor');
  const borderRadius = searchParams.get('borderRadius');
  const shadow = searchParams.get('shadow') !== 'false';
  const [height, setHeight] = useState(0);

  // Build custom CSS variables
  const customStyles = {
    ...(primaryColor && { '--accent': primaryColor }),
    ...(borderRadius && { '--border-radius': borderRadius }),
  } as React.CSSProperties;

  useEffect(() => {
    // Send height updates to parent window
    const updateHeight = () => {
      const newHeight = document.body.scrollHeight;
      if (newHeight !== height) {
        setHeight(newHeight);
        window.parent.postMessage({
          type: 'squares-resize',
          height: newHeight,
          elementId: elementId
        }, '*');
      }
    };

    // Initial update with a small delay to ensure content is rendered
    const timeoutId = setTimeout(updateHeight, 100);

    // Update on resize
    const observer = new ResizeObserver(updateHeight);
    observer.observe(document.body);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [height, elementId]);

  return (
    <div 
      style={{ 
        padding: '1rem',
        ...customStyles
      }}
      className={!shadow ? 'no-shadow' : ''}
    >
      <style>{`
        .no-shadow * {
          box-shadow: none !important;
        }
      `}</style>
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
