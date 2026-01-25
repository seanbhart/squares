'use client';

import React, { useState, useMemo } from 'react';
import styles from './CoreQuestionnaire.module.css';

// Position labels for slider questions - 6 positions matching the colored squares
const POSITION_LABELS: Record<string, string[]> = {
  q1: ["Ban AI cameras", "Limit to crime areas", "Require warrants", "Allow with oversight", "Expand coverage", "Full surveillance"],
  q2: ["Let factory close", "Offer retraining", "Transition support", "Tariffs on imports", "Block the closure", "Ban outsourcing"],
  q4: ["Full gender education", "Age-appropriate content", "Parent opt-in", "Parent opt-out", "Biology focus only", "No sex education"],
  q5: ["Legalize all drugs", "Legalize most drugs", "Cannabis only", "Decriminalize use", "Medical exceptions", "Full prohibition"],
  q6: ["Accept all applicants", "Expand visa quotas", "Merit-based entry", "Cap annual numbers", "Citizens first hiring", "Halt immigration"],
  q7: ["Single-payer only", "Public option available", "Expand subsidies", "Tax credits for plans", "Free market only", "End mandates"],
  q8: ["Abandon outdated", "Modernize actively", "Adapt gradually", "Maintain most", "Protect all customs", "Restore old ways"],
  q11: ["Symbols unnecessary", "Optional observance", "Personal choice", "Encourage pride", "Teach in schools", "Mandate observance"],
  q12: ["Doctors override", "Court decides", "Ethics board review", "Parents with input", "Parents decide", "No state interference"],
  q13: ["Mostly luck", "System advantages", "Mixed factors", "Talent and timing", "Hard work pays", "Fully self-made"],
  q14: ["Lead the change", "Join movements", "Open to reform", "Wait and see", "Resist until proven", "Oppose new norms"],
  q15: ["Join immediately", "Negotiate then join", "Case by case", "Only if we lead", "Bilateral deals only", "Full independence"],
  q16: ["Ban conscription", "Fully voluntary", "Incentivize service", "Civilian option", "Military service", "Universal duty"],
};

// Colors for the 6 spectrum squares (we show 6 to match CORE's color scheme)
const SPECTRUM_COLORS = [
  'var(--color-purple)',
  'var(--color-blue)',
  'var(--color-green)',
  'var(--color-gold)',
  'var(--color-orange)',
  'var(--color-red)',
];

// Question types
type QuestionType = 'slider' | 'forced-choice' | 'percentage';

interface SliderQuestion {
  id: string;
  type: 'slider';
  text: string;
  dimension: 'civilRights' | 'openness' | 'redistribution' | 'ethics';
  lowLabel: string;
  highLabel: string;
  weight?: number; // Default 1.0, some questions weighted differently
}

interface ForcedChoiceQuestion {
  id: string;
  type: 'forced-choice';
  text: string;
  dimension: 'civilRights' | 'openness' | 'redistribution' | 'ethics';
  options: Array<{
    label: string;
    value: number; // 0-5 score
  }>;
  weight?: number;
}

interface PercentageQuestion {
  id: string;
  type: 'percentage';
  text: string;
  dimension: 'civilRights' | 'openness' | 'redistribution' | 'ethics';
  lowLabel: string;
  highLabel: string;
  weight?: number;
}

type Question = SliderQuestion | ForcedChoiceQuestion | PercentageQuestion;

// All 16 questions ordered for optimal engagement
const QUESTIONS: Question[] = [
  // Q1: Security Camera Scenario (C)
  {
    id: 'q1',
    type: 'slider',
    text: 'A city is considering installing AI-powered security cameras throughout public spaces. Supporters say it will reduce crime by 30%. Critics say it creates a surveillance state. Where do you stand?',
    dimension: 'civilRights',
    lowLabel: 'Privacy in public spaces matters more than the crime reduction',
    highLabel: 'A 30% crime reduction is worth the surveillance trade-off',
  },
  // Q2: Factory Closing (O)
  {
    id: 'q2',
    type: 'slider',
    text: 'A factory in your region is closing because the company can produce goods more cheaply overseas. 500 local jobs will be lost, but consumers nationwide will benefit from lower prices. What\'s your reaction?',
    dimension: 'openness',
    lowLabel: 'This is how markets should work—everyone benefits from efficient global trade',
    highLabel: 'We should protect local jobs even if it means higher prices for everyone',
  },
  // Q3: Inheritance Dilemma (R)
  {
    id: 'q3',
    type: 'percentage',
    text: 'A wealthy person dies and wants to leave their entire $10 million estate to their children. Some argue this is their right; others argue large inheritances create unfair advantages. What portion should be taxed for public services?',
    dimension: 'redistribution',
    lowLabel: 'All to heirs (0% tax)',
    highLabel: 'All to public (100% tax)',
  },
  // Q4: Curriculum Controversy (E)
  {
    id: 'q4',
    type: 'slider',
    text: 'A school district is updating its health curriculum. One group wants comprehensive information about gender identity and sexuality reflecting current research. Another group wants to maintain the traditional curriculum focused on biological sex and conventional relationships. Which approach do you favor?',
    dimension: 'ethics',
    lowLabel: 'Update to reflect current understanding',
    highLabel: 'Preserve the traditional approach',
  },
  // Q5: Drug Legalization (C)
  {
    id: 'q5',
    type: 'slider',
    text: 'Consider the legalization of recreational drugs beyond alcohol and tobacco. Some argue adults should be free to make their own choices about substances; others argue government should restrict access to protect public health. Where do you fall?',
    dimension: 'civilRights',
    lowLabel: 'Adults should decide for themselves what substances to use',
    highLabel: 'Government should restrict access to protect people',
  },
  // Q6: Immigration Scenario (O)
  {
    id: 'q6',
    type: 'slider',
    text: 'Your country receives applications from skilled workers around the world who want to immigrate. How should immigration policy balance economic benefits against effects on national identity and social cohesion?',
    dimension: 'openness',
    lowLabel: 'Prioritize openness—diversity and talent inflows strengthen us',
    highLabel: 'Prioritize cohesion—too much immigration too fast strains social bonds',
  },
  // Q7: Healthcare System (R)
  {
    id: 'q7',
    type: 'slider',
    text: 'Two healthcare systems are being debated:\n\nSystem A: Private insurance with government help for those who can\'t afford it. More choice but variable coverage based on what you can pay.\n\nSystem B: Universal government healthcare for everyone. Equal coverage but less individual choice and potentially longer waits.\n\nWhich system would you prefer?',
    dimension: 'redistribution',
    lowLabel: 'Strongly prefer System A (Private + assistance)',
    highLabel: 'Strongly prefer System B (Universal)',
  },
  // Q8: Tradition Question (E)
  {
    id: 'q8',
    type: 'slider',
    text: 'Consider traditions, customs, and social norms that have been practiced for generations (religious practices, family structures, community rituals, gender roles, etc.). In general, how should society approach these inherited practices?',
    dimension: 'ethics',
    lowLabel: 'Critically examine and update based on current values',
    highLabel: 'Presume wisdom in tradition—change cautiously',
  },
  // Q9: Speech Dilemma (C) - Forced Choice
  {
    id: 'q9',
    type: 'forced-choice',
    text: 'A controversial speaker is invited to give a talk at a public university. Some students find the speaker\'s views deeply offensive and want the event canceled. Others argue that universities should allow diverse viewpoints. What should happen?',
    dimension: 'civilRights',
    options: [
      { label: 'The speaker should be allowed—free expression must be protected even when offensive', value: 0 },
      { label: 'The speaker should be allowed but the university should clearly distance itself from the views', value: 2 },
      { label: 'The event should be moved off-campus so it\'s not officially university-sanctioned', value: 3 },
      { label: 'The university should cancel—it has no obligation to platform harmful views', value: 5 },
    ],
  },
  // Q10: Budget Allocation (R)
  {
    id: 'q10',
    type: 'percentage',
    text: 'Imagine you\'re deciding how your country allocates its budget between two approaches to poverty reduction:\n\nApproach A: Lower taxes and reduce regulations so businesses can create more jobs and opportunities.\n\nApproach B: Higher taxes on wealthy individuals and corporations to fund direct assistance programs for the poor.\n\nHow would you allocate the budget?',
    dimension: 'redistribution',
    lowLabel: '100% Approach A (Lower taxes)',
    highLabel: '100% Approach B (Direct assistance)',
  },
  // Q11: National Symbols (O)
  {
    id: 'q11',
    type: 'slider',
    text: 'How important is it to you that your country maintains distinct national symbols, holidays, language requirements, and cultural traditions—even as the population becomes more diverse?',
    dimension: 'openness',
    lowLabel: 'Not important—culture should evolve with the population',
    highLabel: 'Very important—shared traditions unite us',
  },
  // Q12: Parental Rights (C) - Note: This inverts the typical mapping
  {
    id: 'q12',
    type: 'slider',
    text: 'Parents want to make a decision for their minor child that medical professionals consider potentially harmful to the child\'s wellbeing (this could be refusing a treatment, or pursuing an unconventional one). Who should have final authority?',
    dimension: 'civilRights',
    lowLabel: 'Medical professionals and courts should override parents if child welfare is at risk',
    highLabel: 'Parents should have primary authority over their children\'s care',
    weight: 0.5, // Weighted lower due to complexity/inversion
  },
  // Q13: Wealth Creation (R)
  {
    id: 'q13',
    type: 'slider',
    text: 'Consider two statements about wealth and success:\n\nStatement A: "Wealthy people have mostly earned their success through hard work and smart decisions. Their wealth benefits society through investment and job creation."\n\nStatement B: "Wealth largely reflects luck and systemic advantages. Society has a right to redistribute it more equally since no one fully \'earns\' their position."\n\nWhere do you fall between these views?',
    dimension: 'redistribution',
    lowLabel: 'Statement A reflects my view',
    highLabel: 'Statement B reflects my view',
  },
  // Q14: Social Change Pace (E)
  {
    id: 'q14',
    type: 'slider',
    text: 'Society\'s moral views evolve over time. Some changes that seemed radical eventually became accepted (e.g., interracial marriage, women voting). When new social movements push for changes in norms and values, what\'s your general instinct?',
    dimension: 'ethics',
    lowLabel: 'Change is usually progress—we should embrace it',
    highLabel: 'Caution is wise—many changes have unforeseen consequences',
  },
  // Q15: International Cooperation (O)
  {
    id: 'q15',
    type: 'slider',
    text: 'Your country is considering joining an international agreement on climate/trade/security. The agreement would achieve better outcomes globally but requires your country to follow rules it didn\'t fully choose and sometimes accept decisions that aren\'t in its immediate national interest. Should your country join?',
    dimension: 'openness',
    lowLabel: 'Yes—global problems need global cooperation even at some national cost',
    highLabel: 'No—we shouldn\'t cede sovereignty to international bodies',
  },
  // Q16: Mandatory Service (C)
  {
    id: 'q16',
    type: 'slider',
    text: 'Some countries require all young adults to complete a period of mandatory national service (military or civilian). Supporters say it builds shared identity and ensures everyone contributes. Opponents say it\'s an infringement on individual freedom. What\'s your view?',
    dimension: 'civilRights',
    lowLabel: 'Mandatory service is an unacceptable infringement on freedom',
    highLabel: 'Mandatory service is a reasonable obligation of citizenship',
  },
];

interface CoreQuestionnaireProps {
  onComplete: (scores: {
    civilRights: number;
    openness: number;
    redistribution: number;
    ethics: number;
  }) => void;
  onCancel: () => void;
}

export default function CoreQuestionnaire({ onComplete, onCancel }: CoreQuestionnaireProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>(() => {
    // Load saved answers from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('core_questionnaire_answers_miniapp');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return {};
        }
      }
    }
    return {};
  });

  // Save answers to localStorage whenever they change
  React.useEffect(() => {
    if (typeof window !== 'undefined' && Object.keys(answers).length > 0) {
      localStorage.setItem('core_questionnaire_answers_miniapp', JSON.stringify(answers));
    }
  }, [answers]);

  // Clear saved answers on completion
  const clearSavedAnswers = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('core_questionnaire_answers_miniapp');
    }
  };

  const currentQuestion = QUESTIONS[currentIndex];
  const progress = ((currentIndex) / QUESTIONS.length) * 100;
  const isLastQuestion = currentIndex === QUESTIONS.length - 1;
  const hasAnswer = answers[currentQuestion.id] !== undefined;

  // Calculate scores when complete
  const calculateScores = () => {
    const dimensionScores: Record<string, { total: number; weight: number }> = {
      civilRights: { total: 0, weight: 0 },
      openness: { total: 0, weight: 0 },
      redistribution: { total: 0, weight: 0 },
      ethics: { total: 0, weight: 0 },
    };

    QUESTIONS.forEach((q) => {
      const answer = answers[q.id];
      if (answer !== undefined) {
        const weight = q.weight ?? 1.0;
        dimensionScores[q.dimension].total += answer * weight;
        dimensionScores[q.dimension].weight += weight;
      }
    });

    // Calculate averages and map to 0-5 scale
    const finalScores = {
      civilRights: Math.round(dimensionScores.civilRights.total / dimensionScores.civilRights.weight),
      openness: Math.round(dimensionScores.openness.total / dimensionScores.openness.weight),
      redistribution: Math.round(dimensionScores.redistribution.total / dimensionScores.redistribution.weight),
      ethics: Math.round(dimensionScores.ethics.total / dimensionScores.ethics.weight),
    };

    // Clamp to 0-5 range
    return {
      civilRights: Math.max(0, Math.min(5, finalScores.civilRights)),
      openness: Math.max(0, Math.min(5, finalScores.openness)),
      redistribution: Math.max(0, Math.min(5, finalScores.redistribution)),
      ethics: Math.max(0, Math.min(5, finalScores.ethics)),
    };
  };

  const handlePercentageChange = (value: number) => {
    // Map 0-100 percentage to 0-5 CORE scale
    const mappedValue = Math.round((value / 100) * 5);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: mappedValue }));
  };

  const handleForcedChoiceSelect = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = () => {
    if (isLastQuestion) {
      clearSavedAnswers();
      const scores = calculateScores();
      onComplete(scores);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    // Skip assigns a neutral middle value (2.5)
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: 2.5 }));
    if (!isLastQuestion) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  // Get progress milestone message
  const getProgressMessage = (): string | null => {
    if (currentIndex === 4) return "Great start! 3 more dimensions to explore.";
    if (currentIndex === 8) return "Halfway there—you're doing great.";
    if (currentIndex === 12) return "Almost done—4 questions left.";
    return null;
  };

  const progressMessage = getProgressMessage();

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Get current percentage value from answer
  const getCurrentPercentageValue = (): number => {
    const answer = answers[currentQuestion.id];
    if (answer === undefined) return 50;
    return Math.round((answer / 5) * 100);
  };

  const renderSliderQuestion = (q: SliderQuestion) => {
    const currentAnswer = answers[q.id];
    const positionLabels = POSITION_LABELS[q.id] || [];
    // Map CORE score (0-5) to selected square index (0-5)
    const selectedIndex = currentAnswer !== undefined ? Math.round(currentAnswer) : -1;

    return (
      <div className={styles.questionContent}>
        <p className={styles.questionText}>{q.text}</p>

        <div className={styles.squaresContainer}>
          <div className={styles.squaresRow}>
            {SPECTRUM_COLORS.map((color, idx) => {
              const isSelected = idx === selectedIndex;

              return (
                <button
                  key={idx}
                  className={`${styles.spectrumSquareBtn} ${isSelected ? styles.spectrumSquareSelected : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                  aria-label={positionLabels[idx] || `Position ${idx + 1}`}
                />
              );
            })}
          </div>
          <div className={styles.squaresLabels}>
            <span className={styles.squareLabel}>{q.lowLabel}</span>
            <span className={styles.squareLabel}>{q.highLabel}</span>
          </div>
          {selectedIndex >= 0 && positionLabels[selectedIndex] && (
            <div className={styles.selectedPositionLabel}>
              {positionLabels[selectedIndex]}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPercentageQuestion = (q: PercentageQuestion) => {
    const value = getCurrentPercentageValue();
    // Map percentage to 6-square selection (0-16%, 17-33%, 34-50%, 51-66%, 67-83%, 84-100%)
    const selectedSquare = Math.min(5, Math.floor(value / 17));

    return (
      <div className={styles.questionContent}>
        <p className={styles.questionText}>{q.text}</p>

        <div className={styles.squaresContainer}>
          <div className={styles.percentageDisplay}>
            <span>{100 - value}%</span>
            <span>{value}%</span>
          </div>
          <div className={styles.squaresRow}>
            {SPECTRUM_COLORS.map((color, idx) => {
              const isSelected = idx === selectedSquare;
              // Calculate percentage for this square position
              const squarePercentage = Math.round((idx / 5) * 100);

              return (
                <button
                  key={idx}
                  className={`${styles.spectrumSquareBtn} ${isSelected ? styles.spectrumSquareSelected : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => handlePercentageChange(squarePercentage)}
                  aria-label={`${squarePercentage}%`}
                />
              );
            })}
          </div>
          <div className={styles.squaresLabels}>
            <span className={styles.squareLabel}>{q.lowLabel}</span>
            <span className={styles.squareLabel}>{q.highLabel}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderForcedChoiceQuestion = (q: ForcedChoiceQuestion) => {
    const selectedValue = answers[q.id];

    return (
      <div className={styles.questionContent}>
        <p className={styles.questionText}>{q.text}</p>

        <div className={styles.optionsContainer}>
          {q.options.map((option, idx) => (
            <button
              key={idx}
              className={`${styles.optionButton} ${selectedValue === option.value ? styles.optionSelected : ''}`}
              onClick={() => handleForcedChoiceSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'slider':
        return renderSliderQuestion(currentQuestion);
      case 'percentage':
        return renderPercentageQuestion(currentQuestion);
      case 'forced-choice':
        return renderForcedChoiceQuestion(currentQuestion);
    }
  };

  // Dimension indicator
  const dimensionLabels: Record<string, { letter: string; name: string; color: string }> = {
    civilRights: { letter: 'C', name: 'Civil Rights', color: 'var(--color-purple)' },
    openness: { letter: 'O', name: 'Openness', color: 'var(--color-blue)' },
    redistribution: { letter: 'R', name: 'Redistribution', color: 'var(--color-green)' },
    ethics: { letter: 'E', name: 'Ethics', color: 'var(--color-gold)' },
  };

  const currentDimension = dimensionLabels[currentQuestion.dimension];

  return (
    <div className={styles.questionnaireOverlay}>
      <div className={styles.questionnaireContainer}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.cancelButton} onClick={onCancel}>
            ×
          </button>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressText}>
              Question {currentIndex + 1} of {QUESTIONS.length}
            </span>
          </div>
        </div>

        {/* Dimension Badge */}
        <div className={styles.dimensionBadge} style={{ borderColor: currentDimension.color }}>
          <span className={styles.dimensionLetter} style={{ color: currentDimension.color }}>
            {currentDimension.letter}
          </span>
          <span className={styles.dimensionName}>{currentDimension.name}</span>
        </div>

        {/* Question */}
        {renderQuestion()}

        {/* Progress Milestone */}
        {progressMessage && (
          <div className={styles.progressMilestone}>
            {progressMessage}
          </div>
        )}

        {/* Navigation */}
        <div className={styles.navigation}>
          <button
            className={styles.backButton}
            onClick={handleBack}
            disabled={currentIndex === 0}
          >
            Back
          </button>
          <div className={styles.navRight}>
            {!hasAnswer && (
              <button
                className={styles.skipButton}
                onClick={handleSkip}
              >
                Skip
              </button>
            )}
            <button
              className={styles.nextButton}
              onClick={handleNext}
            >
              {isLastQuestion ? 'Reveal my CORE profile' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
