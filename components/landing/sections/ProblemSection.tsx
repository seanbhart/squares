'use client';

import { useEffect, useState } from 'react';
import styles from './ProblemSection.module.css';

const LABELS = ['Liberal', 'Conservative', 'Moderate', 'Progressive', 'Libertarian'];

export default function ProblemSection() {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation after a brief delay
    const timer = setTimeout(() => setIsAnimating(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <h1 className={styles.headline}>
          Political labels are broken.
        </h1>
        
        <div className={styles.labelsContainer} data-animating={isAnimating}>
          {LABELS.map((label, index) => (
            <span
              key={label}
              className={styles.label}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            >
              {label}
            </span>
          ))}
        </div>

        <p className={styles.subtext}>
          They reduce complex beliefs to oversimplified boxes.
        </p>
      </div>

      <div className={styles.scrollHint}>
        <span className={styles.scrollText}>Scroll to explore</span>
        <div className={styles.scrollArrow}>↓</div>
      </div>
    </section>
  );
}
