'use client';

import { useEffect, useRef, useState } from 'react';
import ProblemSection from './sections/ProblemSection';
import RealitySection from './sections/RealitySection';
import ColorScaleSection from './sections/ColorScaleSection';
import ShowDontTellSection from './sections/ShowDontTellSection';
import AssessmentQuestion from '@/components/assessment/AssessmentQuestion';
import ResultsSection from '@/components/assessment/ResultsSection';
import { POLICIES } from '@/lib/tamer-config';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [touchedDimensions, setTouchedDimensions] = useState<Set<number>>(new Set());

  const handleStartOver = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Optional: Add keyboard navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current) return;
      
      const sections = containerRef.current.querySelectorAll('section');
      const currentIndex = Math.round(containerRef.current.scrollTop / window.innerHeight);
      
      if (e.key === 'ArrowDown' && currentIndex < sections.length - 1) {
        sections[currentIndex + 1]?.scrollIntoView({ behavior: 'smooth' });
      } else if (e.key === 'ArrowUp' && currentIndex > 0) {
        sections[currentIndex - 1]?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAnswerChange = (dimensionIndex: number, value: number) => {
    const newAnswers = { ...answers, [dimensionIndex]: value };
    setAnswers(newAnswers);
    setTouchedDimensions(prev => new Set(prev).add(dimensionIndex));
    
    // Save to localStorage for /figures page
    if (typeof window !== 'undefined') {
      localStorage.setItem('userAssessment', JSON.stringify(newAnswers));
    }
    
    // Auto-scroll to next section after a brief delay
    setTimeout(() => {
      if (containerRef.current) {
        const sections = containerRef.current.querySelectorAll('section');
        // Landing sections (4) + current question index + 1 for next
        const nextSectionIndex = 4 + dimensionIndex + 1;
        const nextSection = sections[nextSectionIndex];
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 300);
  };

  const completedIndices = Object.keys(answers).map(Number);
  const letters = ['T', 'A', 'M', 'E', 'R'];

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Close button - visible on all sections */}
      <a href="/figures" className={styles.closeButton} aria-label="Close and explore figures">
        ✕
      </a>

      <ProblemSection />
      <RealitySection />
      <ColorScaleSection />
      <ShowDontTellSection />
      
      {/* Assessment Questions */}
      {POLICIES.map((policy, index) => (
        <AssessmentQuestion
          key={policy.key}
          policyKey={policy.key}
          label={policy.label}
          colorRamp={policy.colorRamp}
          letter={letters[index]}
          currentIndex={index}
          totalQuestions={POLICIES.length}
          value={answers[index] ?? 3}
          onChange={(value) => handleAnswerChange(index, value)}
          completedIndices={completedIndices}
          hasBeenTouched={touchedDimensions.has(index)}
        />
      ))}
      
      {/* Results */}
      <ResultsSection answers={answers} onStartOver={handleStartOver} />
    </div>
  );
}
