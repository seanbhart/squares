'use client';

import React, { useRef, useEffect, useState } from 'react';
import styles from './CoreLanding.module.css';
import { COLOR_RAMP, AXES, getAllTypes, getTypePosition, getTypeName, getTypeSingularName, getTypeDescription, getAllSubTypesWithMeta, generateCallSign, TypeId, SubTypeWithMeta, FAMILY_NAMES } from '@/lib/bloc-config';
import CoreIntroModal from './CoreIntroModal';

type AxisKey = 'civilRights' | 'openness' | 'redistribution' | 'ethics';

export default function CoreInteractivePage() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [activeAxis, setActiveAxis] = React.useState<AxisKey | null>(null);
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
  
  // New State for Selection Overlay
  const [tempValue, setTempValue] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // State for Historical Figures Data
  const [figuresData, setFiguresData] = React.useState<any>(null);
  const [viewingFigure, setViewingFigure] = React.useState<any>(null);

  // Wheel values from Top (Purple/Low) to Bottom (Red/High)
  // -1 represents the Grey/Null value in the center
  const wheelValues = [0, 1, 2, -1, 3, 4, 5];
  
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
  
  // Lock scroll when modal/overlay is open
  React.useEffect(() => {
    if (viewingBloc || activeAxis || viewingFigure) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingBloc, activeAxis, viewingFigure]);
  
  // Initialize tempValue when activeAxis opens and scroll to position
  useEffect(() => {
    if (activeAxis) {
      const current = selectedValues[activeAxis];
      setTempValue(current ?? -1);

      // Scroll to initial position
      // Use a small timeout to ensure layout is ready
      setTimeout(() => {
        if (scrollContainerRef.current) {
          const targetVal = current ?? -1;
          const index = wheelValues.indexOf(targetVal);
          if (index !== -1) {
             const items = scrollContainerRef.current.querySelectorAll('[data-wheel-item]');
             if (items[index]) {
                items[index].scrollIntoView({ block: 'center', behavior: 'instant' });
             }
          }
        }
      }, 10);
    }
  }, [activeAxis]);
  
  // Trigger entrance animation when intro modal is closed
  React.useEffect(() => {
    if (!showIntro) {
      // Small delay to ensure smooth transition after modal closes
      const timer = setTimeout(() => setHasAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [showIntro]);
  
  // Load figures data on mount
  React.useEffect(() => {
    import('@/data/figures_core.json')
      .then(data => setFiguresData(data.default || data))
      .catch(err => console.error('Failed to load figures data:', err));
  }, []);
  
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
    gridTemplateRows: 'repeat(3, 1fr)',
    gap: '4%',
    width: containerSize,
    height: containerSize,
  };

  const base: React.CSSProperties = {
    width: '100%',
    height: '100%',
    borderRadius: '20%',
    background: 'var(--gray-300)',
    border: 'var(--square-border)',
  };

  const filled: React.CSSProperties = {
    ...base,
    background: 'var(--color-purple)',
  };

  const special: React.CSSProperties = {
    width: '95%',
    height: '95%',
    placeSelf: 'center',
    borderRadius: '16%',
    border: 'clamp(5px, 1.3vmin, 13px) solid var(--gray-300)',
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

  const handleSaveSelection = () => {
    if (activeAxis) {
      // If tempValue is -1, it means "None" / Grey
      const finalValue = tempValue === -1 ? null : tempValue;
      setSelectedValues(prev => ({ ...prev, [activeAxis]: finalValue }));
    setActiveAxis(null);
    }
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
      
      let emptyColor = 'var(--gray-300)'; // default grey
      let emptyLetter = '';
      
      if (correspondingValue !== null && letterMapping) {
        // White for intensity 0-2, black for intensity 3-5
        const isLowIntensity = correspondingValue <= 2;
        emptyColor = isLowIntensity ? 'var(--gray-100)' : 'var(--gray-900)';
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
        color: emptyColor === 'var(--gray-900)' ? 'var(--gray-100)' : 'var(--gray-900)', // Inverse of background
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
        background = colorMap[selectedValue] || 'var(--gray-500)';
      } else {
        // Default: grey for all colored squares before selection
        background = 'var(--gray-500)';
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

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    
    // Use the first item to measure height
    const firstItem = container.querySelector('[data-wheel-item]');
    if (!firstItem) return;
    const itemHeight = firstItem.clientHeight;
    
    const scrollTop = container.scrollTop;
    // Add half height to find center point match
    const index = Math.round(scrollTop / itemHeight);
    
    if (index >= 0 && index < wheelValues.length) {
       setTempValue(wheelValues[index]);
    }
  };

  const renderSelectionOverlay = () => {
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
    
    // Determine Left "Indicator" Square visual
    let indicatorBg = 'var(--gray-300)';
    let indicatorLetter = '';
    let indicatorTextColor = 'var(--gray-900)';

    if (tempValue !== null && tempValue !== -1) {
      const isLowIntensity = tempValue <= 2;
      indicatorBg = isLowIntensity ? 'var(--gray-100)' : 'var(--gray-900)';
      indicatorTextColor = isLowIntensity ? 'var(--gray-900)' : 'var(--gray-100)';
      indicatorLetter = isLowIntensity ? letters.low : letters.high;
    }
    
    // Get label text for bottom
    let labelText = 'Select Intensity';
    if (tempValue !== null && tempValue !== -1) {
      labelText = axis.values[tempValue];
    } else if (tempValue === -1) {
      labelText = 'Reset / No Selection';
    }
    
    return (
      <div className={styles.selectionOverlay} onClick={() => handleSaveSelection()}>
        <div className={styles.selectionContainer} onClick={(e) => e.stopPropagation()}>
          
          {/* Header: Axis Name and Binary Label */}
          <div className={styles.selectionHeader}>
            <div className={styles.selectionTitle}>{axis.name}</div>
            <div className={styles.selectionBinaryLabel}>
              {letters.low} = {axis.lowLabel} ↔ {letters.high} = {axis.highLabel}
            </div>
          </div>

          <div className={styles.squaresRow}>
            {/* Left: Indicator Square (Black/White + Letter) */}
            <div 
              className={styles.indicatorSquare} 
              style={{ background: indicatorBg, color: indicatorTextColor, cursor: 'pointer' }}
              onClick={handleSaveSelection}
            >
              {indicatorLetter}
          </div>
          
            {/* Right: Wheel Selector (Colored Stack) */}
            <div className={styles.wheelWrapper}>
              <div 
                className={styles.wheelScrollArea} 
                ref={scrollContainerRef}
                onScroll={handleScroll}
              >
                {wheelValues.map((val, idx) => {
                  // Visual props for this item
                  const isSelected = tempValue === val;
                  
                  let bgColor = 'var(--gray-500)';
                  if (val !== -1) {
                      bgColor = colorScale.find(c => c.value === val)?.color || 'var(--gray-500)';
                  } else {
                      bgColor = 'var(--gray-500)'; // Grey for reset
                  }
                  
                  // If not selected, fade out
                  const opacity = isSelected ? 1 : 0.3;
                  const scale = isSelected ? 1 : 0.8;
                  
                  // Get contrasting text color for the colored square label
                  let coloredSquareTextColor = '#fff';
                  if (val !== -1) {
                    // For warm colors (gold, orange, red), use dark text; for cool colors (purple, blue, green), use white
                    coloredSquareTextColor = val >= 3 ? '#000' : '#fff';
                  }
              
              return (
                <div 
                  key={idx} 
                      className={styles.wheelItem} 
                      data-wheel-item
                      onClick={() => {
                        if (isSelected) {
                          handleSaveSelection();
                        } else {
                          // Click to select/scroll to
                          if (scrollContainerRef.current) {
                             const items = scrollContainerRef.current.querySelectorAll('[data-wheel-item]');
                             if (items[idx]) items[idx].scrollIntoView({ block: 'center', behavior: 'smooth' });
                          }
                        }
                      }}
                      style={{ cursor: isSelected ? 'pointer' : 'default' }}
                    >
                      <div 
                        className={styles.wheelSquare}
                  style={{
                          background: bgColor,
                          opacity,
                          transform: `scale(${scale})`,
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {isSelected && labelText !== 'Reset / No Selection' && (
                          <span style={{
                            color: coloredSquareTextColor,
                            fontSize: 'clamp(0.9rem, 4vmin, 1.8rem)',
                            fontWeight: 700,
                            textAlign: 'center',
                            padding: '0.5rem',
                            lineHeight: 1.2,
                            textShadow: val >= 3 
                              ? '0 1px 2px rgba(255,255,255,0.3)' 
                              : '0 1px 3px rgba(0,0,0,0.4)',
                            pointerEvents: 'none',
                            userSelect: 'none',
                          }}>
                            {labelText}
                          </span>
                        )}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          </div>

          {/* Save Button */}
          <button className={styles.saveButton} onClick={handleSaveSelection}>
            ✓
          </button>

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
      gridTemplateRows: 'repeat(3, 1fr)',
      gap: '4%',
      width: miniGridSize,
      height: miniGridSize,
    };
    
    const miniSquare: React.CSSProperties = {
      width: '100%',
      height: '100%',
      borderRadius: '20%',
      border: 'var(--square-border)',
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
            const bgColor = colorMap[score] || 'var(--gray-500)';
            return <div key={cell.index} style={{ ...miniSquare, background: bgColor }} />;
          }
          
          if (cell.type === 'empty' && cell.scoreIndex !== undefined) {
            const score = scores[cell.scoreIndex];
            const isLowIntensity = score <= 2;
            const bgColor = isLowIntensity ? 'var(--gray-100)' : 'var(--gray-900)';
            return <div key={cell.index} style={{ ...miniSquare, background: bgColor }} />;
          }
          
          return <div key={cell.index} style={{ ...miniSquare, background: 'var(--gray-300)' }} />;
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
    if (!allSelected || !figuresData || !figuresData.figures) return null;

    const userScores = {
      civilRights: selectedValues.civilRights!,
      openness: selectedValues.openness!,
      redistribution: selectedValues.redistribution!,
      ethics: selectedValues.ethics!,
    };

    // Calculate distance to all figures
    const figuresWithDistance = figuresData.figures.map((figure: any) => {
      if (!figure.core_spectrum) return null;
      
      const distance = Math.sqrt(
        Math.pow(figure.core_spectrum.civil_rights_score - userScores.civilRights, 2) +
        Math.pow(figure.core_spectrum.openness_score - userScores.openness, 2) +
        Math.pow(figure.core_spectrum.redistribution_score - userScores.redistribution, 2) +
        Math.pow(figure.core_spectrum.ethics_score - userScores.ethics, 2)
      );
      
      return { figure, distance };
    }).filter((item: any) => item !== null);

    // Sort by distance and take top 3
    const closestFigures = figuresWithDistance
      .sort((a: any, b: any) => a.distance - b.distance)
      .slice(0, 3);

    return (
      <div className={styles.figuresSection}>
        <div className={styles.figuresHeading}>history's patterns</div>
        <p className={styles.figuresSubtext}>
          famous figures with similar CORE positions
        </p>
        <div className={styles.figuresPlaceholder}>
          {closestFigures.map(({ figure }: any) => {
            const initials = figure.name
              .split(' ')
              .map((n: string) => n[0])
              .join('');
            
            return (
              <div 
                key={figure.name} 
                className={styles.figureCard}
                onClick={() => setViewingFigure(figure)}
                style={{ cursor: 'pointer' }}
              >
                <div className={styles.figureAvatar}>{initials}</div>
                <div className={styles.figureName}>{figure.name}</div>
                <div style={{ marginTop: '0.5rem' }}>
                  {renderMiniGrid(
                    figure.core_spectrum.civil_rights_score,
                    figure.core_spectrum.openness_score,
                    figure.core_spectrum.redistribution_score,
                    figure.core_spectrum.ethics_score
                  )}
                </div>
              </div>
            );
          })}
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

  const renderFigureModal = () => {
    if (!viewingFigure) return null;

    const applyFigure = () => {
      setSelectedValues({
        civilRights: viewingFigure.core_spectrum.civil_rights_score,
        openness: viewingFigure.core_spectrum.openness_score,
        redistribution: viewingFigure.core_spectrum.redistribution_score,
        ethics: viewingFigure.core_spectrum.ethics_score,
      });
      setViewingFigure(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const initials = viewingFigure.name
      .split(' ')
      .map((n: string) => n[0])
      .join('');

    return (
      <div className={styles.modalOverlay} onClick={() => setViewingFigure(null)}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <button className={styles.modalClose} onClick={() => setViewingFigure(null)}>×</button>
          
          <div className={styles.modalHeader}>
            <div style={{ transform: 'scale(1.5)', marginBottom: '4rem', marginTop: '2rem' }}>
              {renderMiniGrid(
                viewingFigure.core_spectrum.civil_rights_score,
                viewingFigure.core_spectrum.openness_score,
                viewingFigure.core_spectrum.redistribution_score,
                viewingFigure.core_spectrum.ethics_score
              )}
            </div>
            <div className={styles.modalName}>{viewingFigure.name}</div>
            {viewingFigure.lifespan && (
              <div className={styles.modalCallSign}>{viewingFigure.lifespan}</div>
            )}
          </div>

          {viewingFigure.timeline && viewingFigure.timeline.length > 0 && (
            <div className={styles.modalSection}>
              <div className={styles.modalLabel}>Timeline</div>
              {viewingFigure.timeline.map((period: any, idx: number) => (
                <div key={idx} className={styles.modalText} style={{ marginBottom: '0.75rem' }}>
                  <strong>{period.label}:</strong> {period.note}
                </div>
              ))}
            </div>
          )}

          <button className={styles.applyButton} onClick={applyFigure}>
            Apply {viewingFigure.name}'s CORE to my squares
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
      border: 'var(--square-border)',
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
      border: 'var(--square-border)',
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
            let bgColor = 'var(--gray-500)'; // default grey
            
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
                  <div style={{ ...emptySquare, background: 'var(--gray-300)' }} />
                </div>
              );
            }
            
            // If selected, show appropriate color and letter
            const isLowIntensity = value <= 2;
            const bgColor = isLowIntensity ? 'var(--gray-100)' : 'var(--gray-900)';
            const letterColor = isLowIntensity ? 'var(--gray-900)' : 'var(--gray-100)'; // Opposite of bg
            
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
        {renderSelectionOverlay()}
        {renderBlocModal()}
        {renderFigureModal()}
        <CoreIntroModal isOpen={showIntro} onClose={() => setShowIntro(false)} />
      </main>
    </>
  );
}
