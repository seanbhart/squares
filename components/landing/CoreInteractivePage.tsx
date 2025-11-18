'use client';

import React from 'react';
import styles from './CoreLanding.module.css';
import { COLOR_RAMP, AXES } from '@/lib/bloc-config';

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
  
  // Trigger entrance animation on mount
  React.useEffect(() => {
    setHasAnimated(true);
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
      
      // Default intensity values for each axis (matching default colors)
      const defaultIntensity: Record<number, number> = {
        1: 1,  // C - blue (low)
        2: 2,  // O - green (low)
        4: 3,  // R - yellow (high)
        5: 4,  // E - orange (high)
      };
      
      let emptyColor = '#d6d6d6'; // default white/light gray
      let emptyLetter = '';
      
      const intensityValue = correspondingValue !== null ? correspondingValue : (correspondingIndex ? defaultIntensity[correspondingIndex] : null);
      
      if (intensityValue !== null && letterMapping) {
        // White for intensity 0-2, black for intensity 3-5
        const isLowIntensity = intensityValue <= 2;
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
        background = colorMap[selectedValue] || COLOR_RAMP.blue;
      } else {
        // Default colors for each axis
        const defaultColors: Record<number, string> = {
          1: COLOR_RAMP.blue,    // C - Civil Rights
          2: COLOR_RAMP.green,   // O - Openness
          4: COLOR_RAMP.gold,    // R - Redistribution
          5: COLOR_RAMP.orange,  // E - Ethics
        };
        background = defaultColors[i] || COLOR_RAMP.blue;
      }
      
      const animationDelay = getAnimationDelay(i);
      const shouldAnimate = hasAnimated;
      
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
        animation: shouldAnimate ? `riseAndFall 0.6s ease-in-out ${animationDelay}s forwards` : 'none',
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
            <div style={modalSubtitle}>{axis.description}</div>
          </div>
          
          <div style={valueList}>
            {colorScale.map((item, idx) => {
              const descriptor = axis.values[item.value];
              const isHovered = hoveredValue === item.value;
              
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
      `}} />
      <main className={styles.page}>
        <div style={grid}>{cells.map(renderCell)}</div>
        {renderModal()}
      </main>
    </>
  );
}

