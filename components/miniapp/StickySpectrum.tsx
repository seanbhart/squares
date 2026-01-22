'use client';

import styles from './StickySpectrum.module.css';
import { AXIS_COLORS } from '@/lib/bloc-config';

interface CoreSpectrum {
  civilRights: number;
  openness: number;
  redistribution: number;
  ethics: number;
}

interface StickySpectrumProps {
  spectrum: CoreSpectrum;
}

const CORE_DIMENSIONS = [
  { key: 'civilRights', label: 'Civil Rights', letter: 'C', color: AXIS_COLORS.civilRights },
  { key: 'openness', label: 'Openness', letter: 'O', color: AXIS_COLORS.openness },
  { key: 'redistribution', label: 'Redistribution', letter: 'R', color: AXIS_COLORS.redistribution },
  { key: 'ethics', label: 'Ethics', letter: 'E', color: AXIS_COLORS.ethics },
];

// CORE color ramp for 0-5 scale (6 colors)
const CORE_COLOR_RAMP = [
  '#7e568e', // 0 - Purple (Liberty/Global/Market/Progressive)
  '#1f6adb', // 1 - Blue
  '#398a34', // 2 - Green
  '#eab308', // 3 - Yellow
  '#e67e22', // 4 - Orange
  '#c0392b', // 5 - Red (Authority/National/Social/Traditional)
];

function ColorSquare({ value, size = 56 }: { value: number; size?: number }) {
  const colorIndex = Math.max(0, Math.min(5, value));
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '10px',
      backgroundColor: CORE_COLOR_RAMP[colorIndex],
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      flexShrink: 0
    }} />
  );
}

export default function StickySpectrum({ spectrum }: StickySpectrumProps) {
  const spectrumValues = [
    spectrum.civilRights,
    spectrum.openness,
    spectrum.redistribution,
    spectrum.ethics,
  ];

  return (
    <div className={styles.stickyContainer}>
      <div className={styles.signatureBox}>
        <div className={styles.spectrumTitle}>Your Spectrum</div>
        <div className={styles.emojiRow}>
          {spectrumValues.map((value, i) => (
            <div key={i} className={styles.emojiColumn}>
              <ColorSquare value={value} size={56} />
              <span className={styles.emojiLabel}>{CORE_DIMENSIONS[i].letter}</span>
            </div>
          ))}
        </div>

        <div className={styles.dimensionReference}>
          {CORE_DIMENSIONS.map((dim) => (
            <span key={dim.key} className={styles.refLabel}>
              {dim.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
