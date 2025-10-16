import { COLOR_RAMP } from '@/lib/tamer-config';
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}>
        {COLOR_RAMP.map((color, index) => (
          <div
            key={index}
            className={styles.loadingSquare}
            style={{ backgroundColor: color }}
          />
        ))}
        {/* Transparent square with corner brackets in bottom left */}
        <div className={styles.loadingSquareBracket}>
          <div className={styles.bracketTopRight} />
          <div className={styles.bracketBottomLeft} />
        </div>
      </div>
    </div>
  );
}
