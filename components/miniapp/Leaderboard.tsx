'use client';

import { useEffect, useState } from 'react';
import styles from './Leaderboard.module.css';

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

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/farcaster/leaderboard?sortBy=recent&limit=50');
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`${styles.container} ${styles.darkMode}`}>
        <div className={styles.loading}>Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.darkMode}`}>
      <h2 className={styles.title}>Latest Squares</h2>

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
            </div>
          </div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className={styles.empty}>
          No entries yet. Be the first to map your squares!
        </div>
      )}
    </div>
  );
}
