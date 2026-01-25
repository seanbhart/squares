'use client';

import React, { useState, useEffect } from 'react';
import styles from './CoreAssessment.module.css';
import { AXES } from '@/lib/bloc-config';
import { sdk } from '@farcaster/miniapp-sdk';

type AxisKey = 'civilRights' | 'openness' | 'redistribution' | 'ethics';

export interface CoreScores {
  civilRights: number;
  openness: number;
  redistribution: number;
  ethics: number;
}

interface CoreAssessmentProps {
  initialSpectrum?: CoreScores;
  initialStep?: number; // 0 = Intro, 1 = Grid/Results
  initialIsPublic?: boolean;
  onComplete: (spectrum: CoreScores, isPublic: boolean) => void;
  onVisibilityChange?: (isPublic: boolean) => void;
}

export default function CoreAssessment({ 
  initialSpectrum, 
  initialStep = 0, 
  initialIsPublic = false,
  onComplete, 
  onVisibilityChange 
}: CoreAssessmentProps) {
  const [showIntro, setShowIntro] = useState(initialStep === 0 && !initialSpectrum);
  
  // Grid State
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeAxis, setActiveAxis] = useState<AxisKey | null>(null);
  const [selectedValues, setSelectedValues] = useState<Record<AxisKey, number | null>>({
    civilRights: initialSpectrum?.civilRights ?? null,
    openness: initialSpectrum?.openness ?? null,
    redistribution: initialSpectrum?.redistribution ?? null,
    ethics: initialSpectrum?.ethics ?? null,
  });
  const [isPublic, setIsPublic] = useState(initialIsPublic);

  // Auto-save when all dimensions are selected
  useEffect(() => {
    if (
      selectedValues.civilRights !== null &&
      selectedValues.openness !== null &&
      selectedValues.redistribution !== null &&
      selectedValues.ethics !== null
    ) {
      const spectrum: CoreScores = {
        civilRights: selectedValues.civilRights,
        openness: selectedValues.openness,
        redistribution: selectedValues.redistribution,
        ethics: selectedValues.ethics,
      };
      onComplete(spectrum, isPublic);
    }
  }, [selectedValues, isPublic, onComplete]);

  const handleValueSelect = (axis: AxisKey, value: number) => {
    setSelectedValues(prev => ({ ...prev, [axis]: value }));
    setActiveAxis(null);
  };

  const handleReset = () => {
    setSelectedValues({
      civilRights: null,
      openness: null,
      redistribution: null,
      ethics: null,
    });
  };

  const handleToggleVisibility = () => {
    const newVisibility = !isPublic;
    setIsPublic(newVisibility);
    if (onVisibilityChange) {
      onVisibilityChange(newVisibility);
    }
  };

  const handleShare = async () => {
    if (!Object.values(selectedValues).every(v => v !== null)) return;
    
    const emojis = [
      getEmoji(selectedValues.civilRights!),
      getEmoji(selectedValues.openness!),
      getEmoji(selectedValues.redistribution!),
      getEmoji(selectedValues.ethics!)
    ].join('');
    
    const shareText = `I just discovered my political CORE: ${emojis}\n\nThink you're similar? Find your call sign:`;
    
    try {
      await sdk.actions.composeCast({
        text: shareText,
        embeds: ['https://farcaster.squares.vote/miniapp'],
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const getEmoji = (value: number) => {
    // Simple mapping to colored squares
    const map = ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥'];
    return map[value] || '⬛';
  };

  // --- Intro Render Logic ---
  const renderIntro = () => (
    <div className={styles.introOverlay} style={{ position: 'fixed', overflowY: 'scroll' }}>
      <div className={styles.introContent}>
        {/* Section 1: Problem Statement */}
        <section className={styles.introSection}>
          <h1 className={styles.introTitle}>
            labels <span className={styles.brokenText}>lie</span>
          </h1>
          <div className={styles.labelCloud}>
            <span className={styles.blurLabel} style={{ animationDelay: '0s' }}>Liberal</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.2s' }}>Conservative</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.4s' }}>Moderate</span>
            <span className={styles.blurLabel} style={{ animationDelay: '0.6s' }}>Libertarian</span>
          </div>
          <p className={styles.introSubtitle}>
            One word can't capture what you actually believe.
            <br />
            Your politics have depth—let's map it.
          </p>
          <div className={styles.scrollIndicator}>see how ↓</div>
        </section>

        {/* Section 2: CORE Introduction (combined) */}
        <section className={styles.introSection}>
          <h2 className={styles.sectionTitle}>Four dimensions. One map.</h2>
          <p className={styles.sectionText}>
            Each is a spectrum—where do you land on each?
          </p>
          <div className={styles.coreGrid}>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter} style={{ color: 'var(--color-purple)' }}>C</div>
              <div className={styles.coreLabel}>Civil Rights</div>
              <div className={styles.coreAxis}>Liberty ↔ Authority</div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter} style={{ color: 'var(--color-blue)' }}>O</div>
              <div className={styles.coreLabel}>Openness</div>
              <div className={styles.coreAxis}>Global ↔ National</div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter} style={{ color: 'var(--color-green)' }}>R</div>
              <div className={styles.coreLabel}>Redistribution</div>
              <div className={styles.coreAxis}>Market ↔ Social</div>
            </div>
            <div className={styles.coreItem}>
              <div className={styles.coreLetter} style={{ color: 'var(--color-gold)' }}>E</div>
              <div className={styles.coreLabel}>Ethics</div>
              <div className={styles.coreAxis}>Progressive ↔ Traditional</div>
            </div>
          </div>
        </section>

        {/* Section 3: CTA with time estimate */}
        <section className={styles.introSection}>
          <button className={styles.startCta} onClick={() => setShowIntro(false)}>
            I know where I stand
          </button>
          <p style={{
            color: 'rgba(255, 255, 255, 0.4)',
            fontSize: '0.8rem',
            marginTop: '1rem',
            textAlign: 'center'
          }}>
            1 minute. Completely private.
          </p>
        </section>
      </div>
    </div>
  );

  // --- Grid Render Logic ---
  
  const indexToAxis: Record<number, AxisKey> = {
    1: 'civilRights',
    2: 'openness',
    4: 'redistribution',
    5: 'ethics',
  };
  
  const indexToLetter: Record<number, string> = {
    1: 'C', 2: 'O', 4: 'R', 5: 'E',
  };

  const emptyToColoredMap: Record<number, number> = {
    0: 1, 3: 2, 7: 4, 8: 5,
  };
  
  const emptyLetterMap: Record<number, { low: string; high: string }> = {
    0: { low: 'L', high: 'A' },
    3: { low: 'G', high: 'N' },
    7: { low: 'M', high: 'S' },
    8: { low: 'P', high: 'T' },
  };

  const renderCell = (type: 'empty' | 'filled' | 'special', i: number) => {
    const axis = indexToAxis[i];
    const selectedValue = axis ? selectedValues[axis] : null;

    // Empty Squares
    if (type === 'empty') {
      const correspondingIndex = emptyToColoredMap[i];
      const correspondingAxis = correspondingIndex ? indexToAxis[correspondingIndex] : null;
      const correspondingValue = correspondingAxis ? selectedValues[correspondingAxis] : null;
      const letterMapping = emptyLetterMap[i];
      
      let emptyColor = 'var(--gray-300)';
      let emptyLetter = '';
      
      if (correspondingValue !== null && letterMapping) {
        const isLowIntensity = correspondingValue <= 2;
        emptyColor = isLowIntensity ? 'var(--gray-100)' : 'var(--gray-900)';
        emptyLetter = isLowIntensity ? letterMapping.low : letterMapping.high;
      }
      
      return (
        <div 
          key={i} 
          className={styles.gridCell}
          style={{ background: emptyColor, border: 'var(--square-border)' }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {emptyLetter && (
            <span style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              fontSize: '12vmin', fontWeight: 'bold',
              color: emptyColor === 'var(--gray-900)' ? 'var(--gray-100)' : 'var(--gray-900)',
            }}>
              {emptyLetter}
            </span>
          )}
        </div>
      );
    }

    // Filled Squares (Interactive)
    if (type === 'filled') {
      let background = 'var(--gray-500)';
      if (selectedValue !== null) {
        const map = [
          'var(--color-purple)', 'var(--color-blue)', 'var(--color-green)',
          'var(--color-gold)', 'var(--color-orange)', 'var(--color-red)'
        ];
        background = map[selectedValue] || background;
      }

      return (
        <div 
          key={i} 
          className={styles.gridCell}
          style={{ background, cursor: 'pointer', border: 'var(--square-border)' }}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setActiveAxis(axis)}
        >
          <span style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            fontSize: '12vmin', fontWeight: 'bold', color: 'var(--background)'
          }}>
            {indexToLetter[i]}
          </span>
        </div>
      );
    }

    // Special Square (bottom left) - corner brackets only, no background
    const bracketSize = 'clamp(22px, 6vmin, 50px)';
    const bracketThickness = 'clamp(4px, 1vmin, 8px)';
    const bracketColor = 'rgba(255, 255, 255, 0.85)';
    const bracketRadius = '35%';

    const cornerStyle = (position: 'tl' | 'tr' | 'bl' | 'br'): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: 'absolute',
        width: bracketSize,
        height: bracketSize,
        borderColor: bracketColor,
        borderStyle: 'solid',
        borderWidth: '0',
      };

      switch (position) {
        case 'tl':
          return { ...base, top: '5%', left: '5%', borderTopWidth: bracketThickness, borderLeftWidth: bracketThickness, borderTopLeftRadius: bracketRadius };
        case 'tr':
          return { ...base, top: '5%', right: '5%', borderTopWidth: bracketThickness, borderRightWidth: bracketThickness, borderTopRightRadius: bracketRadius };
        case 'bl':
          return { ...base, bottom: '5%', left: '5%', borderBottomWidth: bracketThickness, borderLeftWidth: bracketThickness, borderBottomLeftRadius: bracketRadius };
        case 'br':
          return { ...base, bottom: '5%', right: '5%', borderBottomWidth: bracketThickness, borderRightWidth: bracketThickness, borderBottomRightRadius: bracketRadius };
      }
    };

    return (
      <div key={i} className={styles.gridCell} style={{ background: 'transparent', border: 'none', boxShadow: 'none', position: 'relative' }}>
        <div style={cornerStyle('tl')} />
        <div style={cornerStyle('tr')} />
        <div style={cornerStyle('bl')} />
        <div style={cornerStyle('br')} />
      </div>
    );
  };

  // --- Modal Render Logic ---
  const renderModal = () => {
    if (!activeAxis) return null;
    const axis = AXES[activeAxis];
    const emptyIndex = { civilRights: 0, openness: 3, redistribution: 7, ethics: 8 }[activeAxis];
    const letters = emptyLetterMap[emptyIndex];

    // Colors for the 6-point scale
    const colorScale = [
      { value: 0, color: 'var(--color-purple)' },
      { value: 1, color: 'var(--color-blue)' },
      { value: 2, color: 'var(--color-green)' },
      { value: 3, color: 'var(--color-gold)' },
      { value: 4, color: 'var(--color-orange)' },
      { value: 5, color: 'var(--color-red)' },
    ];

    return (
      <div className={styles.modalOverlay} onClick={() => setActiveAxis(null)}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <button className={styles.modalClose} onClick={() => setActiveAxis(null)}>×</button>
          <div className={styles.modalHeader}>
            <div className={styles.modalName}>{axis.name}</div>
            <div className={styles.modalCallSign}>{letters.low} ↔ {letters.high}</div>
            <div className={styles.modalText} style={{textAlign: 'center', fontSize: '0.9rem', opacity: 0.8}}>{axis.description}</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {colorScale.map((item) => {
              const descriptor = axis.values[item.value];
              const isSelected = selectedValues[activeAxis] === item.value;
              
              return (
                <div 
                  key={item.value}
                  onClick={() => handleValueSelect(activeAxis, item.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.75rem', borderRadius: '0.5rem',
                    background: isSelected ? 'rgba(255,255,255,0.1)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '8px',
                    background: item.value <= 2 ? 'var(--gray-100)' : 'var(--gray-900)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold', color: item.value <= 2 ? 'var(--gray-900)' : 'var(--gray-100)',
                    border: 'var(--square-border)'
                  }}>
                    {item.value <= 2 ? letters.low : letters.high}
                  </div>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: item.color, border: 'var(--square-border)' }} />
                  <div style={{ flex: 1, fontSize: '0.9rem' }}>{descriptor}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Main Render
  if (showIntro) {
    return renderIntro();
  }

  const cells: Array<'empty' | 'filled' | 'special'> = [
    'empty', 'filled', 'filled',
    'empty', 'filled', 'filled',
    'special', 'empty', 'empty',
  ];

  const hasAllSelected = Object.values(selectedValues).every(v => v !== null);

  return (
    <div className={styles.page} style={{ flexDirection: 'column', paddingTop: '2rem' }}>
      <button className={styles.introTrigger} onClick={() => setShowIntro(true)}>
        About CORE
      </button>

      <div className={styles.grid} style={{ width: 'min(85vw, 85vh)', height: 'min(85vw, 85vh)' }}>
        {cells.map(renderCell)}
      </div>

      {hasAllSelected && (
        <div className={styles.summaryContainer}>
          <div className={styles.resultsButtons}>
            <button onClick={handleShare} className={styles.startCta} style={{ width: '100%', marginTop: '1rem' }}>
              Share your CORE
            </button>
            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
              <button onClick={handleToggleVisibility} className={styles.resetButton} style={{ flex: 1, justifyContent: 'center' }}>
                {isPublic ? 'Make Private' : 'Make Public'}
              </button>
              <button onClick={handleReset} className={styles.resetButton} style={{ flex: 1, justifyContent: 'center' }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {renderModal()}
    </div>
  );
}

