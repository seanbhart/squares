'use client';

import { useState, useEffect } from 'react';
import styles from './ShowDontTellSection.module.css';
import { POLICIES, getScoreColor } from '@/lib/tamer-config';
import type { Figure, FiguresData } from '@/lib/api/figures';

// Subset of notable figures with diverse positions
const FIGURES = [
  { name: 'Martin Luther King Jr.', img: '✊🏿' },
  { name: 'Albert Einstein', img: '⚛️' },
  { name: 'Abraham Lincoln', img: '🎩' },
  { name: 'Mahatma Gandhi', img: '🕊️' },
  { name: 'Nelson Mandela', img: '⚖️' },
  { name: 'Rosa Parks', img: '🚌' },
  { name: 'Thomas Jefferson', img: '📜' },
  { name: 'Eleanor Roosevelt', img: '🌹' },
  { name: 'Winston Churchill', img: '🎖️' },
  { name: 'Susan B. Anthony', img: '🗳️' },
  { name: 'Frederick Douglass', img: '✍️' },
  { name: 'Harriet Tubman', img: '🌟' },
  { name: 'John F. Kennedy', img: '🎤' },
  { name: 'Dietrich Bonhoeffer', img: '✝️' },
  { name: 'Ronald Reagan', img: '🎬' },
];

export default function ShowDontTellSection() {
  const [selectedFigures, setSelectedFigures] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [figuresData, setFiguresData] = useState<FiguresData | null>(null);
  const [loading, setLoading] = useState(true);

  // Load figures data
  useEffect(() => {
    async function loadFigures() {
      try {
        const response = await fetch('/api/figures');
        if (!response.ok) throw new Error('Failed to fetch figures');
        const data: FiguresData = await response.json();
        setFiguresData(data);
      } catch (error) {
        console.error('Failed to load figures:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFigures();
  }, []);

  useEffect(() => {
    if (selectedFigures.length === 2) {
      setShowComparison(true);
    } else {
      setShowComparison(false);
    }
  }, [selectedFigures]);

  const handleSelectFigure = (name: string) => {
    if (selectedFigures.includes(name)) {
      setSelectedFigures(selectedFigures.filter(f => f !== name));
    } else if (selectedFigures.length < 2) {
      setSelectedFigures([...selectedFigures, name]);
    } else {
      // Replace oldest selection
      setSelectedFigures([selectedFigures[1], name]);
    }
  };

  return (
    <section className={styles.section}>
      <div className={styles.content}>
        <h2 className={styles.headline}>
          Pick two figures you admire:
        </h2>

        <div className={styles.figuresGrid}>
          {FIGURES.map((figure) => {
            const isSelected = selectedFigures.includes(figure.name);
            const selectionIndex = selectedFigures.indexOf(figure.name);
            
            return (
              <button
                key={figure.name}
                className={styles.figureCard}
                data-selected={isSelected}
                data-selection={isSelected ? selectionIndex + 1 : undefined}
                onClick={() => handleSelectFigure(figure.name)}
              >
                <span className={styles.figureEmoji}>{figure.img}</span>
                <span className={styles.figureName}>{figure.name}</span>
                {isSelected && (
                  <span className={styles.selectionBadge}>{selectionIndex + 1}</span>
                )}
              </button>
            );
          })}
        </div>

        {showComparison && figuresData && (
          <div className={styles.comparison}>
            <div className={styles.comparisonContent}>
              <p className={styles.comparisonText}>
                See the difference?
              </p>

              <div className={styles.tamerReference}>
                <span className={styles.tamerLetter}>T</span>rade
                <span className={styles.tamerDot}> • </span>
                <span className={styles.tamerLetter}>A</span>bortion
                <span className={styles.tamerDot}> • </span>
                <span className={styles.tamerLetter}>M</span>igration
                <span className={styles.tamerDot}> • </span>
                <span className={styles.tamerLetter}>E</span>conomics
                <span className={styles.tamerDot}> • </span>
                <span className={styles.tamerLetter}>R</span>ights
              </div>
              
              <div className={styles.figuresComparison}>
                {selectedFigures.map((figureName) => {
                  const figure = figuresData.figures.find(f => f.name === figureName);
                  if (!figure) return null;
                  
                  return (
                    <div key={figureName} className={styles.figurePattern}>
                      <h4 className={styles.figureName}>{figure.name}</h4>
                      <div className={styles.squares}>
                        {figure.spectrum.map((value, index) => {
                          const policy = POLICIES[index];
                          const color = getScoreColor(policy.key, value);
                          // TAME-R letters
                          const letters = ['T', 'A', 'M', 'E', 'R'];
                          return (
                            <div
                              key={policy.key}
                              className={styles.squareWithLabel}
                              title={`${policy.label}: ${policy.colorRamp[value]}`}
                            >
                              <span
                                className={styles.square}
                                style={{ backgroundColor: color }}
                              />
                              <span className={styles.squareLabel}>{letters[index]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className={styles.comparisonSubtext}>
                Even people you admire have different patterns. Simple labels can't capture this nuance.
              </p>
            </div>
          </div>
        )}

        {selectedFigures.length < 2 && (
          <p className={styles.instruction}>
            Select {2 - selectedFigures.length} more {selectedFigures.length === 1 ? 'figure' : 'figures'}
          </p>
        )}
      </div>

      <div className={styles.scrollHint}>
        <span className={styles.scrollText}>Scroll to continue</span>
        <div className={styles.scrollArrow}>↓</div>
      </div>
    </section>
  );
}
