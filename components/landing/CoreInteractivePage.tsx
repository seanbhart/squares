'use client';

import { useMemo, useState } from 'react';
import styles from './CoreLanding.module.css';
import {
  CORE_DIMENSIONS,
  CORE_FAMILIES,
  classifyCore,
  getCoreCode,
  getDimensionColor,
  getGridCellsForScores,
} from '@/lib/core-config';
import type { CoreScores } from '@/lib/core-config';

function describeLevel(
  negativeLabel: string,
  positiveLabel: string,
  value: number,
): string {
  const side = value <= 2 ? negativeLabel : positiveLabel;
  let strength: string;
  if (value === 0 || value === 5) {
    strength = 'strong';
  } else if (value === 1 || value === 4) {
    strength = 'leaning';
  } else {
    strength = 'mixed';
  }
  return strength + ' ' + side;
}

export default function CoreInteractivePage() {
  const [scores, setScores] = useState<CoreScores>([2, 2, 2, 2]);

  const classification = useMemo(() => classifyCore(scores), [scores]);
  const callSign = getCoreCode(scores);
  const gridCells = useMemo(() => getGridCellsForScores(scores, callSign), [scores, callSign]);

  const handleChange = (index: number, value: number) => {
    const next = [...scores] as CoreScores;
    next[index] = value;
    setScores(next);
  };

  const primaryType = classification.type;
  const primaryFamily = classification.family;

  const closestFamilies: { code: string; name: string }[] = [];
  const seenFamilyCodes = new Set<string>();
  for (const match of classification.closestVariations) {
    if (!seenFamilyCodes.has(match.familyCode)) {
      seenFamilyCodes.add(match.familyCode);
      const fam = CORE_FAMILIES[match.familyCode];
      closestFamilies.push({
        code: match.familyCode,
        name: fam ? fam.name : match.familyName,
      });
      if (closestFamilies.length >= 2) {
        break;
      }
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        <section className={styles.layout}>
          <header className={styles.header}>
            <h1 className={styles.title}>CORE Framework</h1>
            <p className={styles.subtitle}>
              Four dimmer switches instead of one left/right label. Set where you stand on Civil Rights,
              Openness, Redistribution, and Ethics, then see your CORE call sign and the families you are
              closest to.
            </p>
          </header>

          <div className={styles.slidersCard}>
            <h2 className={styles.slidersTitle}>Tune your four CORE dimensions</h2>
            <p className={styles.slidersHint}>
              Each slider has six snap points from 0 to 5. The left side is the first letter in the pair; the
              right side is the second.
            </p>

            <div className={styles.dimensionList}>
              {CORE_DIMENSIONS.map((dimension, index) => {
                const value = scores[index];
                const levelDescription = describeLevel(
                  dimension.negativeLabel,
                  dimension.positiveLabel,
                  value,
                );
                const [negativeLetter, positiveLetter] = dimension.pair;
                const badgeColor = getDimensionColor(value);

                return (
                  <div key={dimension.key} className={styles.dimensionRow}>
                    <div className={styles.dimensionLabel}>
                      <div className={styles.badgeRow}>
                        <span className={styles.axisBadge}>{dimension.key}</span>
                        <span className={styles.axisBadge} style={{ backgroundColor: badgeColor }}>
                          {negativeLetter}/{positiveLetter}
                        </span>
                      </div>
                      <span className={styles.dimensionName}>{dimension.name}</span>
                    </div>

                    <div className={styles.sliderBlock}>
                      <div className={styles.sliderValueLabel}>{levelDescription}</div>

                      <div className={styles.sliderLine}>
                        <input
                          type="range"
                          min={0}
                          max={5}
                          step={1}
                          value={value}
                          className={styles.slider}
                          style={{ ['--core-slider-color' as string]: badgeColor }}
                          onChange={(event) => handleChange(index, Number(event.target.value))}
                          aria-label={dimension.name + ' slider'}
                        />
                      </div>

                      <div className={styles.sliderLabels}>
                        <span>{dimension.negativeLabel}</span>
                        <span>{dimension.positiveLabel}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className={styles.previewColumn}>
          <section className={styles.gridCard}>
            <div className={styles.gridHeader}>
              <div>
                <div className={styles.callSign}>
                  {callSign.split('').map((letter, index) => {
                    const color = getDimensionColor(scores[index]);
                    return (
                      <span key={index} style={{ backgroundColor: color }}>
                        {letter}
                      </span>
                    );
                  })}
                </div>
                <div className={styles.callSignHint}>Your CORE call sign</div>
              </div>
            </div>

            <div className={styles.gridWrapper}>
              <div className={styles.grid} aria-label="CORE 3x3 grid preview">
                {gridCells.map((cell) => (
                  <div
                    key={cell.key}
                    className={styles.gridCell}
                    style={{ backgroundColor: cell.background }}
                    data-label={cell.label}
                  >
                    {cell.dimensionKey && (
                      <div className={styles.gridCellLabel}>
                        <span>{cell.dimensionKey}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.resultsCard}>
            <h2 className={styles.resultsTitle}>Where you land</h2>
            <p className={styles.resultsText}>
              {primaryType && primaryFamily ? (
                <>
                  You sit in the <strong>{primaryFamily.name}</strong> family
                  {primaryFamily.description ? ' (' + primaryFamily.description + ')' : ''} as a
                  <strong> {primaryType.name}</strong> ({callSign}).
                </>
              ) : (
                <>
                  As you move the sliders, we compute the closest of the sixteen CORE types and show which
                  families you cluster with.
                </>
              )}
            </p>

            {classification.closestVariations.length > 0 && (
              <div className={styles.subArchetypes}>
                {classification.closestVariations.map((variation) => (
                  <div
                    key={variation.typeCode + '-' + variation.variationKey}
                    className={styles.subArchetypeItem}
                  >
                    <span>{variation.typeCode + ' ' + variation.typeName}</span>{' '}
                    ({variation.variationName})
                  </div>
                ))}
              </div>
            )}

            {closestFamilies.length > 0 && (
              <div className={styles.familyPills}>
                {closestFamilies.map((family) => (
                  <span key={family.code} className={styles.familyPill}>
                    {family.name}
                  </span>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
