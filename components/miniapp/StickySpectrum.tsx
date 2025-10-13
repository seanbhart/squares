'use client';

import styles from './StickySpectrum.module.css';

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

function getEmojiSquare(value: number): string {
  const emojis = ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥', '⬛️'];
  return emojis[value] || '🟨';
}

export default function StickySpectrum({ spectrum }: StickySpectrumProps) {
  const emojiSignature = [
    spectrum.trade,
    spectrum.abortion,
    spectrum.migration,
    spectrum.economics,
    spectrum.rights,
  ].map(value => getEmojiSquare(value));

  return (
    <div className={styles.stickyContainer}>
      <div className={styles.signatureBox}>
        <div className={styles.spectrumTitle}>Your Spectrum</div>
        <div className={styles.emojiRow}>
          {emojiSignature.map((emoji, i) => (
            <div key={i} className={styles.emojiColumn}>
              <span className={styles.largeEmoji}>{emoji}</span>
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
