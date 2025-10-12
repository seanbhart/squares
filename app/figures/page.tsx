"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./figures.module.css";
import { POLICIES, getScoreColor, getEmojiSquare } from "@/lib/tamer-config";
import { ClipboardIcon, CheckIcon } from "@/components/icons";
import type { Figure, FiguresData } from "@/lib/api/figures";

// Load user's assessment from localStorage
const loadUserAssessment = (): Record<number, number> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem('userAssessment');
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

export default function FiguresPage() {
  const [figuresData, setFiguresData] = useState<FiguresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAssessment, setUserAssessment] = useState<Record<number, number> | null>(null);
  const [selectedFigure, setSelectedFigure] = useState<Figure | null>(null);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');

  // Load user assessment from localStorage
  useEffect(() => {
    const assessment = loadUserAssessment();
    setUserAssessment(assessment);
  }, []);

  // Load figures data
  useEffect(() => {
    async function loadFigures() {
      try {
        const response = await fetch('/api/figures');
        if (!response.ok) throw new Error('Failed to fetch figures');
        const data: FiguresData = await response.json();
        setFiguresData(data);
        
        // Set default figure to first featured
        const featuredFigures = data.figures.filter(f => data.featured.includes(f.name));
        if (featuredFigures[0]) {
          setSelectedFigure(featuredFigures[0]);
        }
      } catch (error) {
        console.error('Failed to load figures:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFigures();
  }, []);

  const userEmojiSignature = userAssessment 
    ? POLICIES.map((_, index) => getEmojiSquare(userAssessment[index] ?? 3)).join('')
    : null;

  const letters = ['T', 'A', 'M', 'E', 'R'];

  const handleShareFigure = async (figureName: string, spectrum: number[], label?: string) => {
    const emojiPattern = spectrum.map(value => getEmojiSquare(value)).join('');
    const shareText = label 
      ? `TAME-R political spectrum for ${figureName} (${label}):\n${emojiPattern}\n\nTrade, Abortion, Migration, Economics, Rights — Map yours at squares.vote`
      : `TAME-R political spectrum for ${figureName}:\n${emojiPattern}\n\nTrade, Abortion, Migration, Economics, Rights — Map yours at squares.vote`;

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
        return;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleCopyEmoji = async () => {
    if (!userEmojiSignature) return;

    try {
      await navigator.clipboard.writeText(userEmojiSignature);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setCopyState('error');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  const handleShare = async () => {
    if (!userEmojiSignature) return;

    const shareText = `My TAME-R political spectrum:\n${userEmojiSignature}\n\nTrade, Abortion, Migration, Economics, Rights — Map yours at squares.vote`;

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          text: shareText,
        });
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 2000);
        return;
      } catch (error) {
        // User cancelled or error - fall through to clipboard
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      setShareState('error');
      setTimeout(() => setShareState('idle'), 2000);
    }
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <div className={styles.loadingContainer}>
          <h1>Loading...</h1>
        </div>
      </main>
    );
  }

  // Featured figures in the correct order from featured array
  const featuredFigures = figuresData 
    ? figuresData.featured
        .map(name => figuresData.figures.find(f => f.name === name))
        .filter((f): f is Figure => f !== undefined)
    : [];

  const allFigures = figuresData?.figures || [];

  return (
    <main className={styles.main}>
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Famous Figures</h1>
          <p className={styles.subtitle}>
            {userAssessment 
              ? "Compare your pattern with historical and modern figures"
              : "Explore political positions across history using the TAME-R framework"
            }
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/" className={styles.takeAssessmentButton}>
              {userAssessment ? "← Start Over" : "Take Assessment"}
            </Link>
            {userAssessment && (
              <button 
                onClick={handleShare} 
                className={styles.shareButton}
                data-state={shareState}
              >
                {shareState === 'copied' ? '✓ Copied!' : shareState === 'error' ? 'Error' : '↗ Share'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* User's Assessment - if completed */}
      {userAssessment && (
        <section className={styles.userSection}>
          <div className={styles.userCard}>
            <h2 className={styles.userTitle}>Your Pattern</h2>
            <div className={styles.userSquares}>
              {POLICIES.map((policy, index) => {
                const value = userAssessment[index] ?? 3;
                const color = getScoreColor(policy.key, value);
                
                // Format labels to be consistent with slides
                const getDisplayLabel = (label: string) => {
                  if (label === 'Migration / Immigration') {
                    return { line1: 'Migration /', line2: 'Immigration' };
                  }
                  if (label === 'Rights (civil liberties)') {
                    return { line1: 'Rights', line2: '(civil liberties)' };
                  }
                  return { line1: label, line2: null };
                };
                
                const displayLabel = getDisplayLabel(policy.label);
                
                return (
                  <div key={policy.key} className={styles.userSquareItem}>
                    <div
                      className={styles.userSquare}
                      style={{ backgroundColor: color }}
                    >
                      <span className={styles.squareLetter}>{letters[index]}</span>
                    </div>
                    <span className={styles.squareLabel}>
                      {displayLabel.line1}
                      {displayLabel.line2 && (
                        <>
                          <br />
                          {displayLabel.line2}
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            
            <div className={styles.emojiSignature}>
              <span className={styles.emojiText}>{userEmojiSignature}</span>
              <button
                className={styles.copyButton}
                data-state={copyState}
                onClick={handleCopyEmoji}
              >
                {copyState === 'copied' ? <CheckIcon /> : <ClipboardIcon />}
                <span className={styles.copyButtonText}>
                  {copyState === 'copied' ? 'Copied!' : 'Copy'}
                </span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Two-column layout: Figures on left, Detail on right */}
      <div className={styles.mainContent}>
        {/* Left Column: Dropdown + Figures Grid */}
        <aside className={styles.leftColumn}>
          {/* Dropdown to select any figure */}
          {allFigures.length > 0 && (
            <div className={styles.dropdownContainer}>
              <label htmlFor="figure-select" className={styles.dropdownLabel}>
                Jump to any figure:
              </label>
              <select
                id="figure-select"
                className={styles.dropdown}
                value={selectedFigure?.name || ''}
                onChange={(e) => {
                  const figure = allFigures.find(f => f.name === e.target.value);
                  if (figure) setSelectedFigure(figure);
                }}
              >
                <option value="">Select a figure...</option>
                {allFigures.map((figure) => (
                  <option key={figure.name} value={figure.name}>
                    {figure.name} ({figure.lifespan})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Featured Figures */}
          <section className={styles.figuresSection}>
            <h2 className={styles.sectionTitle}>Featured Figures</h2>
            <div className={styles.figuresGrid}>
              {featuredFigures.map((figure) => (
                <div key={figure.name} className={styles.figureCardWrapper}>
                  <button
                    className={styles.figureCard}
                    data-selected={selectedFigure?.name === figure.name}
                    onClick={() => setSelectedFigure(figure)}
                  >
                    <h3 className={styles.figureName}>{figure.name}</h3>
                    <p className={styles.figureLifespan}>{figure.lifespan}</p>
                    <div className={styles.figureSquares}>
                      {figure.spectrum.map((value, index) => {
                        const policy = POLICIES[index];
                        const color = getScoreColor(policy.key, value);
                        return (
                          <div
                            key={policy.key}
                            className={styles.figureSquare}
                            style={{ backgroundColor: color }}
                            title={`${policy.label}: ${policy.colorRamp[value]}`}
                          />
                        );
                      })}
                    </div>
                  </button>
                  <button
                    className={styles.shareIconButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShareFigure(figure.name, figure.spectrum);
                    }}
                    title="Share this figure"
                  >
                    ↗
                  </button>
                </div>
              ))}
            </div>
          </section>
        </aside>

        {/* Right Column: Selected Figure Detail */}
        <main className={styles.rightColumn}>
          {selectedFigure ? (
            <section className={styles.detailSection}>
              <div className={styles.detailCard}>
                <div className={styles.detailHeader}>
                  <div>
                    <h2 className={styles.detailTitle}>{selectedFigure.name}</h2>
                    <p className={styles.detailLifespan}>{selectedFigure.lifespan}</p>
                  </div>
                  <button
                    className={styles.shareIconButton}
                    onClick={() => handleShareFigure(selectedFigure.name, selectedFigure.spectrum)}
                    title="Share this figure"
                  >
                    ↗
                  </button>
                </div>
            
            <div className={styles.detailSquares}>
              {selectedFigure.spectrum.map((value, index) => {
                const policy = POLICIES[index];
                const color = getScoreColor(policy.key, value);
                return (
                  <div key={policy.key} className={styles.detailSquareItem}>
                    <div
                      className={styles.detailSquare}
                      style={{ backgroundColor: color }}
                    >
                      <span className={styles.squareLetter}>{letters[index]}</span>
                    </div>
                    <div className={styles.detailSquareInfo}>
                      <span className={styles.detailSquareLabel}>{policy.label}</span>
                      <span className={styles.detailSquareValue}>{policy.colorRamp[value]}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedFigure.timeline && selectedFigure.timeline.length > 0 && (
              <div className={styles.timeline}>
                <h3 className={styles.timelineTitle}>Evolution Over Time</h3>
                {selectedFigure.timeline.map((entry, index) => (
                  <div key={index} className={styles.timelineEntry}>
                    <div className={styles.timelineHeader}>
                      <h4 className={styles.timelineLabel}>{entry.label}</h4>
                      <button
                        className={styles.shareIconButton}
                        onClick={() => handleShareFigure(selectedFigure.name, entry.spectrum, entry.label)}
                        title="Share this phase"
                      >
                        ↗
                      </button>
                    </div>
                    <div className={styles.timelineSquares}>
                      {entry.spectrum.map((value, idx) => {
                        const policy = POLICIES[idx];
                        const color = getScoreColor(policy.key, value);
                        return (
                          <div
                            key={policy.key}
                            className={styles.timelineSquare}
                            style={{ backgroundColor: color }}
                            title={`${policy.label}: ${policy.colorRamp[value]}`}
                          />
                        );
                      })}
                    </div>
                    <p className={styles.timelineNote}>{entry.note}</p>
                  </div>
                ))}
              </div>
            )}
              </div>
            </section>
          ) : (
            <div className={styles.emptyState}>
              <h2>Select a figure to see details</h2>
              <p>Choose a figure from the list on the left or use the dropdown above.</p>
            </div>
          )}
        </main>
      </div>

      <footer className={styles.footer}>
        <p>
          <Link href="/" className={styles.footerLink}>Squares.vote</Link> • Mapping political positions with <Link href="/" className={styles.footerLink}>TAME-R</Link>
        </p>
        <Link href="/" className={styles.footerButton}>Take the Assessment</Link>
      </footer>
    </main>
  );
}
