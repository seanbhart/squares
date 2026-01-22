"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import FullPageLoadingSpinner from "@/components/FullPageLoadingSpinner";
import styles from "./figures.module.css";
import { CORE_DIMENSIONS, getDimensionColor } from "@/lib/core-config";
import { ClipboardIcon, CheckIcon, MessageCircleIcon } from "@/components/icons";
import FiguresChatBox, { type Message } from "@/components/FiguresChatBox";
import type { Figure, FiguresData } from "@/lib/api/figures";

type ChatFigure = {
  name: string;
  spectrum: (number | null)[];
  confidence?: number;
  reasoning?: string;
  isFromChat: true;
};

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
  const [selectedFigure, setSelectedFigure] = useState<Figure | ChatFigure | null>(null);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle');
  const [chatMinimized, setChatMinimized] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOverlayMode, setMobileOverlayMode] = useState<'figure' | 'chat'>('figure');
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const detailSectionRef = useRef<HTMLElement>(null);
  
  // Subdomain URLs - simple environment-based approach
  const dataUrl = process.env.NODE_ENV === 'production' 
    ? 'https://data.squares.vote' 
    : 'http://data.localhost:3000';
  const developerUrl = process.env.NODE_ENV === 'production'
    ? 'https://developer.squares.vote'
    : 'http://developer.localhost:3000';
  const mainSiteUrl = process.env.NODE_ENV === 'production'
    ? 'https://squares.vote'
    : 'http://localhost:3000';

  // Prevent body scroll when overlay is open on mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 1024;
    if (selectedFigure && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedFigure]);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        
        // On desktop, select first featured figure by default
        if (data.featured.length > 0 && window.innerWidth >= 1024) {
          const firstFeaturedName = data.featured[0];
          const firstFigure = data.figures.find(f => f.name === firstFeaturedName);
          if (firstFigure) {
            setSelectedFigure(firstFigure);
          }
        }
      } catch (error) {
        console.error('Error loading figures:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFigures();
  }, []);

  // Generate emoji signature for CORE (4 dimensions, 0-5 scale)
  const getEmojiForScore = (score: number): string => {
    // CORE uses 0-5 scale (6 values)
    const emojis = ['🟦', '🟩', '🟨', '🟧', '🟥', '🟪'];
    return emojis[Math.min(Math.max(score, 0), 5)];
  };

  const userEmojiSignature = userAssessment
    ? CORE_DIMENSIONS.map((_, index) => getEmojiForScore(userAssessment[index] ?? 2)).join('')
    : null;

  const letters = ['C', 'O', 'R', 'E'];

  const handleShareFigure = async (figureName: string, spectrum: (number | null)[], label?: string) => {
    const emojiPattern = spectrum.map(value => value !== null ? getEmojiForScore(value) : '⬜').join('');
    const shareText = label
      ? `Political spectrum for ${figureName} (${label}):\n${emojiPattern}\n\nCivil Rights, Openness, Redistribution, Ethics — Square yourself at squares.vote`
      : `Political spectrum for ${figureName}:\n${emojiPattern}\n\nCivil Rights, Openness, Redistribution, Ethics — Square yourself at squares.vote`;

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

  const handleChatSpectrumData = (data: { name: string; spectrum: (number | null)[]; confidence?: number; reasoning?: string }) => {
    // Try to find figure in database first
    const existingFigure = figuresData?.figures.find(
      f => f.name.toLowerCase() === data.name.toLowerCase()
    );

    if (existingFigure) {
      // Use existing figure from database
      setSelectedFigure(existingFigure);
    } else {
      // Create temporary chat figure
      const chatFigure: ChatFigure = {
        name: data.name,
        spectrum: data.spectrum,
        confidence: data.confidence,
        reasoning: data.reasoning,
        isFromChat: true
      };
      setSelectedFigure(chatFigure);
    }

    // On desktop, scroll to info box and minimize chat
    if (!isMobile) {
      setChatMinimized(true);
      setTimeout(() => {
        detailSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      // On mobile, switch overlay to figure mode
      setMobileOverlayMode('figure');
    }
  };

  const handleMobileChatOpen = () => {
    setMobileChatOpen(true);
    setMobileOverlayMode('chat');
    setSelectedFigure({
      name: '',
      spectrum: [2, 2, 2, 2],
      isFromChat: true
    } as ChatFigure);
  };

  const handleMobileChatClose = () => {
    setMobileChatOpen(false);
    setSelectedFigure(null);
  };

  const handleFigureSelect = (figure: Figure) => {
    setSelectedFigure(figure);
    // On mobile, ensure we're showing figure info, not chat
    if (isMobile) {
      setMobileOverlayMode('figure');
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

    const shareText = `My political personality Squares:\n${userEmojiSignature}\n\nCivil Rights, Openness, Redistribution, Ethics — Square yourself at squares.vote`;

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
    return <FullPageLoadingSpinner />;
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
              ? "Compare your Squares with historical and modern figures"
              : "Explore political personalities across history using Squares"
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
              {CORE_DIMENSIONS.map((dimension, index) => {
                const value = userAssessment[index] ?? 2;
                const color = getDimensionColor(value);

                return (
                  <div key={dimension.key} className={styles.userSquareItem}>
                    <div
                      className={styles.userSquare}
                      style={{ backgroundColor: color }}
                    >
                      <span className={styles.squareLetter}>{letters[index]}</span>
                    </div>
                    <span className={styles.squareLabel}>
                      {dimension.name}
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

      {/* Mobile overlay backdrop - outside grid */}
      {selectedFigure && (
        <div 
          className={styles.mobileOverlay} 
          onClick={() => setSelectedFigure(null)}
          aria-hidden="true"
        />
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
                  if (figure) handleFigureSelect(figure);
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
                    onClick={() => handleFigureSelect(figure)}
                  >
                    <h3 className={styles.figureName}>{figure.name}</h3>
                    <p className={styles.figureLifespan}>{figure.lifespan}</p>
                    <div className={styles.figureSquares}>
                      {figure.spectrum.map((value, index) => {
                        const dimension = CORE_DIMENSIONS[index];
                        if (!dimension) return null;
                        const color = getDimensionColor(value);
                        const label = value <= 2 ? dimension.negativeLabel : dimension.positiveLabel;
                        return (
                          <div
                            key={dimension.key}
                            className={styles.figureSquare}
                            style={{ backgroundColor: color }}
                            title={`${dimension.name}: ${label}`}
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
            <section className={styles.detailSection} data-mobile-open={!!selectedFigure} ref={detailSectionRef}>
              {/* Chat notification banner */}
              {'isFromChat' in selectedFigure && selectedFigure.isFromChat && selectedFigure.name && (
                <div className={styles.chatBanner}>
                  💬 Generated by Chat
                </div>
              )}
              
              {/* Mobile chat integration */}
              {isMobile && mobileOverlayMode === 'chat' && (
                <div className={styles.mobileChatContainer}>
                  <div className={styles.mobileChatHeader}>
                    <button
                      className={styles.mobileCloseButton}
                      onClick={handleMobileChatClose}
                      aria-label="Close chat"
                    >
                      ←
                    </button>
                    <h2 className={styles.detailTitle}>Chat with Squares</h2>
                  </div>
                  <FiguresChatBox
                    onSpectrumData={handleChatSpectrumData}
                    isMobile={true}
                    messages={chatMessages}
                    onMessagesChange={setChatMessages}
                  />
                </div>
              )}

              {/* Figure details (show for non-chat mode or when we have figure data) */}
              {(!isMobile || mobileOverlayMode === 'figure') && selectedFigure.name && (
                <div className={styles.detailCard}>
                  <div className={styles.detailHeader}>
                    {/* Mobile close button */}
                    <button
                      className={styles.mobileCloseButton}
                      onClick={() => setSelectedFigure(null)}
                      aria-label="Close detail view"
                    >
                      ←
                    </button>
                    
                    <div className={styles.detailHeaderContent}>
                      <h2 className={styles.detailTitle}>{selectedFigure.name}</h2>
                      {'lifespan' in selectedFigure && selectedFigure.lifespan && (
                        <p className={styles.detailLifespan}>{selectedFigure.lifespan}</p>
                      )}
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
                const dimension = CORE_DIMENSIONS[index];
                if (!dimension) return null;
                const color = value !== null ? getDimensionColor(value) : '#ffffff';
                const label = value !== null
                  ? (value <= 2 ? dimension.negativeLabel : dimension.positiveLabel)
                  : 'Unknown';
                return (
                  <div key={dimension.key} className={styles.detailSquareItem}>
                    <div
                      className={styles.detailSquare}
                      style={{
                        backgroundColor: color,
                        border: value === null ? '2px solid #dee2e6' : undefined
                      }}
                    >
                      <span className={styles.squareLetter}>{letters[index]}</span>
                    </div>
                    <div className={styles.detailSquareInfo}>
                      <span className={styles.detailSquareLabel}>{dimension.name}</span>
                      <span className={styles.detailSquareValue}>{label}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {'timeline' in selectedFigure && selectedFigure.timeline && selectedFigure.timeline.length > 0 && (
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
                        const dimension = CORE_DIMENSIONS[idx];
                        if (!dimension) return null;
                        const color = getDimensionColor(value);
                        const label = value <= 2 ? dimension.negativeLabel : dimension.positiveLabel;
                        return (
                          <div
                            key={dimension.key}
                            className={styles.timelineSquare}
                            style={{ backgroundColor: color }}
                            title={`${dimension.name}: ${label}`}
                          />
                        );
                      })}
                    </div>
                    <p className={styles.timelineNote}>{entry.note}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Chat reasoning if from chat */}
            {'isFromChat' in selectedFigure && selectedFigure.isFromChat && selectedFigure.reasoning && (
              <div className={styles.chatReasoning}>
                <h3 className={styles.timelineTitle}>AI Assessment Reasoning</h3>
                <p className={styles.reasoningText}>{selectedFigure.reasoning}</p>
                {'confidence' in selectedFigure && selectedFigure.confidence && (
                  <p className={styles.confidenceText}>
                    Confidence: {selectedFigure.confidence}%
                  </p>
                )}
              </div>
            )}
              </div>
            )}
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
          <a href={dataUrl} className={styles.footerLink}>Public Data</a> • Squaring political personalities with <a href={mainSiteUrl} className={styles.footerLink}>CORE</a> • <a href={developerUrl} className={styles.footerLink}>Developers</a>
        </p>
        <a href={mainSiteUrl} className={styles.footerButton}>Take the Assessment</a>
      </footer>

      {/* Desktop Chat */}
      {!isMobile && (
        <FiguresChatBox
          onSpectrumData={handleChatSpectrumData}
          isMinimized={chatMinimized}
          onToggleMinimize={() => setChatMinimized(!chatMinimized)}
          isMobile={false}
          messages={chatMessages}
          onMessagesChange={setChatMessages}
        />
      )}

      {/* Mobile Chat Button */}
      {isMobile && !selectedFigure && (
        <button
          className={styles.mobileChatButton}
          onClick={handleMobileChatOpen}
          aria-label="Open chat"
        >
          <MessageCircleIcon />
        </button>
      )}
    </main>
  );
}
