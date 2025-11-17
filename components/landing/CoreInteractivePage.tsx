'use client';

import React from 'react';
import styles from './CoreLanding.module.css';

export default function CoreInteractivePage() {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);
  
  // Map grid indices to CORE letters
  const indexToLetter: Record<number, string> = {
    1: 'C',  // (2,1) Civil Rights
    2: 'O',  // (3,1) Openness
    4: 'R',  // (2,2) Redistribution
    5: 'E',  // (3,2) Ethics
  };
  
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
        >
          {letter && <span style={letterStyle}>{letter}</span>}
        </div>
      );
    }
    
    if (type === 'empty') return <div key={i} style={base} />;
    return <div key={i} style={special} />;
  };

  return (
    <main className={styles.page}>
      <div style={grid}>{cells.map(renderCell)}</div>
    </main>
  );
}

