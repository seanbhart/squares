'use client';

import { useRouter } from 'next/navigation';
import styles from './CTASection.module.css';

export default function CTASection() {
  const router = useRouter();

  const handleStartAssessment = () => {
    // Navigate to the main assessment page
    router.push('/assess');
  };

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.headline}>
          Where do YOU belong?
        </h2>

        <p className={styles.subheadline}>
          Map your positions across all five dimensions.
        </p>

        <button
          className={styles.ctaButton}
          onClick={handleStartAssessment}
        >
          <span className={styles.buttonText}>Map My Squares</span>
          <span className={styles.buttonIcon}>→</span>
        </button>

        <div className={styles.details}>
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>⏱️</span>
            <span className={styles.detailText}>2 minutes</span>
          </div>
          <div className={styles.detailSeparator}>•</div>
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>📊</span>
            <span className={styles.detailText}>5 dimensions</span>
          </div>
          <div className={styles.detailSeparator}>•</div>
          <div className={styles.detailItem}>
            <span className={styles.detailIcon}>🎯</span>
            <span className={styles.detailText}>Your unique pattern</span>
          </div>
        </div>

        <p className={styles.privacy}>
          No signup required. Your data stays on your device.
        </p>
      </div>

      <footer className={styles.footer}>
        <a href="/embed" className={styles.footerLink}>
          Embed on Your Site
        </a>
        <span className={styles.footerSeparator}>•</span>
        <a 
          href="https://github.com/seanbhart/squares" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          Open Source
        </a>
      </footer>
    </section>
  );
}
