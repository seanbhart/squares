"use client";

import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import figuresRaw from "../data/figures.json";
import styles from "./page.module.css";
import ChatModal from "./components/ChatModal";
import { POLICIES, getScoreColor, getEmojiSquare, type PolicyKey } from "@/lib/tamer-config";
import { ClipboardIcon, CheckIcon, SunIcon, MoonIcon } from "./components/icons";

type TimelineEntry = {
  label: string;
  spectrum: number[];
  note: string;
};

type Figure = {
  name: string;
  lifespan: string;
  spectrum: number[];
  timeline: TimelineEntry[];
};

type FiguresData = {
  featured: string[];
  figures: Figure[];
};

const figuresData = figuresRaw as FiguresData;

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

const FIGURE_MAP = new Map<string, Figure>(
  figuresData.figures.map((figure) => [figure.name, figure])
);

const FEATURED_FIGURES = figuresData.featured
  .map((name) => FIGURE_MAP.get(name))
  .filter((figure): figure is Figure => Boolean(figure));

const ADDITIONAL_FIGURES = figuresData.figures.filter(
  (figure) => !figuresData.featured.includes(figure.name)
);

const DEFAULT_FIGURE = FEATURED_FIGURES[0] ?? ADDITIONAL_FIGURES[0] ?? null;
const DEFAULT_SPECTRUM = DEFAULT_FIGURE
  ? spectrumFromArray(DEFAULT_FIGURE.spectrum)
  : getBaselineSpectrum();

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

export default function Home() {
  const [hasManualEdit, setHasManualEdit] = useState(false);
  const { userSpectrum, handleUpdate: baseHandleUpdate, loadSpectrum, resetSpectrum } = useSpectrumState(DEFAULT_SPECTRUM);

  const handleUpdate = useCallback((key: PolicyKey, value: number) => {
    baseHandleUpdate(key, value);
    setHasManualEdit(true);
  }, [baseHandleUpdate]);

  const [selectedFigureName, setSelectedFigureName] = useState<string>(DEFAULT_FIGURE?.name ?? "");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const selectedFigure = useMemo(() => {
    if (!selectedFigureName) return null;
    return FIGURE_MAP.get(selectedFigureName) ?? null;
  }, [selectedFigureName]);

  const handleSelectFigure = useCallback(
    (name: string) => {
      const figure = FIGURE_MAP.get(name);
      if (!figure) return;
      setSelectedFigureName(name);
      loadSpectrum(spectrumFromArray(figure.spectrum));
      setHasManualEdit(false);
    },
    [loadSpectrum]
  );

  const allFigures = useMemo(() => {
    return [...FEATURED_FIGURES, ...ADDITIONAL_FIGURES];
  }, []);

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
            {FEATURED_FIGURES.map((figure) => (
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
              {ADDITIONAL_FIGURES.map((figure) => (
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
      </main>
    </>
  );
}
