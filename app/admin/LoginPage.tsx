'use client';

import { signInWithGoogle } from '@/lib/admin/client';
import styles from './admin.module.css';

export default function LoginPage() {
  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      alert('Sign in failed. Please try again.');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <h1>Admin Access</h1>
        <p>Sign in with your admin Google account to access the admin panel.</p>
        <button onClick={handleSignIn} className={styles.signInButton}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
