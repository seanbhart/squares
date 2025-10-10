'use client';

import { useState, useEffect } from 'react';
import { signInWithGoogle, signOut, isAdmin, onAuthStateChange } from '@/lib/admin/auth';
import {
  getAllFiguresAdmin,
  updateFigureFeatured,
  deleteFigure,
  reanalyzeFigure,
  addNewFigure,
  getAnalysisHistory,
  getAllUsers,
  makeAdmin,
  removeAdmin,
  type AdminFigure,
} from '@/lib/admin/api';
import styles from './admin.module.css';

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [figures, setFigures] = useState<AdminFigure[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'figures' | 'analysis' | 'admins' | 'prompts'>('figures');
  
  // Figure management state
  const [newFigureName, setNewFigureName] = useState('');
  const [newFigureContext, setNewFigureContext] = useState('');
  const [reanalyzeId, setReanalyzeId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkAuth();
    const { data: authListener } = onAuthStateChange((user) => {
      setUser(user);
      if (user) {
        checkAdminStatus();
      } else {
        setIsAdminUser(false);
        setLoading(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  async function checkAuth() {
    try {
      const adminStatus = await isAdmin();
      setIsAdminUser(adminStatus);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAdminUser(false);
    } finally {
      setLoading(false);
    }
  }

  async function checkAdminStatus() {
    const adminStatus = await isAdmin();
    setIsAdminUser(adminStatus);
    if (adminStatus) {
      loadData();
    }
  }

  async function loadData() {
    try {
      const [figuresData, historyData, usersData] = await Promise.all([
        getAllFiguresAdmin(),
        getAnalysisHistory(20),
        getAllUsers(),
      ]);
      setFigures(figuresData);
      setAnalysisHistory(historyData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      showMessage('error', 'Failed to load data');
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  }

  async function handleSignIn() {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
      showMessage('error', 'Sign in failed');
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setIsAdminUser(false);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }

  async function handleToggleFeatured(figure: AdminFigure) {
    try {
      const newFeatured = !figure.is_featured;
      const newOrder = newFeatured ? figures.filter(f => f.is_featured).length : null;
      
      await updateFigureFeatured(figure.id, newFeatured, newOrder);
      showMessage('success', `${figure.name} ${newFeatured ? 'added to' : 'removed from'} featured`);
      loadData();
    } catch (error) {
      console.error('Failed to update featured status:', error);
      showMessage('error', 'Failed to update featured status');
    }
  }

  async function handleDeleteFigure(figure: AdminFigure) {
    if (!confirm(`Are you sure you want to delete ${figure.name}?`)) return;

    try {
      await deleteFigure(figure.id);
      showMessage('success', `${figure.name} deleted`);
      loadData();
    } catch (error) {
      console.error('Failed to delete figure:', error);
      showMessage('error', 'Failed to delete figure');
    }
  }

  async function handleReanalyze(figure: AdminFigure) {
    try {
      setReanalyzeId(figure.id);
      const { requestId } = await reanalyzeFigure(figure.id, figure.name, 'Admin reanalysis');
      showMessage('success', `Reanalysis started for ${figure.name} (Request ID: ${requestId})`);
      setTimeout(() => loadData(), 2000);
    } catch (error) {
      console.error('Failed to reanalyze:', error);
      showMessage('error', 'Failed to start reanalysis');
    } finally {
      setReanalyzeId(null);
    }
  }

  async function handleAddFigure(e: React.FormEvent) {
    e.preventDefault();
    if (!newFigureName.trim()) return;

    try {
      const { requestId } = await addNewFigure(newFigureName, newFigureContext);
      showMessage('success', `Analysis started for ${newFigureName} (Request ID: ${requestId})`);
      setNewFigureName('');
      setNewFigureContext('');
      setTimeout(() => loadData(), 2000);
    } catch (error) {
      console.error('Failed to add figure:', error);
      showMessage('error', 'Failed to add figure');
    }
  }

  async function handleToggleAdmin(userId: string, currentRole: string, email: string) {
    const isCurrentlyAdmin = currentRole === 'admin';
    
    if (isCurrentlyAdmin) {
      if (!confirm(`Remove admin access for ${email}?`)) return;
      try {
        await removeAdmin(userId);
        showMessage('success', `Removed admin access for ${email}`);
        loadData();
      } catch (error) {
        console.error('Failed to remove admin:', error);
        showMessage('error', 'Failed to remove admin access');
      }
    } else {
      if (!confirm(`Grant admin access to ${email}?`)) return;
      try {
        await makeAdmin(userId);
        showMessage('success', `Granted admin access to ${email}`);
        loadData();
      } catch (error) {
        console.error('Failed to make admin:', error);
        showMessage('error', 'Failed to grant admin access');
      }
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!user) {
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

  if (!isAdminUser) {
    return (
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h1>Access Denied</h1>
          <p>Your account ({user.email}) does not have admin access.</p>
          <button onClick={handleSignOut} className={styles.button}>
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Squares Admin</h1>
        <div className={styles.userInfo}>
          <span>{user.email}</span>
          <button onClick={handleSignOut} className={styles.button}>
            Sign Out
          </button>
        </div>
      </header>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      <nav className={styles.tabs}>
        <button
          className={activeTab === 'figures' ? styles.activeTab : ''}
          onClick={() => setActiveTab('figures')}
        >
          Figures ({figures.length})
        </button>
        <button
          className={activeTab === 'analysis' ? styles.activeTab : ''}
          onClick={() => setActiveTab('analysis')}
        >
          Analysis History
        </button>
        <button
          className={activeTab === 'admins' ? styles.activeTab : ''}
          onClick={() => setActiveTab('admins')}
        >
          Admins ({users.filter(u => u.role === 'admin').length})
        </button>
        <button
          className={activeTab === 'prompts' ? styles.activeTab : ''}
          onClick={() => setActiveTab('prompts')}
        >
          AI Prompts
        </button>
      </nav>

      {activeTab === 'figures' && (
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Add New Figure</h2>
            <form onSubmit={handleAddFigure} className={styles.form}>
              <input
                type="text"
                placeholder="Figure name"
                value={newFigureName}
                onChange={(e) => setNewFigureName(e.target.value)}
                className={styles.input}
                required
              />
              <textarea
                placeholder="Context notes (optional)"
                value={newFigureContext}
                onChange={(e) => setNewFigureContext(e.target.value)}
                className={styles.textarea}
                rows={3}
              />
              <button type="submit" className={styles.primaryButton}>
                Analyze & Add Figure
              </button>
            </form>
          </section>

          <section className={styles.section}>
            <h2>All Figures</h2>
            <div className={styles.figureList}>
              {figures.map((figure) => (
                <div key={figure.id} className={styles.figureCard}>
                  <div className={styles.figureHeader}>
                    <h3>{figure.name}</h3>
                    {figure.is_featured && (
                      <span className={styles.badge}>Featured #{figure.featured_order! + 1}</span>
                    )}
                  </div>
                  <p className={styles.lifespan}>{figure.lifespan}</p>
                  <p className={styles.spectrum}>
                    Spectrum: [{figure.spectrum.join(', ')}]
                  </p>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleToggleFeatured(figure)}
                      className={styles.button}
                    >
                      {figure.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                    </button>
                    <button
                      onClick={() => handleReanalyze(figure)}
                      className={styles.button}
                      disabled={reanalyzeId === figure.id}
                    >
                      {reanalyzeId === figure.id ? 'Analyzing...' : 'Reanalyze'}
                    </button>
                    <button
                      onClick={() => handleDeleteFigure(figure)}
                      className={styles.dangerButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'analysis' && (
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Recent Analysis Requests</h2>
            <div className={styles.historyList}>
              {analysisHistory.map((request) => (
                <div key={request.id} className={styles.historyCard}>
                  <div className={styles.historyHeader}>
                    <h3>{request.figure_name}</h3>
                    <span className={`${styles.status} ${styles[request.status]}`}>
                      {request.status}
                    </span>
                  </div>
                  <p>Type: {request.request_type}</p>
                  <p>Created: {new Date(request.created_at).toLocaleString()}</p>
                  {request.completed_at && (
                    <p>Completed: {new Date(request.completed_at).toLocaleString()}</p>
                  )}
                  {request.error_message && (
                    <p className={styles.error}>Error: {request.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'admins' && (
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Admin Management</h2>
            <p className={styles.note}>
              Manage who has admin access to this panel. Admins can manage figures, view analysis history, and control other admins.
            </p>
            
            <div className={styles.userList}>
              <h3>All Users ({users.length})</h3>
              {users.map((u) => (
                <div key={u.id} className={styles.userCard}>
                  <div className={styles.userInfo}>
                    <div>
                      <strong>{u.email}</strong>
                      {u.role === 'admin' && (
                        <span className={styles.adminBadge}>Admin</span>
                      )}
                      {u.id === user?.id && (
                        <span className={styles.youBadge}>You</span>
                      )}
                    </div>
                    <p className={styles.userMeta}>
                      Joined: {new Date(u.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={styles.userActions}>
                    {u.id !== user?.id && (
                      <button
                        onClick={() => handleToggleAdmin(u.id, u.role, u.email)}
                        className={u.role === 'admin' ? styles.dangerButton : styles.primaryButton}
                      >
                        {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'prompts' && (
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>AI Prompts</h2>
            <p className={styles.note}>
              The system uses two prompts for figure analysis:
            </p>
            <ul>
              <li><strong>Assessor Prompt:</strong> Used by Claude to generate the initial TAME-R assessment with spectrum scores and timeline</li>
              <li><strong>Reviewer Prompt:</strong> Used for quality control and validation (optional, not currently implemented)</li>
            </ul>
            <div className={styles.infoBox}>
              <h3>✅ Dynamic Prompts Enabled</h3>
              <p>
                The Edge Function now fetches prompts from the <code>system_prompts</code> table on each analysis request.
                This allows you to update prompts without redeploying the function.
              </p>
              <p>
                <strong>To update prompts:</strong> Use SQL to update the <code>system_prompts</code> table, or use the Supabase dashboard.
                The most recent prompt (by <code>created_at</code>) will be used.
              </p>
              <p className={styles.note}>
                A visual prompt editor will be added in a future update.
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
