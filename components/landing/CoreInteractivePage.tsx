'use client';

import React from 'react';
import styles from './CoreLanding.module.css';
import { COLOR_RAMP, AXES, getAllTypes, getTypePosition, getTypeName, getTypeSingularName, getTypeDescription, getAllSubTypesWithMeta, generateCallSign, TypeId, SubTypeWithMeta, FAMILY_NAMES } from '@/lib/bloc-config';
import CoreIntroModal from './CoreIntroModal';

type AxisKey = 'civilRights' | 'openness' | 'redistribution' | 'ethics';

export default function CoreInteractivePage() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [activeAxis, setActiveAxis] = React.useState<AxisKey | null>(null);
  const [hoveredValue, setHoveredValue] = React.useState<number | null>(null);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState<Record<AxisKey, number | null>>({
    civilRights: null,
    openness: null,
    redistribution: null,
    ethics: null,
  });
  const [viewingBloc, setViewingBloc] = React.useState<SubTypeWithMeta | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [showIntro, setShowIntro] = React.useState(true);
  
  // Persistence: Load from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem('core_squares_selection');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSelectedValues(parsed);
      } catch (e) {
        console.error('Failed to parse saved selection', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Persistence: Save to localStorage when selection changes
  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('core_squares_selection', JSON.stringify(selectedValues));
    }
  }, [selectedValues, isLoaded]);
  
  // Lock scroll when modal is open
  React.useEffect(() => {
    if (viewingBloc) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingBloc]);
  
  // Trigger entrance animation when intro modal is closed
  React.useEffect(() => {
    if (!showIntro) {
      // Small delay to ensure smooth transition after modal closes
      const timer = setTimeout(() => setHasAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);
  
  // Map grid indices to CORE letters and axis keys
  const indexToAxis: Record<number, AxisKey> = {
    1: 'civilRights',
    2: 'openness',
    4: 'redistribution',
    5: 'ethics',
  };
  
  const indexToLetter: Record<number, string> = {
    1: 'C',
    2: 'O',
    4: 'R',
    5: 'E',
  };
  
  // Define the 7-point scale with colors (purple to red)
  const colorScale = [
    { value: 0, color: COLOR_RAMP.purple, label: 'Strongly' },
    { value: 1, color: COLOR_RAMP.blue, label: 'Moderately' },
    { value: 2, color: COLOR_RAMP.green, label: 'Slightly' },
    { value: 3, color: COLOR_RAMP.gold, label: 'Slightly' },
    { value: 4, color: COLOR_RAMP.orange, label: 'Moderately' },
    { value: 5, color: COLOR_RAMP.red, label: 'Strongly' },
  ];
  
  // Use 80% of the smaller viewport dimension
  const containerSize = 'min(80vh, 80vw)';
  
  const grid: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '4%',
    width: containerSize,
    height: containerSize,
  };

  const base: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '20%',
    background: '#d6d6d6',
  };

  const filled: React.CSSProperties = {
    ...base,
    background: '#7b4c96',
  };

  const special: React.CSSProperties = {
    width: '95%',
    height: '95%',
    placeSelf: 'center',
    borderRadius: '16%',
    border: 'clamp(5px, 1.3vmin, 13px) solid #d6d6d6',
    background: 'transparent',
    WebkitMask: `
      linear-gradient(#000 0 0) top left,
      linear-gradient(#000 0 0) top right,
      linear-gradient(#000 0 0) bottom left,
      linear-gradient(#000 0 0) bottom right
    `,
    WebkitMaskSize: '32% 32%',
    WebkitMaskRepeat: 'no-repeat',
    mask: `
      linear-gradient(#000 0 0) top left,
      linear-gradient(#000 0 0) top right,
      linear-gradient(#000 0 0) bottom left,
      linear-gradient(#000 0 0) bottom right
    `,
    maskSize: '30% 30%',
    maskRepeat: 'no-repeat',
  };

  const cells: Array<'empty' | 'filled' | 'special'> = [
    'empty',
    'filled',
    'filled',
    'empty',
    'filled',
    'filled',
    'special',
    'empty',
    'empty',
  ];

  // Map empty squares to their corresponding colored squares
  const emptyToColoredMap: Record<number, number> = {
    0: 1,  // top-left empty → C (civilRights)
    3: 2,  // left-middle empty → O (openness)
    7: 4,  // bottom-middle empty → R (redistribution)
    8: 5,  // bottom-right empty → E (ethics)
  };
  
  // Map empty squares to their letters based on intensity
  const emptyLetterMap: Record<number, { low: string; high: string }> = {
    0: { low: 'L', high: 'A' },  // Civil Rights
    3: { low: 'G', high: 'N' },  // Openness
    7: { low: 'M', high: 'S' },  // Redistribution
    8: { low: 'P', high: 'T' },  // Ethics
  };

  const handleValueSelect = (axis: AxisKey, value: number) => {
    setSelectedValues(prev => ({ ...prev, [axis]: value }));
    setActiveAxis(null);
  };
  
  // Check if any selection has been made
  const hasAnySelection = Object.values(selectedValues).some(v => v !== null);
  
  const handleReset = () => {
    setSelectedValues({
      civilRights: null,
      openness: null,
      redistribution: null,
      ethics: null,
    });
    setHasAnimated(false);
    setTimeout(() => setHasAnimated(true), 50);
  };
  
  // Get animation delay for entrance animation
  const getAnimationDelay = (index: number): number => {
    const animationOrder = [1, 2, 4, 5]; // C, O, R, E
    const orderIndex = animationOrder.indexOf(index);
    return orderIndex >= 0 ? orderIndex * 0.15 : 0; // 150ms between each
  };

  const renderCell = (type: 'empty' | 'filled' | 'special', i: number) => {
    const isHovered = hoveredIndex === i;
    const letter = indexToLetter[i];
    const axis = indexToAxis[i];
    const selectedValue = axis ? selectedValues[axis] : null;
    
    // For empty squares, determine color based on corresponding colored square
    if (type === 'empty') {
      const correspondingIndex = emptyToColoredMap[i];
      const correspondingAxis = correspondingIndex ? indexToAxis[correspondingIndex] : null;
      const correspondingValue = correspondingAxis ? selectedValues[correspondingAxis] : null;
      const letterMapping = emptyLetterMap[i];
      
      let emptyColor = '#d6d6d6'; // default grey
      let emptyLetter = '';
      
      if (correspondingValue !== null && letterMapping) {
        // White for intensity 0-2, black for intensity 3-5
        const isLowIntensity = correspondingValue <= 2;
        emptyColor = isLowIntensity ? '#f0f0f0' : '#1a1a1a';
        emptyLetter = isLowIntensity ? letterMapping.low : letterMapping.high;
      }
      
      const emptyStyle: React.CSSProperties = {
        ...base,
        background: emptyColor,
        transition: 'background 0.3s ease',
        position: 'relative',
        cursor: correspondingValue !== null ? 'default' : 'default',
      };
      
      const emptyLetterStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '12vmin',
        fontWeight: 'bold',
        color: emptyColor === '#1a1a1a' ? '#f0f0f0' : '#1a1a1a', // Inverse of background
        opacity: isHovered && emptyLetter ? 1 : 0,
        transition: 'opacity 0.2s ease',
        userSelect: 'none',
        pointerEvents: 'none',
      };
      
      return (
        <div 
          key={i} 
          style={emptyStyle}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {emptyLetter && <span style={emptyLetterStyle}>{emptyLetter}</span>}
        </div>
      );
    }
    
    if (type === 'filled') {
      // Determine background based on selected value
      let background: string;
      
      if (selectedValue !== null) {
        const colorMap = [
          COLOR_RAMP.purple,
          COLOR_RAMP.blue,
          COLOR_RAMP.green,
          COLOR_RAMP.gold,
          COLOR_RAMP.orange,
          COLOR_RAMP.red,
        ];
        background = colorMap[selectedValue] || '#696969';
      } else {
        // Default: grey for all colored squares before selection
        background = '#696969';
      }
      
      const animationDelay = getAnimationDelay(i);
      const shouldAnimate = hasAnimated;
      
      // C square bounces repeatedly until selection is made
      const shouldBounce = i === 1 && !hasAnySelection;
      let animationValue = 'none';
      if (shouldAnimate) {
        animationValue = `riseAndFall 0.6s ease-in-out ${animationDelay}s forwards`;
      }
      if (shouldBounce) {
        // Start bouncing after initial animation, repeat every 3 seconds
        animationValue = shouldAnimate 
          ? `riseAndFall 0.6s ease-in-out ${animationDelay}s forwards, bounce 3s ease-in-out 2s infinite`
          : 'bounce 3s ease-in-out 0s infinite';
      }
      
      const filledHoverStyle: React.CSSProperties = {
        ...filled,
        background,
        transform: isHovered ? 'scale(1.08)' : undefined,
        boxShadow: isHovered 
          ? '0 12px 24px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2)' 
          : undefined,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
        animation: animationValue,
      };
      
      const letterStyle: React.CSSProperties = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        fontSize: '12vmin',
        fontWeight: 'bold',
        color: 'var(--background)',
        opacity: isHovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
        userSelect: 'none',
        pointerEvents: 'none',
      };
      
      return (
        <div 
          key={i} 
          style={filledHoverStyle}
          onMouseEnter={() => setHoveredIndex(i)}
          onMouseLeave={() => setHoveredIndex(null)}
          onClick={() => setActiveAxis(indexToAxis[i])}
        >
          {letter && <span style={letterStyle}>{letter}</span>}
        </div>
      );
    }
    
    // Must be special type
    return <div key={i} style={special} />;
  };

  const renderModal = () => {
    if (!activeAxis) return null;
    
    const axis = AXES[activeAxis];
    
    // Map axis to empty square index to get the letters
    const axisToEmptyIndex: Record<AxisKey, number> = {
      civilRights: 0,
      openness: 3,
      redistribution: 7,
      ethics: 8,
    };
    
    const emptyIndex = axisToEmptyIndex[activeAxis];
    const letters = emptyLetterMap[emptyIndex];
    
    const modalOverlay: React.CSSProperties = {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem',
    };
    
    const modalContent: React.CSSProperties = {
      background: 'var(--background)',
      borderRadius: '1rem',
      padding: '2rem',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    };
    
    const modalHeader: React.CSSProperties = {
      marginBottom: '1.5rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      paddingBottom: '1rem',
      position: 'relative',
    };
    
    const closeButton: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      right: 0,
      background: 'transparent',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0.25rem',
      lineHeight: 1,
      color: 'var(--foreground)',
      opacity: 0.7,
      transition: 'opacity 0.2s ease',
    };
    
    const modalTitle: React.CSSProperties = {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      paddingRight: '2rem',
    };
    
    const modalSubtitle: React.CSSProperties = {
      fontSize: '0.9rem',
      color: 'var(--foreground-secondary)',
      marginBottom: '0.5rem',
    };
    
    const modalDescription: React.CSSProperties = {
      fontSize: '0.85rem',
      color: 'var(--foreground-secondary)',
      opacity: 0.8,
      fontStyle: 'italic',
    };
    
    const valueList: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    };
    
    const valueItem: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      cursor: 'pointer',
      padding: '0.5rem',
      borderRadius: '0.5rem',
      transition: 'background 0.2s ease',
    };
    
    const colorSquare: React.CSSProperties = {
      width: '48px',
      height: '48px',
      borderRadius: '20%',
      flexShrink: 0,
    };
    
    const valueText: React.CSSProperties = {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    };
    
    const valueName: React.CSSProperties = {
      fontSize: '1rem',
      fontWeight: '600',
      marginBottom: '0.25rem',
    };
    
    const valueDescription: React.CSSProperties = {
      fontSize: '0.85rem',
      color: 'var(--foreground-secondary)',
    };
    
    return (
      <div style={modalOverlay} onClick={() => setActiveAxis(null)}>
        <div style={modalContent} onClick={(e) => e.stopPropagation()}>
          <div style={modalHeader}>
            <button 
              style={closeButton}
              onClick={() => setActiveAxis(null)}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              aria-label="Close"
            >
              ✕
            </button>
            <div style={modalTitle}>{axis.name}</div>
            <div style={modalSubtitle}>{letters.low} = {axis.lowLabel} ↔ {letters.high} = {axis.highLabel}</div>
            <div style={modalDescription}>{axis.description}</div>
          </div>
          
          <div style={valueList}>
            {colorScale.map((item, idx) => {
              const descriptor = axis.values[item.value];
              const isHovered = hoveredValue === item.value;
              
              // Determine which empty square letter to show (low for 0-2, high for 3-5)
              const emptyLetter = item.value <= 2 ? letters.low : letters.high;
              const emptySquareColor = item.value <= 2 ? '#FFFFFF' : '#000000';
              
              const emptySquareStyle: React.CSSProperties = {
                width: '48px',
                height: '48px',
                borderRadius: '20%',
                background: emptySquareColor,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                fontWeight: '700',
                color: item.value <= 2 ? '#000000' : '#FFFFFF',
                fontFamily: 'monospace',
              };
              
              return (
                <div 
                  key={idx} 
                  style={{
                    ...valueItem,
                    background: isHovered ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  }}
                  onClick={() => handleValueSelect(activeAxis, item.value)}
                  onMouseEnter={() => setHoveredValue(item.value)}
                  onMouseLeave={() => setHoveredValue(null)}
                >
                  <div style={emptySquareStyle}>{emptyLetter}</div>
                  <div style={{ ...colorSquare, background: item.color }} />
                  <div style={valueText}>
                    <div style={valueName}>
                      {descriptor}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderMiniGrid = (
    civilRightsScore: number,
    opennessScore: number,
    redistributionScore: number,
    ethicsScore: number
  ) => {
    const miniGridSize = 'min(25vmin, 150px)';
    
    const miniGrid: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '4%',
      width: miniGridSize,
      height: miniGridSize,
    };
    
    const miniSquare: React.CSSProperties = {
      width: '100%',
      height: '100%',
      borderRadius: '20%',
    };
    
    const miniSpecial: React.CSSProperties = {
      width: '95%',
      height: '95%',
      placeSelf: 'center',
      borderRadius: '16%',
      border: 'clamp(2px, 0.5vmin, 4px) solid #d6d6d6',
      background: 'transparent',
      WebkitMask: `
        linear-gradient(#000 0 0) top left,
        linear-gradient(#000 0 0) top right,
        linear-gradient(#000 0 0) bottom left,
        linear-gradient(#000 0 0) bottom right
      `,
      WebkitMaskSize: '32% 32%',
      WebkitMaskRepeat: 'no-repeat',
      mask: `
        linear-gradient(#000 0 0) top left,
        linear-gradient(#000 0 0) top right,
        linear-gradient(#000 0 0) bottom left,
        linear-gradient(#000 0 0) bottom right
      `,
      maskSize: '30% 30%',
      maskRepeat: 'no-repeat',
    };
    
    const scores = [civilRightsScore, opennessScore, redistributionScore, ethicsScore];
    const colorMap = [
      COLOR_RAMP.purple,
      COLOR_RAMP.blue,
      COLOR_RAMP.green,
      COLOR_RAMP.gold,
      COLOR_RAMP.orange,
      COLOR_RAMP.red,
    ];
    
    const cells = [
      { type: 'empty', index: 0, scoreIndex: 0 },  // top-left empty (C)
      { type: 'filled', index: 1, scoreIndex: 0 }, // C
      { type: 'filled', index: 2, scoreIndex: 1 }, // O
      { type: 'empty', index: 3, scoreIndex: 1 },  // left-middle empty (O)
      { type: 'filled', index: 4, scoreIndex: 2 }, // R
      { type: 'filled', index: 5, scoreIndex: 3 }, // E
      { type: 'special', index: 6 },
      { type: 'empty', index: 7, scoreIndex: 2 },  // bottom-middle empty (R)
      { type: 'empty', index: 8, scoreIndex: 3 },  // bottom-right empty (E)
    ];
    
    return (
      <div style={miniGrid}>
        {cells.map(cell => {
          if (cell.type === 'special') {
            return <div key={cell.index} style={miniSpecial} />;
          }
          
          if (cell.type === 'filled' && cell.scoreIndex !== undefined) {
            const score = scores[cell.scoreIndex];
            const bgColor = colorMap[score] || '#696969';
            return <div key={cell.index} style={{ ...miniSquare, background: bgColor }} />;
          }
          
          if (cell.type === 'empty' && cell.scoreIndex !== undefined) {
            const score = scores[cell.scoreIndex];
            const isLowIntensity = score <= 2;
            const bgColor = isLowIntensity ? '#f0f0f0' : '#1a1a1a';
            return <div key={cell.index} style={{ ...miniSquare, background: bgColor }} />;
          }
          
          return <div key={cell.index} style={{ ...miniSquare, background: '#d6d6d6' }} />;
        })}
      </div>
    );
  };

  const renderSimilarBlocs = () => {
    // Only show if all four axes are selected
    const allSelected = Object.values(selectedValues).every(v => v !== null);
    if (!allSelected) return null;
    
    const userScores = {
      civilRights: selectedValues.civilRights!,
      openness: selectedValues.openness!,
      redistribution: selectedValues.redistribution!,
      ethics: selectedValues.ethics!,
    };
    
    const allSubTypes = getAllSubTypesWithMeta();
    
    // Calculate distance to all subtypes
    const typesWithDistance = allSubTypes.map(subType => {
      const distance = Math.sqrt(
        Math.pow(subType.civil_rights_score - userScores.civilRights, 2) +
        Math.pow(subType.openness_score - userScores.openness, 2) +
        Math.pow(subType.redistribution_score - userScores.redistribution, 2) +
        Math.pow(subType.ethics_score - userScores.ethics, 2)
      );
      
      return { subType, distance };
    });
    
    // Sort by distance
    const sortedTypes = typesWithDistance.sort((a, b) => a.distance - b.distance);
    
    // Determine which bloc is being shown in the badge (either exact match or closest similar)
    // We want to exclude this one from the list below
    const badgeBloc = sortedTypes[0]; // The first one is always the best match
    
    // Take next 3
    const similarTypes = sortedTypes.slice(1, 4);
    
    const container: React.CSSProperties = {
      marginTop: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
    };
    
    const heading: React.CSSProperties = {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
    };
    
    const blocsContainer: React.CSSProperties = {
      display: 'flex',
      gap: '1.5rem',
      flexWrap: 'wrap',
      justifyContent: 'center',
    };
    
    const blocCard: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: 'pointer',
      transition: 'transform 0.2s ease, opacity 0.2s ease',
    };
    
    const blocInfo: React.CSSProperties = {
      textAlign: 'center',
    };
    
    const blocName: React.CSSProperties = {
      fontSize: '1.1rem',
      fontWeight: 'bold',
      marginBottom: '0.25rem',
    };
    
    const blocCallSign: React.CSSProperties = {
      fontSize: '0.9rem',
      opacity: 0.7,
      fontFamily: 'monospace',
    };
    
    return (
      <div className={styles.similarContainer}>
        <div className={styles.similarHeading}>similar blocs</div>
        <div className={styles.blocsGrid}>
          {similarTypes.map(({ subType }) => (
            <div 
              key={`${subType.typeId}-${subType.intensity}`} 
              className={styles.blocCard}
              onClick={() => handleBlocClick(subType)}
            >
              {renderMiniGrid(
                subType.civil_rights_score,
                subType.openness_score,
                subType.redistribution_score,
                subType.ethics_score
              )}
              <div className={styles.blocInfo}>
                <div className={styles.blocName}>{subType.name}</div>
                <div className={styles.blocCallSign}>{subType.callSign}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderHistoricalFigures = () => {
    // Only show if all four axes are selected
    const allSelected = Object.values(selectedValues).every(v => v !== null);
    if (!allSelected) return null;

    return (
      <div className={styles.figuresSection}>
        <div className={styles.figuresHeading}>history's patterns</div>
        <p className={styles.figuresSubtext}>
          see where famous figures land on CORE
        </p>
        <div className={styles.figuresPlaceholder}>
          <div className={styles.figureCard}>
            <div className={styles.figureAvatar}>?</div>
            <div className={styles.figureName}>Historical Figure</div>
            <div className={styles.figureGrid}>Coming Soon</div>
          </div>
          <div className={styles.figureCard}>
            <div className={styles.figureAvatar}>?</div>
            <div className={styles.figureName}>Modern Leader</div>
            <div className={styles.figureGrid}>Coming Soon</div>
          </div>
          <div className={styles.figureCard}>
            <div className={styles.figureAvatar}>?</div>
            <div className={styles.figureName}>Political Icon</div>
            <div className={styles.figureGrid}>Coming Soon</div>
          </div>
        </div>
      </div>
    );
  };

  const determineUserBloc = () => {
    // Check if all values are selected
    const allSelected = Object.values(selectedValues).every(v => v !== null);
    if (!allSelected) return null;
    
    const userScores = {
      civilRights: selectedValues.civilRights!,
      openness: selectedValues.openness!,
      redistribution: selectedValues.redistribution!,
      ethics: selectedValues.ethics!,
    };
    
    const allSubTypes = getAllSubTypesWithMeta();
    
    // 1. Try to find exact match
    for (const subType of allSubTypes) {
      if (
        subType.civil_rights_score === userScores.civilRights &&
        subType.openness_score === userScores.openness &&
        subType.redistribution_score === userScores.redistribution &&
        subType.ethics_score === userScores.ethics
      ) {
        return {
          typeId: subType.typeId,
          name: subType.name,
          singularName: subType.singularName ?? subType.name,
          description: getTypeDescription(subType.typeId),
          callSign: subType.callSign,
          matchType: 'exact',
          // Pass scores for modal
          civil_rights_score: subType.civil_rights_score,
          openness_score: subType.openness_score,
          redistribution_score: subType.redistribution_score,
          ethics_score: subType.ethics_score,
          intensity: subType.intensity,
          parentName: getTypeName(subType.typeId)
        };
      }
    }
    
    // 2. If no exact match, find closest match (most similar)
    const typesWithDistance = allSubTypes.map(subType => {
      const distance = Math.sqrt(
        Math.pow(subType.civil_rights_score - userScores.civilRights, 2) +
        Math.pow(subType.openness_score - userScores.openness, 2) +
        Math.pow(subType.redistribution_score - userScores.redistribution, 2) +
        Math.pow(subType.ethics_score - userScores.ethics, 2)
      );
      
      return { subType, distance };
    });
    
    // Sort by distance and take top 1
    const closest = typesWithDistance.sort((a, b) => a.distance - b.distance)[0];
    
    if (closest) {
      const subType = closest.subType;
      
      return {
        typeId: subType.typeId,
        name: subType.name,
        singularName: subType.singularName ?? subType.name,
        description: getTypeDescription(subType.typeId),
        callSign: subType.callSign,
        matchType: 'similar',
        // Pass scores for modal
        civil_rights_score: subType.civil_rights_score,
        openness_score: subType.openness_score,
        redistribution_score: subType.redistribution_score,
        ethics_score: subType.ethics_score,
        intensity: subType.intensity,
        parentName: getTypeName(subType.typeId)
      };
    }
    
    return null;
  };
  
  const handleBlocClick = (subType: SubTypeWithMeta) => {
    setViewingBloc(subType);
  };

  const renderBlocModal = () => {
    if (!viewingBloc) return null;

    const position = getTypePosition(viewingBloc.typeId);
    if (!position) return null;

    const familyName = FAMILY_NAMES[position.family] || position.family;
    
    const applyBloc = () => {
      setSelectedValues({
        civilRights: viewingBloc.civil_rights_score,
        openness: viewingBloc.openness_score,
        redistribution: viewingBloc.redistribution_score,
        ethics: viewingBloc.ethics_score,
      });
      setViewingBloc(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
      <div className={styles.modalOverlay} onClick={() => setViewingBloc(null)}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <button className={styles.modalClose} onClick={() => setViewingBloc(null)}>×</button>
          
          <div className={styles.modalHeader}>
            <div style={{ transform: 'scale(1.5)', marginBottom: '4rem', marginTop: '2rem' }}>
              {renderMiniGrid(
                viewingBloc.civil_rights_score,
                viewingBloc.openness_score,
                viewingBloc.redistribution_score,
                viewingBloc.ethics_score
              )}
            </div>
            <div className={styles.modalName}>{viewingBloc.name}</div>
            <div className={styles.modalCallSign}>{viewingBloc.callSign}</div>
          </div>

          <div className={styles.modalSection}>
            <div className={styles.modalLabel}>Family</div>
            <div className={styles.modalText}>{familyName}</div>
          </div>

          <div className={styles.modalSection}>
            <div className={styles.modalLabel}>Description</div>
            <div className={styles.modalText}>{getTypeDescription(viewingBloc.typeId)}</div>
          </div>

          <div className={styles.modalSection}>
            <div className={styles.modalLabel}>Examples</div>
            <div className={styles.modalExamples}>{position.examples}</div>
          </div>

          <button className={styles.applyButton} onClick={applyBloc}>
            Apply to my squares
          </button>
        </div>
      </div>
    );
  };

  const renderSquaresSummary = () => {
    if (!hasAnySelection) return null;
    
    const userBloc = determineUserBloc();
    const axisOrder: AxisKey[] = ['civilRights', 'openness', 'redistribution', 'ethics'];
    
    const squareSize = 'min(15vmin, 80px)';
    
    const coloredSquare: React.CSSProperties = {
      width: squareSize,
      height: squareSize,
      borderRadius: '20%',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    };
    
    const emptySquareContainer: React.CSSProperties = {
      position: 'relative',
      width: squareSize,
      height: squareSize,
      transition: 'transform 0.2s ease',
    };
    
    const emptySquare: React.CSSProperties = {
      width: '100%',
      height: '100%',
      borderRadius: '20%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
    
    const letterLabel: React.CSSProperties = {
      fontSize: '2.5rem',
      fontWeight: 'bold',
    };
    
    return (
      <div className={styles.summaryContainer}>
        
        {userBloc && (
          <div 
            className={styles.matchBadge} 
            onClick={() => handleBlocClick(userBloc as unknown as SubTypeWithMeta)}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.matchLabel}>
              {userBloc.matchType === 'exact' ? 'You are a' : 'You are most similar to a'}
            </div>
            <div className={styles.matchName}>{userBloc.singularName}</div>
            <div className={styles.matchCallSign}>{userBloc.callSign}</div>
            <div className={styles.matchDescription}>{userBloc.description}</div>
          </div>
        )}
        
        {/* Colored squares row */}
        <div className={styles.summaryRow}>
          {axisOrder.map((axis, idx) => {
            const value = selectedValues[axis];
            let bgColor = '#696969'; // default grey
            
            // Check if this axis is currently hovered in the main grid
            const isHovered = hoveredIndex !== null && indexToAxis[hoveredIndex] === axis;
            
            const style = {
              ...coloredSquare,
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isHovered ? '0 0 15px rgba(255, 255, 255, 0.3)' : 'none',
              zIndex: isHovered ? 10 : 1,
            };
            
            if (value !== null) {
              const colorMap = [
                COLOR_RAMP.purple,
                COLOR_RAMP.blue,
                COLOR_RAMP.green,
                COLOR_RAMP.gold,
                COLOR_RAMP.orange,
                COLOR_RAMP.red,
              ];
              bgColor = colorMap[value];
            }
            
            return (
              <div key={axis} style={{ ...style, background: bgColor }} />
            );
          })}
        </div>
        
        {/* White/Black squares row with letters */}
        <div className={styles.summaryRow}>
          {axisOrder.map((axis, idx) => {
            const value = selectedValues[axis];
            
            // Check if this axis is currently hovered in the main grid
            const isHovered = hoveredIndex !== null && indexToAxis[hoveredIndex] === axis;
            
            const containerStyle = {
              ...emptySquareContainer,
              transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              zIndex: isHovered ? 10 : 1,
            };
            
            // If no selection, show standard white with no letter
            if (value === null) {
              return (
                <div key={`${axis}-empty`} style={containerStyle}>
                  <div style={{ ...emptySquare, background: '#d6d6d6' }} />
                </div>
              );
            }
            
            // If selected, show appropriate color and letter
            const isLowIntensity = value <= 2;
            const bgColor = isLowIntensity ? '#f0f0f0' : '#1a1a1a';
            const letterColor = isLowIntensity ? '#1a1a1a' : '#f0f0f0'; // Opposite of bg
            
            const letterMap = [
              { low: 'L', high: 'A' },
              { low: 'G', high: 'N' },
              { low: 'M', high: 'S' },
              { low: 'P', high: 'T' },
            ];
            const letter = isLowIntensity ? letterMap[idx].low : letterMap[idx].high;
            
            return (
              <div key={`${axis}-empty`} style={containerStyle}>
                <div style={{ ...emptySquare, background: bgColor }}>
                  <span style={{ ...letterLabel, color: letterColor }}>{letter}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Value Labels row */}
        <div className={styles.summaryRow}>
          {axisOrder.map((axis, idx) => {
            const value = selectedValues[axis];
            const descriptor = value !== null ? AXES[axis].values[value] : '';
            
            return (
              <div key={`${axis}-label`} className={styles.summaryColumn}>
                <div className={styles.valueLabel}>{descriptor}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes riseAndFall {
          0% {
            transform: translateY(0) scale(1);
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
          50% {
            transform: translateY(-20px) scale(1.05);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.3);
          }
          100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 100% {
            transform: translateY(0) scale(1);
            box-shadow: 0 0 0 rgba(0, 0, 0, 0);
          }
          10% {
            transform: translateY(-20px) scale(1.05);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 10px 20px rgba(0, 0, 0, 0.3);
          }
        }
      `}} />
      <main className={styles.page}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          
          <button className={styles.introTrigger} onClick={() => setShowIntro(true)}>
            About CORE
          </button>

          {!hasAnySelection && (
            <div className={styles.ctaHint}>
              <span className={styles.ctaIcon}>👆</span>
              Tap a square to define your position
            </div>
          )}
          
          <div style={grid}>{cells.map(renderCell)}</div>
          {renderSquaresSummary()}
          {renderSimilarBlocs()}
          {renderHistoricalFigures()}
          
          {hasAnySelection && (
            <button className={styles.resetButton} onClick={handleReset}>
              <span>↺</span> Start Over
            </button>
          )}
        </div>
        {renderModal()}
        {renderBlocModal()}
        <CoreIntroModal isOpen={showIntro} onClose={() => setShowIntro(false)} />
      </main>
    </>
  );
}

