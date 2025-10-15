'use client';

import { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from './Leaderboard.module.css';
import { ClipboardIcon, CheckIcon } from '@/components/icons';

interface LeaderboardEntry {
  fid: number;
  username?: string;
  display_name?: string;
  pfp_url?: string;
  trade_score: number;
  abortion_score: number;
  migration_score: number;
  economics_score: number;
  rights_score: number;
  times_updated: number;
  diversity_score: number;
  created_at: string;
}

interface LeaderboardProps {
  currentFid?: number;
}

function getEmojiSquare(value: number): string {
  const emojis = ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥', '⬛️'];
  return emojis[value] || '🟨';
}

export default function Leaderboard({ currentFid }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedFid, setCopiedFid] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/farcaster/leaderboard?sortBy=recent&limit=50');
      const data = await response.json();
      const entries = data.leaderboard || [];
      
      // Pin current user to top if they exist in the leaderboard
      if (currentFid) {
        const currentUserIndex = entries.findIndex((e: LeaderboardEntry) => e.fid === currentFid);
        if (currentUserIndex > 0) {
          const currentUserEntry = entries.splice(currentUserIndex, 1)[0];
          entries.unshift(currentUserEntry);
        }
      }
      
      setLeaderboard(entries);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEntry = useCallback(async (entry: LeaderboardEntry) => {
    const emojis = [
      entry.trade_score,
      entry.abortion_score,
      entry.migration_score,
      entry.economics_score,
      entry.rights_score,
    ].map(score => getEmojiSquare(score)).join('');
    
    const text = entry.username ? `${emojis} @${entry.username}` : emojis;
    
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFid(entry.fid);
      setTimeout(() => setCopiedFid(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  return (
    <div className={`${styles.container} ${styles.darkMode}`}>
      <h2 className={styles.title}>Latest Squares</h2>

      {loading ? (
        <div className={styles.loadingState}>
          <LoadingSpinner />
        </div>
      ) : (
        <div className={styles.leaderboardList}>
        {leaderboard.map((entry, index) => (
          <div
            key={entry.fid}
            className={`${styles.entry} ${entry.fid === currentFid ? styles.currentUser : ''}`}
          >
            <div className={styles.userInfo}>
              {entry.pfp_url && (
                <img
                  src={entry.pfp_url}
                  alt={entry.display_name || entry.username || 'User'}
                  className={styles.avatar}
                />
              )}
              <div className={styles.nameContainer}>
                <div className={styles.displayName}>
                  {entry.display_name || entry.username || `User ${entry.fid}`}
                </div>
                {entry.username && (
                  <div className={styles.username}>@{entry.username}</div>
                )}
              </div>
            </div>

            <div className={styles.spectrum}>
              {[
                entry.trade_score,
                entry.abortion_score,
                entry.migration_score,
                entry.economics_score,
                entry.rights_score,
              ].map((score, idx) => (
                <span key={idx} style={{ fontSize: '1.5rem', lineHeight: 1 }}>
                  {getEmojiSquare(score)}
                </span>
              ))}
              <button
                onClick={() => handleCopyEntry(entry)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 0.25rem',
                  color: copiedFid === entry.fid ? '#398a34' : '#737373',
                  transition: 'all 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Copy squares"
              >
                {copiedFid === entry.fid ? <CheckIcon /> : <ClipboardIcon />}
              </button>
            </div>
          </div>
        ))}

        {leaderboard.length === 0 && (
          <div className={styles.empty}>
            No entries yet. Be the first to square your political personality!
          </div>
        )}
      </div>
      )}
    </div>
  );
}
