'use client';

import { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import AssessmentSlides from './AssessmentSlides';
import Leaderboard from './Leaderboard';
import StickySpectrum from './StickySpectrum';
import styles from './MiniApp.module.css';

interface FarcasterUser {
  fid: number;
  username?: string;
  displayName?: string;
  pfpUrl?: string;
}

interface UserSpectrum {
  trade: number;
  abortion: number;
  migration: number;
  economics: number;
  rights: number;
}

export default function MiniAppClient() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [existingSpectrum, setExistingSpectrum] = useState<UserSpectrum | null>(null);
  const [showAssessment, setShowAssessment] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [pendingSpectrum, setPendingSpectrum] = useState<UserSpectrum | null>(null);
  const [hasCompletedOnce, setHasCompletedOnce] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Update current step when existing spectrum is loaded
  useEffect(() => {
    if (existingSpectrum) {
      setCurrentStep(3); // Results slide
    }
  }, [existingSpectrum]);

  // Initialize Farcaster SDK
  useEffect(() => {
    const init = async () => {
      try {
        console.log('[Squares] Initializing Farcaster SDK...');
        
        // Get context from Farcaster
        const context = await sdk.context;
        console.log('[Squares] SDK context received:', context);
        
        const userInfo = context.user;
        console.log('[Squares] User info:', userInfo);

        // Signal that the app is ready FIRST to dismiss splash screen
        await sdk.actions.ready();
        console.log('[Squares] App signaled ready');

        if (userInfo) {
          const farcasterUser: FarcasterUser = {
            fid: userInfo.fid,
            username: userInfo.username,
            displayName: userInfo.displayName,
            pfpUrl: userInfo.pfpUrl,
          };
          
          setUser(farcasterUser);
          console.log('[Squares] Farcaster user set:', farcasterUser);

          // Fetch existing spectrum if any
          console.log('[Squares] Fetching existing spectrum for FID:', userInfo.fid);
          const response = await fetch(`/api/farcaster/spectrum?fid=${userInfo.fid}`);
          const data = await response.json();
          console.log('[Squares] Spectrum API response:', data);

          if (data.spectrum) {
            // User has taken the assessment before
            const spectrum = {
              trade: data.spectrum.trade_score,
              abortion: data.spectrum.abortion_score,
              migration: data.spectrum.migration_score,
              economics: data.spectrum.economics_score,
              rights: data.spectrum.rights_score,
            };
            setExistingSpectrum(spectrum);
            setHasCompletedOnce(true);
            setIsPublic(data.spectrum.is_public || false);
            console.log('[Squares] Existing spectrum loaded:', spectrum);
            console.log('[Squares] is_public:', data.spectrum.is_public);
          } else {
            // New user, show assessment
            setHasCompletedOnce(false);
            console.log('[Squares] New user - no existing spectrum');
          }
        }
      } catch (error) {
        console.error('[Squares] Failed to initialize mini app:', error);
        await sdk.actions.ready();
      } finally {
        setLoading(false);
        console.log('[Squares] Initialization complete');
      }
    };

    init();
  }, []);

  const handleAssessmentComplete = useCallback(async (spectrum: UserSpectrum, publicVisibility: boolean) => {
    console.log('[Squares] Assessment complete called:', { spectrum, publicVisibility });
    
    if (!user) {
      console.log('[Squares] No user found, cannot save');
      return;
    }

    // Check if spectrum has changed from existing
    if (existingSpectrum && hasCompletedOnce) {
      const hasChanged = 
        spectrum.trade !== existingSpectrum.trade ||
        spectrum.abortion !== existingSpectrum.abortion ||
        spectrum.migration !== existingSpectrum.migration ||
        spectrum.economics !== existingSpectrum.economics ||
        spectrum.rights !== existingSpectrum.rights;

      if (hasChanged) {
        console.log('[Squares] Spectrum changed, showing update prompt');
        // Show update prompt
        setPendingSpectrum(spectrum);
        setShowUpdatePrompt(true);
        return;
      }
    }

    // Save spectrum (new user or no changes)
    console.log('[Squares] Saving spectrum...');
    await saveSpectrum(spectrum, publicVisibility);
    setHasCompletedOnce(true);
  }, [user, existingSpectrum, hasCompletedOnce]);

  const saveSpectrum = async (spectrum: UserSpectrum, publicVisibility: boolean) => {
    if (!user) {
      console.log('[Squares] No user, cannot save spectrum');
      return;
    }

    try {
      const payload = {
        fid: user.fid,
        username: user.username,
        displayName: user.displayName,
        pfpUrl: user.pfpUrl,
        spectrum,
        isPublic: publicVisibility,
      };
      
      console.log('[Squares] Saving spectrum with payload:', payload);
      
      const response = await fetch('/api/farcaster/spectrum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[Squares] Save response status:', response.status);
      const data = await response.json();
      console.log('[Squares] Save response data:', data);

      if (data.success) {
        console.log('[Squares] Successfully saved spectrum!');
        setExistingSpectrum(spectrum);
        setIsPublic(publicVisibility);
        
        // Add mini app if not already added
        try {
          await sdk.actions.addMiniApp();
          console.log('[Squares] Mini app added');
        } catch (e) {
          // User may have already added the app
          console.log('[Squares] App already added or user declined');
        }
      } else {
        console.error('[Squares] Save failed:', data);
      }
    } catch (error) {
      console.error('[Squares] Failed to save spectrum:', error);
    }
  };

  const handleVisibilityChange = useCallback(async (publicVisibility: boolean) => {
    console.log('[Squares] Visibility changed to:', publicVisibility);
    setIsPublic(publicVisibility);
  }, []);

  const handleStepChange = useCallback((step: number) => {
    setCurrentStep(step);
  }, []);

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
    return (
      <div className={`${styles.container} ${styles.darkMode}`}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles.darkMode}`}>
      {/* Update Prompt Modal */}
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

      {/* Sticky Spectrum Header - Shows when on results slide (step 3) */}
      {existingSpectrum && currentStep === 3 && (
        <StickySpectrum spectrum={existingSpectrum} />
      )}

      {/* Assessment Slides - Always visible at top */}
      {showAssessment && (
        <AssessmentSlides
          initialSpectrum={existingSpectrum || undefined}
          initialStep={existingSpectrum ? 3 : 0}
          initialIsPublic={isPublic}
          onComplete={handleAssessmentComplete}
          onVisibilityChange={handleVisibilityChange}
          onStepChange={handleStepChange}
          hideSpectrumCard={currentStep === 3}
        />
      )}

      {/* Leaderboard Section - Only visible if user has revealed their spectrum */}
      {isPublic && <Leaderboard currentFid={user?.fid} />}
    </div>
  );
}
