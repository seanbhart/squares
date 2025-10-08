"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

const COLOR_RAMP = [
  "#7c3aed",
  "#2563eb",
  "#16a34a",
  "#eab308",
  "#f97316",
  "#dc2626",
  "#111827",
] as const;

const POLICIES = [
  {
    key: "trade",
    label: "Trade",
    icon: "🟪",
    colorRamp: [
      "free trade",
      "minimal tariffs",
      "selective trade agreements",
      "balanced tariffs",
      "strategic protections",
      "heavy tariffs",
      "closed economy",
    ],
    colors: COLOR_RAMP,
  },
  {
    key: "abortion",
    label: "Abortion",
    icon: "🟦",
    colorRamp: [
      "partial birth abortion",
      "limit after viability",
      "limit after third trimester",
      "limit after second trimester",
      "limit after first trimester",
      "limit after heartbeat detection",
      "no exceptions allowed",
    ],
    colors: COLOR_RAMP,
  },
  {
    key: "migration",
    label: "Migration / Immigration",
    icon: "🟩",
    colorRamp: [
      "open borders",
      "easy pathways to citizenship",
      "expanded quotas",
      "current restrictions",
      "reduced quotas",
      "strict limits only",
      "no immigration",
    ],
    colors: COLOR_RAMP,
  },
  {
    key: "economics",
    label: "Economics",
    icon: "🟨",
    colorRamp: [
      "pure free market",
      "minimal regulation",
      "market-based with safety net",
      "balanced public-private",
      "strong social programs",
      "extensive public ownership",
      "full state control",
    ],
    colors: COLOR_RAMP,
  },
  {
    key: "rights",
    label: "Rights (civil liberties)",
    icon: "🟥",
    colorRamp: [
      "full legal equality",
      "protections with few limits",
      "protections with some limits",
      "tolerance without endorsement",
      "traditional definitions only",
      "no legal recognition",
      "criminalization",
    ],
    colors: COLOR_RAMP,
  },
] as const;

const PRESETS = [
  {
    name: "Franklin D. Roosevelt",
    spectrum: {
      trade: 4,
      abortion: 5,
      migration: 4,
      economics: 5,
      rights: 3,
    },
  },
  {
    name: "Ronald Reagan",
    spectrum: {
      trade: 1,
      abortion: 5,
      migration: 2,
      economics: 1,
      rights: 3,
    },
  },
  {
    name: "Barack Obama",
    spectrum: {
      trade: 2,
      abortion: 1,
      migration: 1,
      economics: 3,
      rights: 0,
    },
  },
  {
    name: "Donald Trump",
    spectrum: {
      trade: 5,
      abortion: 2,
      migration: 5,
      economics: 1,
      rights: 3,
    },
  },
] as const;

const getInitialSpectrum = () => {
  const entries = POLICIES.map((policy) => [policy.key, 3]);
  return Object.fromEntries(entries) as Record<(typeof POLICIES)[number]["key"], number>;
};

type Spectrum = ReturnType<typeof getInitialSpectrum>;

type Preset = (typeof PRESETS)[number];

const getScoreLabel = (policyKey: keyof Spectrum, score: number) => {
  const ramp = POLICIES.find((policy) => policy.key === policyKey)?.colorRamp ?? [];
  return ramp[score] ?? "";
};

const getScoreColor = (policyKey: keyof Spectrum, score: number) => {
  const palette = POLICIES.find((policy) => policy.key === policyKey)?.colors ?? [];
  return palette[score] ?? COLOR_RAMP[COLOR_RAMP.length - 1];
};

const hexToRgba = (hex: string, alpha = 1) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  const hasShortFormat = normalized.length === 3;

  if (Number.isNaN(bigint)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const r = hasShortFormat ? ((bigint >> 8) & 0xf) * 17 : (bigint >> 16) & 0xff;
  const g = hasShortFormat ? ((bigint >> 4) & 0xf) * 17 : (bigint >> 8) & 0xff;
  const b = hasShortFormat ? (bigint & 0xf) * 17 : bigint & 0xff;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

function useSpectrumComparison() {
  const [userSpectrum, setUserSpectrum] = useState<Spectrum>(() => getInitialSpectrum());
  const [comparison, setComparison] = useState<Preset | null>(null);

  const handleUpdate = (key: keyof Spectrum, value: number) => {
    setUserSpectrum((prev) => ({ ...prev, [key]: value }));
  };

  const spectrumDiff = useMemo(() => {
    if (!comparison) return null;
    const entries = Object.keys(userSpectrum).map((key) => {
      const typedKey = key as keyof Spectrum;
      const delta = userSpectrum[typedKey] - comparison.spectrum[typedKey];
      return [typedKey, delta];
    });
    return Object.fromEntries(entries) as Record<keyof Spectrum, number>;
  }, [comparison, userSpectrum]);

  return {
    userSpectrum,
    handleUpdate,
    comparison,
    setComparison,
    spectrumDiff,
  };
}

const EvaluationCell = ({
  label,
  color,
  isActive,
}: {
  label: string;
  color: string;
  isActive: boolean;
}) => {
  return (
    <div className={styles.cell} data-active={isActive}>
      <span
        className={styles.cellDot}
        style={{
          backgroundColor: color,
          boxShadow: `0 0 12px ${hexToRgba(color, isActive ? 0.6 : 0.35)}`,
        }}
      />
      <span className={styles.cellLabel}>{label}</span>
    </div>
  );
};

export default function Home() {
  const { userSpectrum, comparison, setComparison, handleUpdate, spectrumDiff } =
    useSpectrumComparison();

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Map Your Squares</h1>
          <p className={styles.subtitle}>
            Squares.vote uses the TAME-R typology to chart political positions across five
            policy dimensions. Adjust each slider to reveal your pattern and compare with
            historical figures or modern leaders.
          </p>
          <div className={styles.ctaRow}>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                className={styles.presetButton}
                data-selected={comparison?.name === preset.name}
                onClick={() => setComparison(preset)}
              >
                {preset.name}
              </button>
            ))}
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => {
                setComparison(null);
                handleUpdate("trade", 3);
                handleUpdate("abortion", 3);
                handleUpdate("migration", 3);
                handleUpdate("economics", 3);
                handleUpdate("rights", 3);
              }}
            >
              Reset
            </button>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <h2>Your Squares</h2>
          <ul>
            {POLICIES.map((policy) => (
              <li key={policy.key}>
                {(() => {
                  const color = getScoreColor(policy.key, userSpectrum[policy.key]);
                  return (
                    <>
                      <span className={styles.policyLabel}>
                        <span
                          className={styles.labelSquare}
                          style={{
                            backgroundColor: color,
                            boxShadow: `0 0 8px ${hexToRgba(color, 0.45)}`,
                          }}
                        />
                        {policy.label}
                      </span>
                      <span className={styles.policyValue}>
                        {policy.colorRamp[userSpectrum[policy.key]]}
                      </span>
                    </>
                  );
                })()}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.slidersSection}>
        <h2>Select Your Positions</h2>
        <div className={styles.slidersGrid}>
          {POLICIES.map((policy) => (
            <div key={policy.key} className={styles.sliderGroup}>
              <div className={styles.sliderHeader}>
                <h3>{policy.label}</h3>
                {comparison && (
                  <span className={styles.compareValue}>
                    {comparison.name.split(" ")[0]}: {comparison.spectrum[policy.key] + 1}
                  </span>
                )}
              </div>
              <div className={styles.sliderTrack}>
                {policy.colorRamp.map((label, index) => {
                  const color = getScoreColor(policy.key, index);
                  const isActive = userSpectrum[policy.key] === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleUpdate(policy.key, index)}
                      className={styles.sliderButton}
                      data-active={isActive}
                      style={
                        isActive
                          ? {
                              backgroundColor: hexToRgba(color, 0.18),
                              boxShadow: `0 0 18px ${hexToRgba(color, 0.35)}`,
                            }
                          : undefined
                      }
                      aria-label={`${policy.label} • ${label}`}
                    >
                      <EvaluationCell label={label} color={color} isActive={isActive} />
                    </button>
                  );
                })}
              </div>
              {comparison && (
                <div className={styles.diffRow}>
                  <span>Difference:</span>
                  <span className={styles.diffValue} data-positive={(spectrumDiff?.[policy.key] ?? 0) > 0}>
                    {spectrumDiff?.[policy.key] ?? 0}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.examplesSection}>
        <div>
          <h2>How TAME-R Works</h2>
          <p>
            TAME-R summarizes Trade, Abortion, Migration, Economics, and Rights policies using a
            seven-step gradient. Move from 🟪 expansive support to ⬛ restrictive control on each
            issue. Your pattern becomes a signature set of squares that can be compared with
            public figures or shared with others.
          </p>
          <p>
            Pick a preset above to load historical examples or modern leaders instantly, then
            adjust the controls to see how you align and where you differ.
          </p>
        </div>
      </section>
    </main>
  );
}
