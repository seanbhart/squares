import LoadingSpinner from './LoadingSpinner';
import styles from './FullPageLoadingSpinner.module.css';

export default function FullPageLoadingSpinner() {
  return (
    <div className={styles.fullPageContainer}>
      <LoadingSpinner />
    </div>
  );
}
