'use client';

import React from 'react';
import styles from './CoreLanding.module.css';
import { COLOR_RAMP, AXES } from '@/lib/bloc-config';

type AxisKey = 'civilRights' | 'openness' | 'redistribution' | 'ethics';

export default function CoreInteractivePage() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  const [activeAxis, setActiveAxis] = React.useState<AxisKey | null>(null);
  
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
    width: '96%',
    height: '96%',
    placeSelf: 'center',
    borderRadius: '16%',
    border: 'clamp(2px, 0.8vmin, 8px) solid #d6d6d6',
    background: 'transparent',
    WebkitMask: `
      linear-gradient(#000 0 0) top left,
      linear-gradient(#000 0 0) top right,
      linear-gradient(#000 0 0) bottom left,
      linear-gradient(#000 0 0) bottom right
    `,
    WebkitMaskSize: '30% 30%',
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

  const renderCell = (type: 'empty' | 'filled' | 'special', i: number) => {
    const isHovered = hoveredIndex === i;
    const letter = indexToLetter[i];
    
    if (type === 'filled') {
      const filledHoverStyle: React.CSSProperties = {
        ...filled,
        transform: isHovered ? 'scale(1.08)' : 'scale(1)',
        boxShadow: isHovered 
          ? '0 12px 24px rgba(0, 0, 0, 0.3), 0 6px 12px rgba(0, 0, 0, 0.2)' 
          : '0 0 0 rgba(0, 0, 0, 0)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
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
    
    if (type === 'empty') return <div key={i} style={base} />;
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
    };
    
    const modalTitle: React.CSSProperties = {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
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
            <div style={modalTitle}>{axis.name}</div>
            <div style={modalSubtitle}>{axis.description}</div>
          </div>
          
          <div style={valueList}>
            {colorScale.map((item, idx) => {
              const descriptor = axis.values[item.value];
              
              return (
                <div key={idx} style={valueItem}>
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
    <main className={styles.page}>
      <div style={grid}>{cells.map(renderCell)}</div>
      {renderModal()}
    </main>
  );
}

