'use client';

import { useState, useEffect } from 'react';
import { signOut, onAuthStateChange } from '@/lib/admin/client';
import {
  getAllFiguresAdmin,
  getFigureWithTimeline,
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
  getSystemPrompts,
  updateSystemPrompts,
  type AdminFigure,
} from '@/lib/admin/api';
import { spectrumArrayToEmojis } from '@/lib/utils/spectrum';
import ConfirmModal from '@/components/ConfirmModal';
import styles from './admin.module.css';

// Types for notifications
interface NotificationTokenRecord {
  fid: number
  notification_url: string
  notification_token: string
  app_installed: boolean
  enabled: boolean
  created_at: string
  updated_at: string
  username?: string
}

interface NotificationStats {
  total_tokens: number
  app_installed: number
  app_removed: number
  enabled_tokens: number
  disabled_tokens: number
}

interface AdminClientProps {
  initialUser: any;
}

export default function AdminClient({ initialUser }: AdminClientProps) {
  const [user, setUser] = useState<any>(initialUser);
  const [figures, setFigures] = useState<AdminFigure[]>([]);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'figures' | 'analysis' | 'admins' | 'prompts' | 'notifications' | 'api-keys'>('figures');
  
  // Notifications state
  const [notificationTokens, setNotificationTokens] = useState<Array<NotificationTokenRecord & { username?: string }>>([]);
  const [notificationStats, setNotificationStats] = useState<NotificationStats>({ total_tokens: 0, app_installed: 0, app_removed: 0, enabled_tokens: 0, disabled_tokens: 0 });
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastUrl, setBroadcastUrl] = useState('https://farcaster.squares.vote/miniapp');
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [testingFid, setTestingFid] = useState<number | null>(null);
  
  // Figure management state
  const [newFigureName, setNewFigureName] = useState('');
  const [newFigureContext, setNewFigureContext] = useState('');
  const [isAddingFigure, setIsAddingFigure] = useState(false);
  const [reanalyzeId, setReanalyzeId] = useState<string | null>(null);
  const [draggedFigure, setDraggedFigure] = useState<AdminFigure | null>(null);
  const [selectedFigureForTimeline, setSelectedFigureForTimeline] = useState<AdminFigure | null>(null);
  
  // User management state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRoles, setNewUserRoles] = useState<string[]>([]);
  
  // Prompts state
  const [assessorPrompt, setAssessorPrompt] = useState('');
  const [reviewerPrompt, setReviewerPrompt] = useState('');
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [promptsSaved, setPromptsSaved] = useState(false);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEmail, setNewKeyEmail] = useState('');
  const [newKeyOrg, setNewKeyOrg] = useState('');
  const [newKeyTier, setNewKeyTier] = useState<'free' | 'standard' | 'enterprise'>('free');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [keyCopied, setKeyCopied] = useState(false);
  
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
    loadData();
    const { data: authListener } = onAuthStateChange((user) => {
      setUser(user);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

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

  async function loadNotifications() {
    try {
      const [tokensRes, statsRes] = await Promise.all([
        fetch('/api/admin/notifications?action=list'),
        fetch('/api/admin/notifications?action=stats'),
      ]);
      const tokensData = await tokensRes.json();
      const statsData = await statsRes.json();
      setNotificationTokens(tokensData.tokens || []);
      setNotificationStats(statsData);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      showMessage('error', 'Failed to load notifications');
    }
  }

  async function handleTestNotification(fid: number) {
    try {
      setTestingFid(fid);
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test', fid }),
      });
      const data = await response.json();
      if (data.success) {
        showMessage('success', `Test notification sent to FID ${fid}`);
      } else {
        showMessage('error', 'Failed to send test notification - user may have disabled notifications');
      }
    } catch (error) {
      console.error('Failed to send test notification:', error);
      showMessage('error', 'Failed to send test notification');
    } finally {
      setTestingFid(null);
    }
  }

  async function handleBroadcastNotification() {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) {
      showMessage('error', 'Title and body are required');
      return;
    }

    if (!confirm(`Send notification to all ${notificationStats.enabled_tokens} users with notifications enabled?`)) {
      return;
    }

    try {
      setIsSendingBroadcast(true);
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'broadcast',
          title: broadcastTitle,
          body: broadcastBody,
          targetUrl: broadcastUrl,
        }),
      });
      const result = await response.json();
      showMessage('success', `Broadcast sent! ${result.sent} succeeded, ${result.failed} failed`);
      setBroadcastTitle('');
      setBroadcastBody('');
    } catch (error) {
      console.error('Failed to send broadcast:', error);
      showMessage('error', 'Failed to send broadcast');
    } finally {
      setIsSendingBroadcast(false);
    }
  }

  async function handleDeleteToken(fid: number) {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Notification Token',
      message: `Remove notification token for FID ${fid}? They will need to re-add the miniapp to enable notifications again.`,
      onConfirm: async () => {
        try {
          await fetch(`/api/admin/notifications?fid=${fid}`, {
            method: 'DELETE',
          });
          showMessage('success', `Deleted notification token for FID ${fid}`);
          loadNotifications();
        } catch (error) {
          console.error('Failed to delete token:', error);
          showMessage('error', 'Failed to delete token');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      },
    });
  }

  async function loadApiKeys() {
    try {
      const response = await fetch('/api/admin/keys');
      if (response.ok) {
        const result = await response.json();
        setApiKeys(result.data || []);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
      setMessage({ type: 'error', text: 'Failed to load API keys' });
    }
  }

  async function createApiKey() {
    if (!newKeyName || !newKeyEmail) {
      setMessage({ type: 'error', text: 'Name and email are required' });
      return;
    }

    setIsCreatingKey(true);
    setKeyCopied(false);
    try {
      const response = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          contact_email: newKeyEmail,
          organization: newKeyOrg || null,
          tier: newKeyTier,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create API key');
      }

      const result = await response.json();
      setCreatedKey(result.api_key);
      setMessage({ type: 'success', text: 'API key created successfully!' });
      setNewKeyName('');
      setNewKeyEmail('');
      setNewKeyOrg('');
      setNewKeyTier('free');
      await loadApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      setMessage({ type: 'error', text: 'Failed to create API key' });
    } finally {
      setIsCreatingKey(false);
    }
  }

  async function revokeApiKey(keyId: string, keyName: string) {
    if (!confirm(`Are you sure you want to revoke "${keyName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to revoke API key');
      }

      setMessage({ type: 'success', text: 'API key revoked successfully' });
      await loadApiKeys();
    } catch (error) {
      console.error('Error revoking API key:', error);
      setMessage({ type: 'error', text: 'Failed to revoke API key' });
    }
  }

  async function loadPrompts() {
    try {
      setPromptsLoading(true);
      const prompts = await getSystemPrompts();
      if (prompts) {
        setAssessorPrompt(prompts.assessor_prompt || '');
        setReviewerPrompt(prompts.reviewer_prompt || '');
      }
    } catch (error) {
      console.error('Failed to load prompts:', error);
      showMessage('error', 'Failed to load prompts');
    } finally {
      setPromptsLoading(false);
    }
  }

  async function handleSavePrompts() {
    try {
      setPromptsLoading(true);
      await updateSystemPrompts({
        assessor_prompt: assessorPrompt,
        reviewer_prompt: reviewerPrompt,
      });
      showMessage('success', 'Prompts updated successfully');
      setPromptsSaved(true);
      setTimeout(() => setPromptsSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save prompts:', error);
      showMessage('error', 'Failed to save prompts');
    } finally {
      setPromptsLoading(false);
    }
  }

  function showMessage(type: 'success' | 'error', text: string) {
    setMessage({ type, text });
    // Show success messages longer (6s) since they're important confirmations
    const duration = type === 'success' ? 6000 : 5000;
    setTimeout(() => setMessage(null), duration);
  }

  async function handleSignOut() {
    try {
      await signOut();
      window.location.href = '/admin';
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

    const figureName = newFigureName.trim();
    
    try {
      setIsAddingFigure(true);
      showMessage('success', `🔄 Starting analysis for ${figureName}...`);
      
      const { requestId } = await addNewFigure(figureName, newFigureContext);
      
      showMessage('success', `✓ Analysis completed for ${figureName}! (Request ID: ${requestId})`);
      setNewFigureName('');
      setNewFigureContext('');
      setTimeout(() => loadData(), 1000);
    } catch (error) {
      console.error('Failed to add figure:', error);
      showMessage('error', `Failed to add ${figureName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAddingFigure(false);
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

  // Helper function to get last name
  function getLastName(fullName: string): string {
    const parts = fullName.trim().split(' ');
    return parts[parts.length - 1];
  }

  // Sort figures: featured first (by featured_order), then non-featured alphabetically by last name
  const sortedFigures = [...figures].sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1;
    if (!a.is_featured && b.is_featured) return 1;
    if (a.is_featured && b.is_featured) {
      return (a.featured_order ?? 0) - (b.featured_order ?? 0);
    }
    // Sort non-featured by last name
    return getLastName(a.name).localeCompare(getLastName(b.name));
  });

  async function handleDragStart(figure: AdminFigure) {
    setDraggedFigure(figure);
  }

  async function handleDragOver(e: React.DragEvent, targetFigure: AdminFigure) {
    e.preventDefault();
    if (!draggedFigure || draggedFigure.id === targetFigure.id) return;

    // Only allow reordering within the same category (featured or non-featured)
    if (draggedFigure.is_featured !== targetFigure.is_featured) return;

    // For featured figures, swap their order
    if (draggedFigure.is_featured && targetFigure.is_featured) {
      const draggedOrder = draggedFigure.featured_order ?? 0;
      const targetOrder = targetFigure.featured_order ?? 0;

      try {
        // Swap the orders
        await updateFigureFeatured(draggedFigure.id, true, targetOrder);
        await updateFigureFeatured(targetFigure.id, true, draggedOrder);
        loadData();
      } catch (error) {
        console.error('Failed to reorder figures:', error);
        showMessage('error', 'Failed to reorder figures');
      }
    }
  }

  function handleDragEnd() {
    setDraggedFigure(null);
  }

  async function handleSelectFigure(figure: AdminFigure) {
    try {
      const fullFigure = await getFigureWithTimeline(figure.id);
      setSelectedFigureForTimeline(fullFigure as any);
    } catch (error) {
      console.error('Failed to load figure timeline:', error);
      showMessage('error', 'Failed to load timeline');
    }
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
            <a href="/" target="_blank" rel="noopener noreferrer" className={styles.mainSiteLink}>
              View Main Site →
            </a>
            <span>{user?.email}</span>
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
        <button
          className={activeTab === 'notifications' ? styles.activeTab : ''}
          onClick={() => {
            setActiveTab('notifications');
            loadNotifications();
          }}
        >
          Notifications ({notificationStats.enabled_tokens})
        </button>
        <button
          className={activeTab === 'api-keys' ? styles.activeTab : ''}
          onClick={() => {
            setActiveTab('api-keys');
            loadApiKeys();
          }}
        >
          API Keys ({apiKeys.length})
        </button>
      </nav>

      {activeTab === 'figures' && (
        <div className={styles.content}>
          <div className={styles.twoColumnLayout}>
            <section className={styles.section}>
              <h2>Add New Figure</h2>
              <form onSubmit={handleAddFigure} className={styles.compactForm}>
                <input
                  type="text"
                  placeholder="Figure name"
                  value={newFigureName}
                  onChange={(e) => setNewFigureName(e.target.value)}
                  className={styles.input}
                  required
                  disabled={isAddingFigure}
                />
                <textarea
                  placeholder="Context notes (optional)"
                  value={newFigureContext}
                  onChange={(e) => setNewFigureContext(e.target.value)}
                  className={styles.textarea}
                  rows={2}
                  disabled={isAddingFigure}
                />
                <button 
                  type="submit" 
                  className={styles.primaryButton}
                  disabled={isAddingFigure}
                >
                  {isAddingFigure ? '⏳ Submitting...' : '✓ Analyze & Add Figure'}
                </button>
              </form>
            </section>

            <section className={styles.section}>
              <h2>Timeline Viewer</h2>
              {selectedFigureForTimeline ? (
                <div className={styles.timelineViewer}>
                  <h3>{selectedFigureForTimeline.name}</h3>
                  <p className={styles.lifespan}>{selectedFigureForTimeline.lifespan}</p>
                  <div className={styles.spectrumDisplay}>
                    <div className={styles.spectrumEmojis}>
                      {spectrumArrayToEmojis(selectedFigureForTimeline.spectrum)}
                    </div>
                    <div className={styles.spectrumNumbers}>
                      [{selectedFigureForTimeline.spectrum.join(', ')}]
                    </div>
                  </div>
                  {selectedFigureForTimeline.timeline && selectedFigureForTimeline.timeline.length > 0 ? (
                    <div className={styles.timelineEntries}>
                      {selectedFigureForTimeline.timeline.map((entry: any, index: number) => (
                        <div key={index} className={styles.timelineEntry}>
                          <h4>{entry.label}</h4>
                          <div className={styles.spectrumDisplay}>
                            <div className={styles.spectrumEmojis}>
                              {spectrumArrayToEmojis(entry.spectrum)}
                            </div>
                            <div className={styles.spectrumNumbers}>
                              [{entry.spectrum.join(', ')}]
                            </div>
                          </div>
                          <p className={styles.entryNote}>{entry.note}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={styles.note}>No timeline entries</p>
                  )}
                </div>
              ) : (
                <p className={styles.note}>Click a figure name below to view its timeline</p>
              )}
            </section>
          </div>

          <section className={styles.section}>
            <h2>All Figures</h2>
            <p className={styles.note}>
              Featured figures appear first and can be reordered by dragging. Drag featured figures to reorder them.
            </p>
            <div className={styles.figureList}>
              {sortedFigures.map((figure) => (
                <div 
                  key={figure.id} 
                  className={`${styles.figureCard} ${draggedFigure?.id === figure.id ? styles.dragging : ''}`}
                  draggable={figure.is_featured}
                  onDragStart={() => handleDragStart(figure)}
                  onDragOver={(e) => handleDragOver(e, figure)}
                  onDragEnd={handleDragEnd}
                >
                  <div 
                    className={styles.figureHeader}
                    onClick={() => handleSelectFigure(figure)}
                    style={{ cursor: 'pointer' }}
                  >
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
                  {figure.updated_at && (
                    <p className={styles.lastUpdated}>
                      Updated: {new Date(figure.updated_at).toLocaleDateString()} {new Date(figure.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
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
            <div className={styles.promptsHeader}>
              <h2>AI Prompts</h2>
              <button
                onClick={() => loadPrompts()}
                className={styles.button}
                disabled={promptsLoading}
              >
                {promptsLoading ? 'Loading...' : 'Load Current Prompts'}
              </button>
            </div>
            <p className={styles.note}>
              Edit the prompts below and click "Save Prompts" to update. Changes take effect immediately for new analysis requests.
            </p>

            <div className={styles.promptEditor}>
              <h3>Assessor Prompt</h3>
              <p className={styles.note}>
                Used by Claude to generate the initial TAME-R assessment with spectrum scores and timeline
              </p>
              <textarea
                className={styles.promptTextarea}
                value={assessorPrompt}
                onChange={(e) => setAssessorPrompt(e.target.value)}
                placeholder="Load prompts to edit..."
                rows={20}
              />
            </div>

            <div className={styles.promptEditor}>
              <h3>Reviewer Prompt</h3>
              <p className={styles.note}>
                Used for quality control and validation (optional, not currently implemented in Edge Function)
              </p>
              <textarea
                className={styles.promptTextarea}
                value={reviewerPrompt}
                onChange={(e) => setReviewerPrompt(e.target.value)}
                placeholder="Load prompts to edit..."
                rows={15}
              />
            </div>

            <div className={styles.promptActions}>
              <button
                onClick={handleSavePrompts}
                className={styles.primaryButton}
                disabled={promptsLoading || !assessorPrompt}
              >
                {promptsLoading ? 'Saving...' : promptsSaved ? '✓ Saved!' : 'Save Prompts'}
              </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Notification Stats</h2>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{notificationStats.total_tokens}</div>
                <div className={styles.statLabel}>Total Records</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{notificationStats.app_installed}</div>
                <div className={styles.statLabel}>App Installed</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{notificationStats.app_removed}</div>
                <div className={styles.statLabel}>App Removed</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{notificationStats.enabled_tokens}</div>
                <div className={styles.statLabel}>Notifications Enabled</div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statValue}>{notificationStats.disabled_tokens}</div>
                <div className={styles.statLabel}>Notifications Disabled</div>
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Broadcast Notification</h2>
            <p className={styles.note}>
              Send a notification to all {notificationStats.enabled_tokens} users with notifications enabled.
            </p>
            <div className={styles.broadcastForm}>
              <input
                type="text"
                placeholder="Notification title"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className={styles.input}
                maxLength={50}
              />
              <textarea
                placeholder="Notification body"
                value={broadcastBody}
                onChange={(e) => setBroadcastBody(e.target.value)}
                className={styles.textarea}
                rows={3}
                maxLength={150}
              />
              <input
                type="url"
                placeholder="Target URL (where users go when clicking)"
                value={broadcastUrl}
                onChange={(e) => setBroadcastUrl(e.target.value)}
                className={styles.input}
              />
              <button
                onClick={handleBroadcastNotification}
                className={styles.primaryButton}
                disabled={isSendingBroadcast || !broadcastTitle.trim() || !broadcastBody.trim()}
              >
                {isSendingBroadcast ? 'Sending...' : `Send to ${notificationStats.enabled_tokens} Users`}
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Notification Tokens</h2>
            <p className={styles.note}>
              Manage users who have added the miniapp and enabled notifications.
            </p>
            <div className={styles.tokenList}>
              {notificationTokens.length === 0 ? (
                <p className={styles.note}>No notification tokens yet. Users will appear here when they add the miniapp.</p>
              ) : (
                <div className={styles.userTable}>
                  <div className={styles.tableHeader}>
                    <div className={styles.tableCol}>FID</div>
                    <div className={styles.tableCol}>Username</div>
                    <div className={styles.tableCol}>App Status</div>
                    <div className={styles.tableCol}>Notifications</div>
                    <div className={styles.tableCol}>Updated</div>
                    <div className={styles.tableCol}>Actions</div>
                  </div>
                  {notificationTokens.map((token) => (
                    <div key={token.fid} className={styles.tableRow}>
                      <div className={styles.tableCol}>{token.fid}</div>
                      <div className={styles.tableCol}>
                        {token.username ? `@${token.username}` : '-'}
                      </div>
                      <div className={styles.tableCol}>
                        <span className={token.app_installed ? styles.enabledBadge : styles.disabledBadge}>
                          {token.app_installed ? 'Installed' : 'Removed'}
                        </span>
                      </div>
                      <div className={styles.tableCol}>
                        <span className={token.enabled ? styles.enabledBadge : styles.disabledBadge}>
                          {token.enabled ? 'On' : 'Off'}
                        </span>
                      </div>
                      <div className={styles.tableCol}>
                        {new Date(token.updated_at).toLocaleDateString()}
                      </div>
                      <div className={styles.tableCol}>
                        <div className={styles.tokenActions}>
                          {token.enabled && token.app_installed && (
                            <button
                              onClick={() => handleTestNotification(token.fid)}
                              className={styles.button}
                              disabled={testingFid === token.fid}
                            >
                              {testingFid === token.fid ? 'Sending...' : 'Test'}
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteToken(token.fid)}
                            className={styles.dangerButton}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {activeTab === 'api-keys' && (
        <div className={styles.content}>
          <section className={styles.section}>
            <h2>Create New API Key</h2>
            
            {createdKey && (
              <div className={styles.message} style={{ background: '#1A191B', color: 'var(--text-primary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '2px solid var(--border-strong)' }}>
                <strong>⚠️ Save this key now - it won't be shown again!</strong>
                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--background)', borderRadius: '4px', fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all', border: '1px solid var(--border)' }}>
                  {createdKey}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdKey);
                    setKeyCopied(true);
                    setMessage({ type: 'success', text: 'API key copied to clipboard!' });
                    setTimeout(() => setKeyCopied(false), 2000);
                  }}
                  style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.5rem 1rem', 
                    background: keyCopied ? 'var(--neutral-button-hover)' : 'var(--accent)', 
                    color: keyCopied ? 'white' : 'var(--accent-text)', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer', 
                    fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {keyCopied ? '✓ Copied!' : '📋 Copy to Clipboard'}
                </button>
                <button
                  onClick={() => {
                    setCreatedKey(null);
                    setKeyCopied(false);
                  }}
                  style={{ marginTop: '0.5rem', marginLeft: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Dismiss
                </button>
              </div>
            )}
            
            <div className={styles.compactForm}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Research Project, Personal Use"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '4px', background: 'var(--background)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    value={newKeyEmail}
                    onChange={(e) => setNewKeyEmail(e.target.value)}
                    placeholder="contact@example.com"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '4px', background: 'var(--background)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Organization (optional)
                  </label>
                  <input
                    type="text"
                    value={newKeyOrg}
                    onChange={(e) => setNewKeyOrg(e.target.value)}
                    placeholder="e.g., University, Company Name"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '4px', background: 'var(--background)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Tier
                  </label>
                  <select
                    value={newKeyTier}
                    onChange={(e) => setNewKeyTier(e.target.value as 'free' | 'standard' | 'enterprise')}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '4px', background: 'var(--background)', color: 'var(--text-primary)' }}
                  >
                    <option value="free">Free (60/min, 10k/day)</option>
                    <option value="standard">Standard (300/min, 100k/day)</option>
                    <option value="enterprise">Enterprise (1000/min, 1M/day)</option>
                  </select>
                </div>
              </div>
              
              <button
                onClick={createApiKey}
                disabled={isCreatingKey}
                className={styles.primaryButton}
              >
                {isCreatingKey ? 'Creating...' : '🔑 Create API Key'}
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Existing API Keys ({apiKeys.length})</h2>
            {apiKeys.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No API keys created yet.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Organization</th>
                      <th>Email</th>
                      <th>Tier</th>
                      <th>Prefix</th>
                      <th>Status</th>
                      <th>Usage</th>
                      <th>Created</th>
                      <th>Last Used</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((key) => (
                      <tr key={key.id}>
                        <td style={{ fontWeight: 600 }}>{key.name}</td>
                        <td>{key.organization || '-'}</td>
                        <td style={{ fontSize: '0.85rem' }}>{key.contact_email}</td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: key.tier === 'enterprise' ? 'var(--neutral-button-hover)' : key.tier === 'standard' ? 'var(--neutral-button)' : 'rgba(255, 255, 255, 0.15)',
                            color: 'white'
                          }}>
                            {key.tier.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {key.key_prefix}
                        </td>
                        <td>
                          <span style={{
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            background: key.status === 'active' ? 'var(--neutral-button-hover)' : key.status === 'suspended' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                            color: 'white'
                          }}>
                            {key.status}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {key.requests_count?.toLocaleString() || 0} requests
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {new Date(key.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>
                          {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td>
                          <button
                            onClick={() => revokeApiKey(key.id, key.name)}
                            className={styles.dangerButton}
                            disabled={key.status === 'revoked'}
                            style={{ fontSize: '0.85rem', padding: '0.25rem 0.5rem' }}
                          >
                            {key.status === 'revoked' ? 'Revoked' : 'Revoke'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
      </div>
    </>
  );
}
