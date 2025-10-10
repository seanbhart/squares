'use client';

import { useState } from 'react';
import SquaresWidget from './SquaresWidget';
import styles from './SquaresEmbed.module.css';

interface SquaresEmbedProps {
  variant?: 'button' | 'card';
  buttonText?: string;
}

export default function SquaresEmbed({ 
  variant = 'card',
  buttonText = 'Map Your Squares'
}: SquaresEmbedProps) {
  const [showWidget, setShowWidget] = useState(false);

  if (variant === 'button') {
    return (
      <>
        <button onClick={() => setShowWidget(true)} className={styles.button}>
          {buttonText}
        </button>
        {showWidget && <SquaresWidget onClose={() => setShowWidget(false)} />}
      </>
    );
  }

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Map Your Political Positions</h3>
          <p className={styles.subtitle}>
            Use the TAME-R framework to visualize where you stand on 5 key policy dimensions
          </p>
        </div>

        <div className={styles.example}>
          <div className={styles.exampleHeader}>
            <span className={styles.exampleLabel}>Example:</span>
            <span className={styles.exampleName}>Martin Luther King Jr.</span>
          </div>
          <div className={styles.squares}>
            🟩🟦🟩🟧🟪
          </div>
          <div className={styles.labels}>
            <span>Trade</span>
            <span>Abortion</span>
            <span>Migration</span>
            <span>Economics</span>
            <span>Rights</span>
          </div>
        </div>

        <button onClick={() => setShowWidget(true)} className={styles.ctaButton}>
          {buttonText}
        </button>

        <p className={styles.footer}>
          Takes less than 2 minutes · Free & open source
        </p>
      </div>
      {showWidget && <SquaresWidget onClose={() => setShowWidget(false)} />}
    </>
  );
}
