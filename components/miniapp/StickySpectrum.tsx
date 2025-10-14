'use client';

import styles from './StickySpectrum.module.css';
import { COLOR_RAMP } from '@/lib/tamer-config';

interface UserSpectrum {
  trade: number;
  abortion: number;
  migration: number;
  economics: number;
  rights: number;
}

interface StickySpectrumProps {
  spectrum: UserSpectrum;
}

const POLICIES = [
  { key: 'trade', label: 'Trade' },
  { key: 'abortion', label: 'Abortion' },
  { key: 'migration', label: 'Migration' },
  { key: 'economics', label: 'Economics' },
  { key: 'rights', label: 'Rights' },
];

function ColorSquare({ value, size = 56 }: { value: number; size?: number }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '10px',
      backgroundColor: COLOR_RAMP[value],
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      flexShrink: 0
    }} />
  );
}

export default function StickySpectrum({ spectrum }: StickySpectrumProps) {
  const spectrumValues = [
    spectrum.trade,
    spectrum.abortion,
    spectrum.migration,
    spectrum.economics,
    spectrum.rights,
  ];

  return (
    <div className={styles.stickyContainer}>
      <div className={styles.signatureBox}>
        <div className={styles.spectrumTitle}>Your Spectrum</div>
        <div className={styles.emojiRow}>
          {spectrumValues.map((value, i) => (
            <div key={i} className={styles.emojiColumn}>
              <ColorSquare value={value} size={56} />
              <span className={styles.emojiLabel}>{['T', 'A', 'M', 'E', 'R'][i]}</span>
            </div>
          ))}
        </div>
        
        <div className={styles.dimensionReference}>
          {POLICIES.map((policy) => (
            <span key={policy.key} className={styles.refLabel}>
              {policy.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
