'use client';

import styles from './LeaderboardPlaceholder.module.css';

export default function LeaderboardPlaceholder() {
  // Create 5 placeholder rows
  const placeholderRows = Array.from({ length: 5 }, (_, i) => i);
  
  // Different gradients for visual variety
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Latest Squares</h2>
      
      <div className={styles.wrapper}>
        <div className={styles.blurredSection}>
          {placeholderRows.map((index) => (
            <div key={index} className={styles.placeholderEntry}>
              <div className={styles.rank}>{index + 1}</div>
              <div className={styles.userInfo}>
                <div 
                  className={styles.avatar}
                  style={{ background: gradients[index % gradients.length] }}
                ></div>
                <div className={styles.textInfo}>
                  <div className={styles.displayName}></div>
                  <div className={styles.username}></div>
                </div>
              </div>
              <div className={styles.spectrum}>
                <div className={styles.square}></div>
                <div className={styles.square}></div>
                <div className={styles.square}></div>
                <div className={styles.square}></div>
                <div className={styles.square}></div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.cta}>
          <p className={styles.ctaText}>Reveal your spectrum to see the community board</p>
        </div>
      </div>
    </div>
  );
}
