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
  addUserRole,
  removeUserRole,
  createOrUpdateUserByEmail,
  type AdminFigure,
} from '@/lib/admin/api';
import { spectrumArrayToEmojis } from '@/lib/utils/spectrum';
import ConfirmModal from '@/components/ConfirmModal';
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
  
  // User management state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRoles, setNewUserRoles] = useState<string[]>([]);
  
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  
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
    setConfirmModal({
      isOpen: true,
      title: 'Delete Figure',
      message: `Are you sure you want to delete ${figure.name}? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteFigure(figure.id);
          showMessage('success', `${figure.name} deleted`);
          loadData();
        } catch (error) {
          console.error('Failed to delete figure:', error);
          showMessage('error', 'Failed to delete figure');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
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

  async function handleToggleAdmin(userId: string, currentRoles: string[], email: string) {
    const isCurrentlyAdmin = currentRoles.includes('admin');
    
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

  async function handleAddUserByEmail() {
    if (!newUserEmail.trim() || newUserRoles.length === 0) return;

    try {
      await createOrUpdateUserByEmail(newUserEmail, newUserRoles);
      showMessage('success', `Roles updated for ${newUserEmail}: ${newUserRoles.join(', ')}`);
      setNewUserEmail('');
      setNewUserRoles([]);
      loadData();
    } catch (error) {
      console.error('Failed to add user:', error);
      showMessage('error', 'Failed to add user');
    }
  }

  function handleSelectUser(email: string) {
    setNewUserEmail(email);
    // Find user's current roles and set them
    const user = users.find(u => u.email === email);
    if (user && user.roles) {
      setNewUserRoles([...user.roles]);
    }
  }

  function toggleNewUserRole(role: string) {
    setNewUserRoles(prev => 
      prev.includes(role) 
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
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
    <>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        confirmText="Remove"
        isDanger={true}
      />
      
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
          Admins ({users.filter(u => u.roles?.includes('admin')).length})
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
                  <div className={styles.spectrumDisplay}>
                    <div className={styles.spectrumEmojis}>
                      {spectrumArrayToEmojis(figure.spectrum)}
                    </div>
                    <div className={styles.spectrumNumbers}>
                      [{figure.spectrum.join(', ')}]
                    </div>
                  </div>
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
            <h2>Manage User Roles</h2>
            <p className={styles.note}>
              <strong>Visitor:</strong> can view public content. <strong>Member:</strong> can create narrative feeds. <strong>Admin:</strong> can manage users.
            </p>
            <p className={styles.note}>
              💡 Enter any email to create a new user or update an existing one.
            </p>
            <div className={styles.addUserForm}>
              <input
                type="email"
                placeholder="user@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                className={styles.emailInput}
              />
              <select 
                className={styles.roleDropdown}
                value=""
                onChange={(e) => {
                  if (e.target.value && !newUserRoles.includes(e.target.value)) {
                    setNewUserRoles([...newUserRoles, e.target.value]);
                  }
                }}
              >
                <option value="">Select role...</option>
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              <button 
                type="button"
                onClick={handleAddUserByEmail}
                className={styles.addRoleButton}
                disabled={!newUserEmail || newUserRoles.length === 0}
              >
                Add Role
              </button>
            </div>
            {newUserRoles.length > 0 && (
              <div className={styles.selectedRoles}>
                {newUserRoles.map(role => (
                  <span key={role} className={styles.roleBadge}>
                    {role}
                    <button
                      type="button"
                      onClick={() => setNewUserRoles(newUserRoles.filter(r => r !== role))}
                      className={styles.removeBadge}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className={styles.section}>
            <h2>All Users</h2>
            <p className={styles.note}>
              Manage existing users and their roles. Users marked as "Pending" haven't signed in yet.
            </p>
            
            <div className={styles.userTable}>
              <div className={styles.tableHeader}>
                <div className={styles.tableCol}>Email</div>
                <div className={styles.tableCol}>Role</div>
              </div>
              {users.map((u) => (
                <div key={u.email || u.id} className={styles.tableRow}>
                  <div className={styles.tableCol}>
                    <button
                      type="button"
                      className={styles.emailButton}
                      onClick={() => handleSelectUser(u.email)}
                    >
                      {u.email}
                    </button>
                  </div>
                  <div className={styles.tableCol}>
                    <div className={styles.rolesCell}>
                      {u.roles && u.roles.length > 0 ? (
                        u.roles.map(role => (
                          <span key={role} className={styles.roleBadge}>
                            {role}
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: 'Remove Role',
                                  message: `Remove ${role} role from ${u.email}?`,
                                  onConfirm: async () => {
                                    try {
                                      await removeUserRole(u.id, role);
                                      showMessage('success', `Removed ${role} from ${u.email}`);
                                      loadData();
                                    } catch (error) {
                                      showMessage('error', 'Failed to remove role');
                                    }
                                    setConfirmModal({ ...confirmModal, isOpen: false });
                                  },
                                });
                              }}
                              className={styles.removeBadge}
                            >
                              ×
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className={styles.noRoles}>No roles</span>
                      )}
                    </div>
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
    </>
  );
}
