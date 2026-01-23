import styles from './LoadingSpinner.module.css';

// CORE color ramp (6 colors for 0-5 scale + dark grey)
const CORE_COLOR_RAMP = [
  '#9B59B6', // purple (0)
  '#3498DB', // blue (1)
  '#2ECC71', // green (2)
  '#F1C40F', // yellow (3)
  '#E67E22', // orange (4)
  '#E74C3C', // red (5)
  '#3a3a42', // dark grey (6)
];

export default function LoadingSpinner() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}>
        {CORE_COLOR_RAMP.map((color, index) => (
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
