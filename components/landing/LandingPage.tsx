'use client';

import { useEffect, useRef } from 'react';
import ProblemSection from './sections/ProblemSection';
import RealitySection from './sections/RealitySection';
import ColorScaleSection from './sections/ColorScaleSection';
import ShowDontTellSection from './sections/ShowDontTellSection';
import CTASection from './sections/CTASection';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Optional: Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      
      const sections = containerRef.current.querySelectorAll('section');
      const currentIndex = Math.round(containerRef.current.scrollTop / window.innerHeight);
      
      if (e.key === 'ArrowDown' && currentIndex < sections.length - 1) {
        sections[currentIndex + 1]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        sections[currentIndex - 1]?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      <ProblemSection />
      <RealitySection />
      <ColorScaleSection />
      <ShowDontTellSection />
      <CTASection />
    </div>
  );
}
