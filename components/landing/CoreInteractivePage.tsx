'use client';

import React from 'react';
import styles from './CoreLanding.module.css';

export default function CoreInteractivePage() {
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
    if (type === 'filled') return <div key={i} style={filled} />;
    if (type === 'empty') return <div key={i} style={base} />;
    return <div key={i} style={special} />;
  };

  return (
    <main className={styles.page}>
      <div style={grid}>{cells.map(renderCell)}</div>
    </main>
  );
}

