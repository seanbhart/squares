"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./figures.module.css";
import ChatModal from "@/components/ChatModal";
import { POLICIES, getScoreColor, getEmojiSquare, type PolicyKey } from "@/lib/tamer-config";
import { ClipboardIcon, CheckIcon, SunIcon, MoonIcon } from "@/components/icons";
import type { Figure, FiguresData } from "@/lib/api/figures";

type Spectrum = Record<PolicyKey, number>;

type CopyState = "idle" | "copied" | "error";

const getBaselineSpectrum = () => {
  const entries = POLICIES.map((policy) => [policy.key, 3]);
  return Object.fromEntries(entries) as Spectrum;
};

const spectrumFromArray = (values: number[]) => {
  const entries = POLICIES.map((policy, index) => [policy.key, values[index] ?? 3]);
  return Object.fromEntries(entries) as Spectrum;
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

function useSpectrumState(initialSpectrum: Spectrum) {
  const [userSpectrum, setUserSpectrum] = useState<Spectrum>(initialSpectrum);

  const handleUpdate = useCallback((key: PolicyKey, value: number) => {
    setUserSpectrum((prev) => ({ ...prev, [key]: value }));
  }, []);

  const loadSpectrum = useCallback((next: Spectrum) => {
    setUserSpectrum({ ...next });
  }, []);

  const resetSpectrum = useCallback(() => {
    setUserSpectrum({ ...initialSpectrum });
  }, [initialSpectrum]);

  return {
    userSpectrum,
    handleUpdate,
    loadSpectrum,
    resetSpectrum,
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
        }}
      />
      <span className={styles.cellLabel}>{label}</span>
    </div>
  );
};

const TimelineSquares = ({ values }: { values: number[] }) => {
  return (
    <div className={styles.timelineSquares}>
      {POLICIES.map((policy, index) => {
        const value = values[index] ?? 3;
        const color = getScoreColor(policy.key, value);
        return (
          <span
            key={`${policy.key}-${index}`}
            className={styles.timelineSquare}
            style={{
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
};

export default function FiguresPage() {
  const [figuresData, setFiguresData] = useState<FiguresData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasManualEdit, setHasManualEdit] = useState(false);
  const { userSpectrum, handleUpdate: baseHandleUpdate, loadSpectrum, resetSpectrum } = useSpectrumState(getBaselineSpectrum());

  const handleUpdate = useCallback((key: PolicyKey, value: number) => {
    baseHandleUpdate(key, value);
    setHasManualEdit(true);
  }, [baseHandleUpdate]);

  const [selectedFigureName, setSelectedFigureName] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load figures data
  useEffect(() => {
    async function loadFigures() {
      try {
        const response = await fetch('/api/figures');
        if (!response.ok) throw new Error('Failed to fetch figures');
        const data: FiguresData = await response.json();
        setFiguresData(data);
        
        // Set default figure
        const featuredFigures = data.figures.filter(f => data.featured.includes(f.name));
        const defaultFigure = featuredFigures[0] || data.figures[0];
        if (defaultFigure) {
          setSelectedFigureName(defaultFigure.name);
          loadSpectrum(spectrumFromArray(defaultFigure.spectrum));
        }
      } catch (error) {
        console.error('Failed to load figures:', error);
      } finally {
        setLoading(false);
      }
    }
    loadFigures();
  }, [loadSpectrum]);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }, [theme]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const figureMap = useMemo(() => {
    if (!figuresData) return new Map();
    return new Map(figuresData.figures.map(f => [f.name, f]));
  }, [figuresData]);

  const featuredFigures = useMemo(() => {
    if (!figuresData) return [];
    // Preserve the order from the featured array
    return figuresData.featured
      .map(name => figuresData.figures.find(f => f.name === name))
      .filter((f): f is typeof figuresData.figures[0] => f !== undefined);
  }, [figuresData]);

  const additionalFigures = useMemo(() => {
    if (!figuresData) return [];
    return figuresData.figures.filter(f => !figuresData.featured.includes(f.name));
  }, [figuresData]);

  const selectedFigure = useMemo(() => {
    if (!selectedFigureName) return null;
    return figureMap.get(selectedFigureName) ?? null;
  }, [selectedFigureName, figureMap]);

  const handleSelectFigure = useCallback(
    (name: string) => {
      const figure = figureMap.get(name);
      if (!figure) return;
      setSelectedFigureName(name);
      loadSpectrum(spectrumFromArray(figure.spectrum));
      setHasManualEdit(false);
    },
    [loadSpectrum, figureMap]
  );

  const allFigures = useMemo(() => {
    return [...featuredFigures, ...additionalFigures];
  }, [featuredFigures, additionalFigures]);

  const displayedFigure = useMemo(() => {
    if (hasManualEdit) return null;
    return selectedFigure;
  }, [hasManualEdit, selectedFigure]);

  const emojiSignature = useMemo(() => {
    return POLICIES.map((policy) => getEmojiSquare(userSpectrum[policy.key])).join("");
  }, [userSpectrum]);

  const handleCopySquares = useCallback(async () => {
    if (!emojiSignature) return;

    if (typeof navigator === "undefined" || !navigator.clipboard) {
      setCopyState("error");
      return;
    }

    try {
      await navigator.clipboard.writeText(emojiSignature);
      setCopyState("copied");
    } catch (error) {
      console.error("Failed to copy squares", error);
      setCopyState("error");
      return;
    }

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    copyTimeoutRef.current = setTimeout(() => {
      setCopyState("idle");
    }, 1500);
  }, [emojiSignature]);

  if (loading) {
    return (
      <main className={styles.main}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Loading...</h1>
        </div>
      </main>
    );
  }

  return (
    <>
      <ChatModal />
      <main className={styles.main}>
        <button
          className={styles.themeToggle}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Map Your Squares</h1>
          <p className={styles.subtitle}>
            Squares.vote uses the TAME-R typology to chart political positions across five
            policy dimensions. Adjust each slider to reveal your pattern and compare with
            historical figures or modern leaders.
          </p>
          <div className={styles.ctaRow}>
            {featuredFigures.map((figure) => (
              <button
                key={figure.name}
                type="button"
                className={styles.presetButton}
                data-selected={!hasManualEdit && selectedFigureName === figure.name}
                onClick={() => handleSelectFigure(figure.name)}
              >
                {figure.name}
              </button>
            ))}
            <select
              className={styles.figureSelect}
              value={hasManualEdit ? "" : selectedFigureName}
              onChange={(e) => e.target.value && handleSelectFigure(e.target.value)}
            >
              <option value="">More figures…</option>
              {additionalFigures.map((figure) => (
                <option key={figure.name} value={figure.name}>
                  {figure.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.summaryHeader}>
            <h2>{displayedFigure ? displayedFigure.name : "Your Squares"}</h2>
            <div className={styles.signatureWrapper}>
              <div className={styles.signatureRow}>
                {POLICIES.map((policy) => {
                  const color = getScoreColor(policy.key, userSpectrum[policy.key]);
                  return (
                    <span
                      key={`${policy.key}-square`}
                      className={styles.signatureSquare}
                      style={{
                        backgroundColor: color,
                      }}
                      aria-label={`${policy.label} selection`}
                    />
                  );
                })}
              </div>
              <button
                type="button"
                className={styles.copyButton}
                data-state={copyState}
                onClick={handleCopySquares}
                aria-label={
                  copyState === "copied"
                    ? "Squares copied to clipboard"
                    : copyState === "error"
                    ? "Copy failed, try again"
                    : "Copy squares to clipboard"
                }
                title={
                  copyState === "copied" ? "Copied!" : copyState === "error" ? "Copy failed" : emojiSignature
                }
              >
                {copyState === "copied" ? <CheckIcon /> : <ClipboardIcon />}
              </button>
            </div>
          </div>
          {displayedFigure ? (
            <div className={styles.figureTimeline}>
              <p className={styles.figureLifespan}>{displayedFigure.lifespan}</p>
              <div className={styles.timelineEntries}>
                {displayedFigure.timeline.map((entry) => (
                  <div key={entry.label} className={styles.timelineEntry}>
                    <h4>{entry.label}</h4>
                    <div className={styles.entrySquares}>
                      {entry.spectrum.map((value, index) => {
                        const policy = POLICIES[index];
                        const color = getScoreColor(policy.key, value);
                        return (
                          <span
                            key={`${policy.key}-${index}`}
                            className={styles.entrySquare}
                            style={{ backgroundColor: color }}
                            title={`${policy.label}: ${policy.colorRamp[value]}`}
                          />
                        );
                      })}
                    </div>
                    <p className={styles.entryNote}>{entry.note}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </section>

      <section className={styles.slidersSection}>
        <h2>Select Your Positions</h2>
        <div className={styles.slidersGrid}>
          {POLICIES.map((policy) => (
            <div key={policy.key} className={styles.sliderGroup}>
              <div className={styles.sliderHeader}>
                <span
                  className={styles.headerSquare}
                  style={{
                    backgroundColor: getScoreColor(policy.key, userSpectrum[policy.key]),
                  }}
                  aria-hidden
                />
                <h3>{policy.label}</h3>
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
                      aria-label={`${policy.label} • ${label}`}
                    >
                      <EvaluationCell label={label} color={color} isActive={isActive} />
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.aboutSection}>
        <h2>How TAME-R Works</h2>
        <p>
          TAME-R maps political positions across Trade, Abortion, Migration, Economics, and
          Rights using a seven-step spectrum. Each color represents a different level of
          government intervention—from 🟪 minimal restrictions and maximum individual freedom to
          ⬛ extensive regulation and state control. Your unique pattern of squares reveals where
          you stand on the role of government across these five dimensions.
        </p>
        <p>
          Select a featured figure or choose from the dropdown to see how their positions evolved
          across major chapters of their public life. Adjust the sliders to create your own
          political profile.
        </p>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p>
            <strong>Squares.vote</strong> is an open-source project for mapping political positions.
          </p>
          <div className={styles.footerLinks}>
            <a href="/embed" className={styles.footerLink}>
              🔌 Embed on Your Site
            </a>
            <a href="https://github.com/seanbhart/squares" target="_blank" rel="noopener noreferrer" className={styles.footerLink}>
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </footer>
      </main>
    </>
  );
}
