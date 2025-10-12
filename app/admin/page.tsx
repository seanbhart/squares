import { getCurrentUser, isAdmin } from '@/lib/admin/server';
import AdminClient from './AdminClient';
import LoginPage from './LoginPage';
import styles from './admin.module.css';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getCurrentUser().catch(() => null);
  
  if (!user) {
    return <LoginPage />;
  }

  const isAdminUser = await isAdmin();
  
  if (!isAdminUser) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h1>Access Denied</h1>
          <p>Your account ({user.email}) does not have admin access.</p>
        </div>
      </div>
    );
  }

  return <AdminClient initialUser={user} />;
}
