'use client';

import { useEffect, useState, useCallback } from 'react';
import CoreAssessment, { CoreScores } from './CoreAssessment';
// import Leaderboard from './Leaderboard';
// import LeaderboardPlaceholder from './LeaderboardPlaceholder';
// import StickySpectrum from './StickySpectrum';
import FullPageLoadingSpinner from '@/components/FullPageLoadingSpinner';
import styles from './MiniApp.module.css';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

// Use the new CoreScores type
type UserSpectrum = CoreScores;

export default function MiniAppClient() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [existingSpectrum, setExistingSpectrum] = useState<UserSpectrum | null>(null);
  const [showAssessment, setShowAssessment] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [pendingSpectrum, setPendingSpectrum] = useState<UserSpectrum | null>(null);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  // const [currentStep, setCurrentStep] = useState<number>(0);

  // Initialize Farcaster SDK
  useEffect(() => {
    let readyCalled = false;
    let readyTimeout: NodeJS.Timeout | null = null;
    
    const init = async () => {
      try {
        console.log('[Squares] Lazy loading Farcaster SDK...');
        const { sdk } = await import('@farcaster/miniapp-sdk');
        
        readyTimeout = setTimeout(async () => {
          if (!readyCalled) {
            try {
              await sdk.actions.ready();
              readyCalled = true;
            } catch (e) {
              console.error('[Squares] Failed to call ready() in timeout:', e);
            }
          }
        }, 2000);
        
        const context = await sdk.context;
        const userInfo = context.user;

        if (!readyCalled) {
          await sdk.actions.ready();
          readyCalled = true;
          if (readyTimeout) clearTimeout(readyTimeout);
        }

        if (userInfo) {
          const farcasterUser: FarcasterUser = {
            fid: userInfo.fid,
            username: userInfo.username,
            displayName: userInfo.displayName,
            pfpUrl: userInfo.pfpUrl,
          };
          
          setUser(farcasterUser);

          // Fetch existing spectrum
          console.log('[Squares] Fetching existing spectrum for FID:', userInfo.fid);
          const response = await fetch(`/api/farcaster/spectrum?fid=${userInfo.fid}`);
          const data = await response.json();

          // Check if data has new CORE fields
          if (data.spectrum && 
              data.spectrum.civil_rights_score !== undefined &&
              data.spectrum.openness_score !== undefined &&
              data.spectrum.redistribution_score !== undefined &&
              data.spectrum.ethics_score !== undefined) {
            
            const spectrum: UserSpectrum = {
              civilRights: data.spectrum.civil_rights_score,
              openness: data.spectrum.openness_score,
              redistribution: data.spectrum.redistribution_score,
              ethics: data.spectrum.ethics_score,
            };
            setExistingSpectrum(spectrum);
            setHasCompletedOnce(true);
            setIsPublic(data.spectrum.is_public || false);
          } else {
            // New user or old schema - treat as new
            setHasCompletedOnce(false);
          }
        }
      } catch (error) {
        console.error('[Squares] Failed to initialize mini app:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
    
    return () => {
      if (readyTimeout) clearTimeout(readyTimeout);
    };
  }, []);

  const handleAssessmentComplete = useCallback(async (spectrum: UserSpectrum, publicVisibility: boolean) => {
    if (!user) return;

    // Check if spectrum has changed
    if (existingSpectrum && hasCompletedOnce) {
      const hasChanged = 
        spectrum.civilRights !== existingSpectrum.civilRights ||
        spectrum.openness !== existingSpectrum.openness ||
        spectrum.redistribution !== existingSpectrum.redistribution ||
        spectrum.ethics !== existingSpectrum.ethics;

      if (hasChanged) {
        setPendingSpectrum(spectrum);
        setShowUpdatePrompt(true);
        return;
      }
    }

    await saveSpectrum(spectrum, publicVisibility);
    setHasCompletedOnce(true);
  }, [user, existingSpectrum, hasCompletedOnce]);

  const saveSpectrum = async (spectrum: UserSpectrum, publicVisibility: boolean) => {
    if (!user) return;

    try {
      const payload = {
        fid: user.fid,
        username: user.username,
        displayName: user.displayName,
        pfpUrl: user.pfpUrl,
        spectrum, // Matches CoreScores structure
        isPublic: publicVisibility,
      };
      
      const response = await fetch('/api/farcaster/spectrum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        setExistingSpectrum(spectrum);
        setIsPublic(publicVisibility);
        
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk');
          await sdk.actions.addMiniApp();
        } catch (e) {
          // Ignore if already added
        }
      }
    } catch (error) {
      console.error('[Squares] Failed to save spectrum:', error);
    }
  };

  const handleVisibilityChange = useCallback(async (publicVisibility: boolean) => {
    setIsPublic(publicVisibility);
    // Ideally we should save this change immediately if we have a spectrum
    if (existingSpectrum) {
      await saveSpectrum(existingSpectrum, publicVisibility);
    }
  }, [existingSpectrum]); // Added dependency

  const handleConfirmUpdate = async () => {
    if (pendingSpectrum) {
      await saveSpectrum(pendingSpectrum, isPublic);
    }
    setShowUpdatePrompt(false);
    setPendingSpectrum(null);
  };

  const handleCancelUpdate = () => {
    setShowUpdatePrompt(false);
    setPendingSpectrum(null);
  };

  if (loading) {
    return <FullPageLoadingSpinner />;
  }

  return (
    <div className={`${styles.container} ${styles.darkMode}`}>
      {showUpdatePrompt && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Update Your Spectrum?</h2>
            <p>Your political positions have changed. Would you like to update your spectrum?</p>
            <div className={styles.modalButtons}>
              <button onClick={handleConfirmUpdate} className={styles.primaryButton}>
                Yes, Update
              </button>
              <button onClick={handleCancelUpdate} className={styles.secondaryButton}>
                No, Keep Current
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Spectrum Header - Commented out until updated */}
      {/* {existingSpectrum && (
        <StickySpectrum spectrum={existingSpectrum} />
      )} */}

      {showAssessment && (
        <CoreAssessment
          initialSpectrum={existingSpectrum || undefined}
          initialStep={existingSpectrum ? 1 : 0} // Skip intro if existing
          initialIsPublic={isPublic}
          onComplete={handleAssessmentComplete}
          onVisibilityChange={handleVisibilityChange}
        />
      )}

      {/* Leaderboard Section - Commented out until updated */}
      {/* {isPublic && <Leaderboard currentFid={user?.fid} />} */}
      
      {/* {!isPublic && <LeaderboardPlaceholder />} */}
    </div>
  );
}
