"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SquaresEmbedReact: () => SquaresEmbedReact,
  SquaresWidget: () => SquaresWidget
});
module.exports = __toCommonJS(index_exports);

// src/SquaresEmbedReact.tsx
var import_react2 = __toESM(require("react"));

// src/SquaresWidget.tsx
var import_react = __toESM(require("react"));
var COLORS = {
  bgPrimary: "#121113",
  bgSecondary: "#1A191B",
  surface: "rgba(24, 23, 25, 0.85)",
  textPrimary: "#ffffff",
  textSecondary: "#B8B8B9",
  textMuted: "#7A797B",
  accent: "#e5e5e5",
  accentText: "#121113",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.12)"
};
var POLICIES = [
  { key: "trade", label: "Trade", emoji: "\u{1F310}" },
  { key: "abortion", label: "Abortion", emoji: "\u{1F930}" },
  { key: "migration", label: "Migration", emoji: "\u{1F30D}" },
  { key: "economics", label: "Economics", emoji: "\u{1F4B0}" },
  { key: "rights", label: "Rights", emoji: "\u{1F3F3}\uFE0F\u200D\u{1F308}" }
];
var COLOR_RAMP = [
  "#7e568e",
  // Purple (Trade)
  "#1f6adb",
  // Blue (Abortion)
  "#398a34",
  // Green
  "#eab308",
  // Yellow/Orange (Economics)
  "#e67e22",
  // Orange
  "#c0392b",
  // Red (Migration)
  "#383b3d"
  // Dark slate
];
var POSITION_LABELS = {
  trade: [
    "free trade",
    "minimal tariffs",
    "selective trade agreements",
    "balanced tariffs",
    "strategic protections",
    "heavy tariffs",
    "closed economy"
  ],
  abortion: [
    "no gestational limit",
    "limit after second trimester",
    "limit after viability",
    "limit after 15 weeks",
    "limit after first trimester",
    "limit after heartbeat detection",
    "total ban"
  ],
  migration: [
    "open borders",
    "easy pathways to citizenship",
    "expanded quotas",
    "current restrictions",
    "reduced quotas",
    "strict limits only",
    "no immigration"
  ],
  economics: [
    "pure free market",
    "minimal regulation",
    "market-based with safety net",
    "balanced public-private",
    "strong social programs",
    "extensive public ownership",
    "full state control"
  ],
  rights: [
    "full legal equality",
    "protections with few limits",
    "protections with some limits",
    "tolerance without endorsement",
    "traditional definitions only",
    "no legal recognition",
    "criminalization"
  ]
};
function ColorSquare({ value, size = "48px", showBorder = true }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { style: {
    width: size,
    height: size,
    borderRadius: size === "48px" ? "10px" : size === "32px" ? "8px" : "12px",
    backgroundColor: COLOR_RAMP[value],
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
    border: showBorder ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
    flexShrink: 0
  } });
}
function SquaresWidget({
  onClose,
  primaryColor = "#57534e",
  initialSpectrum,
  initialStep = 0
}) {
  const [step, setStep] = (0, import_react.useState)(initialStep);
  const [spectrum, setSpectrum] = (0, import_react.useState)(initialSpectrum || {
    trade: 3,
    abortion: 3,
    migration: 3,
    economics: 3,
    rights: 3
  });
  const [copied, setCopied] = (0, import_react.useState)(false);
  const [currentDimension, setCurrentDimension] = (0, import_react.useState)(0);
  const [selectedSpectrumDimension, setSelectedSpectrumDimension] = (0, import_react.useState)(0);
  const getEmojiSquare = (value) => {
    const emojis = ["\u{1F7EA}", "\u{1F7E6}", "\u{1F7E9}", "\u{1F7E8}", "\u{1F7E7}", "\u{1F7E5}", "\u2B1B\uFE0F"];
    return emojis[value] || "\u{1F7E8}";
  };
  const getSignatureText = () => {
    const letters = ["T", "A", "M", "E", "R"];
    return POLICIES.map((p, i) => `${letters[i]}${spectrum[p.key]}`).join(" ");
  };
  const getEmojiText = () => {
    return POLICIES.map((p) => getEmojiSquare(spectrum[p.key])).join("");
  };
  const handleCopy = (0, import_react.useCallback)(async () => {
    try {
      await navigator.clipboard.writeText(getEmojiText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [spectrum]);
  const renderStep = () => {
    switch (step) {
      case 0:
        return /* @__PURE__ */ import_react.default.createElement("div", { style: { minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" } }, /* @__PURE__ */ import_react.default.createElement("h2", { style: { margin: "0 0 3rem 0", color: COLORS.textPrimary, fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, lineHeight: 1.2, textAlign: "center" } }, "You're not one word.", /* @__PURE__ */ import_react.default.createElement("br", null), "You're many dimensions."), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "1rem", margin: "2rem 0", flexWrap: "wrap" } }, POLICIES.map((policy, index) => {
          const letters = ["T", "A", "M", "E", "R"];
          const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
          return /* @__PURE__ */ import_react.default.createElement("div", { key: policy.key, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "80px", height: "80px", borderRadius: "12px", backgroundColor: colors[index], display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)" } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "2.5rem", color: "white", fontWeight: 900 } }, letters[index])), /* @__PURE__ */ import_react.default.createElement("span", { style: { color: COLORS.textPrimary, fontSize: "0.875rem", fontWeight: 600 } }, policy.label.split(" ")[0]));
        })), /* @__PURE__ */ import_react.default.createElement("p", { style: { fontSize: "1rem", color: COLORS.textSecondary, textAlign: "center", marginTop: "2rem", lineHeight: 1.6 } }, "TAME-R measures where you stand on five", /* @__PURE__ */ import_react.default.createElement("br", null), "independent policy dimensions."));
      case 1: {
        const selectedPolicy = POLICIES[selectedSpectrumDimension];
        const letters = ["T", "A", "M", "E", "R"];
        const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
        return /* @__PURE__ */ import_react.default.createElement("div", { style: { minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" } }, /* @__PURE__ */ import_react.default.createElement("h2", { style: { margin: "0 0 2rem 0", color: COLORS.textPrimary, fontSize: "clamp(2rem, 5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.2, textAlign: "center" } }, "Each dimension uses a", /* @__PURE__ */ import_react.default.createElement("br", null), "7-color spectrum"), /* @__PURE__ */ import_react.default.createElement("div", { style: { margin: "1.5rem 0" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", gap: "0.5rem", marginBottom: "1rem", justifyContent: "center" } }, COLOR_RAMP.map((color, i) => /* @__PURE__ */ import_react.default.createElement(ColorSquare, { key: i, value: i, size: "48px" }))), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.25rem", marginBottom: "1.5rem", maxWidth: "480px", margin: "0 auto 1.5rem" } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.75rem", color: COLORS.textSecondary, fontWeight: 600 } }, "Minimal intervention"), /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "1rem", color: COLORS.textMuted } }, "\u2192"), /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.75rem", color: COLORS.textSecondary, fontWeight: 600 } }, "Total control"))), /* @__PURE__ */ import_react.default.createElement("p", { style: { fontSize: "0.9375rem", color: COLORS.textSecondary, textAlign: "center", marginBottom: "1rem" } }, "See what the scale means for each dimension:"), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" } }, POLICIES.map((policy, index) => /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            key: policy.key,
            onClick: () => setSelectedSpectrumDimension(index),
            style: {
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.375rem",
              padding: "0.75rem 1rem",
              background: selectedSpectrumDimension === index ? "rgba(255, 255, 255, 0.08)" : "rgba(30, 30, 30, 0.8)",
              border: selectedSpectrumDimension === index ? "1px solid rgba(255, 255, 255, 0.3)" : "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              minWidth: "80px",
              boxShadow: selectedSpectrumDimension === index ? "0 4px 16px rgba(255, 255, 255, 0.15)" : "none",
              color: COLORS.textPrimary,
              WebkitTapHighlightColor: "transparent",
              fontFamily: "inherit"
            }
          },
          /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "40px", height: "40px", borderRadius: "8px", backgroundColor: "#333333", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.15)" } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "1.25rem", color: COLORS.accent, fontWeight: 900 } }, letters[index])),
          /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.75rem", color: COLORS.textPrimary, fontWeight: 600 } }, policy.label.split(" ")[0])
        ))), /* @__PURE__ */ import_react.default.createElement("div", { style: { background: "rgba(30, 30, 30, 0.8)", borderRadius: "12px", padding: "1.5rem", border: "1px solid rgba(255, 255, 255, 0.1)" } }, /* @__PURE__ */ import_react.default.createElement("h3", { style: { margin: "0 0 1rem 0", fontSize: "1.125rem", color: COLORS.textPrimary, fontWeight: 600, textAlign: "center" } }, selectedPolicy.label), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.75rem" } }, POSITION_LABELS[selectedPolicy.key].map((label, index) => /* @__PURE__ */ import_react.default.createElement("div", { key: index, style: { display: "flex", alignItems: "center", gap: "1rem" } }, /* @__PURE__ */ import_react.default.createElement(ColorSquare, { value: index, size: "32px" }), /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.875rem", color: COLORS.textPrimary, flex: 1 } }, label))))));
      }
      case 2: {
        const policy = POLICIES[currentDimension];
        const letters = ["T", "A", "M", "E", "R"];
        const colors = [COLOR_RAMP[0], COLOR_RAMP[1], COLOR_RAMP[6], COLOR_RAMP[4], COLOR_RAMP[2]];
        const isLastDimension = currentDimension === POLICIES.length - 1;
        return /* @__PURE__ */ import_react.default.createElement("div", { style: { minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { textAlign: "center", marginBottom: "2rem" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "0.875rem", color: COLORS.textSecondary, fontWeight: 600, marginBottom: "0.75rem", letterSpacing: "0.1em" } }, currentDimension + 1, " OF ", POLICIES.length), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "0.5rem", marginBottom: "2rem" } }, POLICIES.map((_, i) => /* @__PURE__ */ import_react.default.createElement(
          "div",
          {
            key: i,
            style: {
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: i === currentDimension ? "#737373" : "#404040",
              transition: "background-color 0.2s"
            }
          }
        ))), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "inline-block", marginBottom: "1rem" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "80px", height: "80px", borderRadius: "16px", backgroundColor: "#333333", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.15)" } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "3rem", color: COLORS.accent, fontWeight: 900 } }, letters[currentDimension]))), /* @__PURE__ */ import_react.default.createElement("h2", { style: { margin: "0 0 1rem 0", color: COLORS.textPrimary, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800 } }, policy.label), /* @__PURE__ */ import_react.default.createElement("p", { style: { fontSize: "1rem", color: COLORS.textSecondary, marginBottom: "2rem" } }, "Where do you stand on government intervention?")), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", marginBottom: "2rem" } }, POSITION_LABELS[policy.key].map((label, valueIndex) => {
          const isSelected = spectrum[policy.key] === valueIndex;
          const isCenter = valueIndex === 3;
          return /* @__PURE__ */ import_react.default.createElement(
            "button",
            {
              key: valueIndex,
              onClick: () => setSpectrum((prev) => ({ ...prev, [policy.key]: valueIndex })),
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.625rem",
                padding: "0.875rem 0.5rem",
                background: isSelected ? "rgba(255, 255, 255, 0.05)" : "transparent",
                border: isSelected ? "2px solid rgba(255, 255, 255, 0.4)" : isCenter ? "1px dashed rgba(255, 255, 255, 0.2)" : "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "none"
              }
            },
            /* @__PURE__ */ import_react.default.createElement(ColorSquare, { value: valueIndex, size: "60px" }),
            /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.75rem", color: COLORS.textPrimary, textAlign: "center", lineHeight: 1.3, fontWeight: 400 } }, label)
          );
        })), /* @__PURE__ */ import_react.default.createElement("div", { style: { textAlign: "center", marginTop: "1.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: COLORS.textSecondary, fontWeight: 500 } }, /* @__PURE__ */ import_react.default.createElement("span", null, "Minimal intervention"), /* @__PURE__ */ import_react.default.createElement("span", { style: { margin: "0 0.75rem" } }, "\u2192"), /* @__PURE__ */ import_react.default.createElement("span", null, "Total control")), /* @__PURE__ */ import_react.default.createElement("div", { style: { textAlign: "center", marginTop: "1.5rem" } }, !isLastDimension ? /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: () => setCurrentDimension(currentDimension + 1),
            style: {
              padding: "1rem 2rem",
              background: "#e5e5e5",
              color: COLORS.accentText,
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.2)"
            },
            onMouseOver: (e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 255, 255, 0.3)";
            },
            onMouseOut: (e) => {
              e.currentTarget.style.background = "#e5e5e5";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 255, 255, 0.2)";
            }
          },
          "Next Dimension \u2192"
        ) : /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: () => setStep(3),
            style: {
              padding: "1rem 2rem",
              background: "#e5e5e5",
              color: COLORS.accentText,
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.2)"
            },
            onMouseOver: (e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 255, 255, 0.3)";
            },
            onMouseOut: (e) => {
              e.currentTarget.style.background = "#e5e5e5";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 255, 255, 0.2)";
            }
          },
          "See Your Results \u2192"
        )));
      }
      case 3:
        return /* @__PURE__ */ import_react.default.createElement("div", { style: { minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" } }, /* @__PURE__ */ import_react.default.createElement("h2", { style: { margin: "0 0 3rem 0", color: COLORS.textPrimary, fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, lineHeight: 1.2, textAlign: "center" } }, "Your Political Spectrum"), /* @__PURE__ */ import_react.default.createElement("div", { style: { textAlign: "center", margin: "2rem 0", padding: "2.5rem 2rem", background: "rgba(30, 30, 30, 0.8)", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.1)" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "clamp(0.5rem, 1.5vw, 1rem)", flexWrap: "wrap", marginBottom: "1.5rem" } }, POLICIES.map((policy, i) => /* @__PURE__ */ import_react.default.createElement("div", { key: policy.key, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" } }, /* @__PURE__ */ import_react.default.createElement(ColorSquare, { value: spectrum[policy.key], size: "64px" }), /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.75rem", color: COLORS.textSecondary, fontWeight: 600, letterSpacing: "0.02em" } }, ["T", "A", "M", "E", "R"][i])))), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "clamp(0.5rem, 1.5vw, 1rem)", flexWrap: "wrap", paddingTop: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)" } }, POLICIES.map((policy) => /* @__PURE__ */ import_react.default.createElement("span", { key: policy.key, style: { fontSize: "0.6875rem", color: COLORS.textMuted, fontWeight: 500, textTransform: "lowercase" } }, policy.label))), /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "2rem", marginTop: "1.5rem", paddingTop: "1.5rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)", display: "flex", justifyContent: "center", gap: "0.125rem" } }, POLICIES.map((policy) => /* @__PURE__ */ import_react.default.createElement("span", { key: policy.key }, getEmojiSquare(spectrum[policy.key]))))), /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: handleCopy,
            style: {
              padding: "1.125rem 2rem",
              background: "#e5e5e5",
              color: COLORS.accentText,
              border: "none",
              borderRadius: "12px",
              fontSize: "1.0625rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%",
              marginBottom: "1rem",
              boxShadow: "0 4px 12px rgba(255, 255, 255, 0.2)"
            },
            onMouseOver: (e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 255, 255, 0.3)";
            },
            onMouseOut: (e) => {
              e.currentTarget.style.background = "#e5e5e5";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 255, 255, 0.2)";
            }
          },
          copied ? "\u2713 Copied!" : "Copy Spectrum as Emojis"
        ), /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: () => window.open("https://squares.vote", "_blank", "noopener,noreferrer"),
            style: {
              padding: "1.125rem 2rem",
              background: "transparent",
              color: COLORS.accent,
              border: "2px solid #525252",
              borderRadius: "12px",
              fontSize: "1.0625rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%",
              marginBottom: "1rem"
            },
            onMouseOver: (e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "#737373";
              e.currentTarget.style.transform = "translateY(-2px)";
            },
            onMouseOut: (e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.borderColor = "#525252";
              e.currentTarget.style.transform = "translateY(0)";
            }
          },
          "Take the Full Assessment \u2192"
        ), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "1.5rem", marginTop: "0.5rem" } }, /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: () => {
              setStep(0);
              setCurrentDimension(0);
              setSpectrum({
                trade: 3,
                abortion: 3,
                migration: 3,
                economics: 3,
                rights: 3
              });
            },
            style: {
              background: "none",
              border: "none",
              color: COLORS.textSecondary,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              padding: "0.5rem 1rem",
              transition: "all 0.2s",
              textDecoration: "underline",
              textUnderlineOffset: "2px"
            },
            onMouseOver: (e) => {
              e.currentTarget.style.color = "#ffffff";
            },
            onMouseOut: (e) => {
              e.currentTarget.style.color = "#a3a3a3";
            }
          },
          "Start Over"
        ), /* @__PURE__ */ import_react.default.createElement("span", { style: { color: "#525252" } }, "\u2022"), /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: () => onClose(spectrum),
            style: {
              background: "none",
              border: "none",
              color: COLORS.textSecondary,
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
              padding: "0.5rem 1rem",
              transition: "all 0.2s",
              textDecoration: "underline",
              textUnderlineOffset: "2px"
            },
            onMouseOver: (e) => {
              e.currentTarget.style.color = "#ffffff";
            },
            onMouseOut: (e) => {
              e.currentTarget.style.color = "#a3a3a3";
            }
          },
          "Close"
        )));
      default:
        return null;
    }
  };
  return /* @__PURE__ */ import_react.default.createElement(
    "div",
    {
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1e4,
        animation: "fadeIn 0.3s ease-out"
      },
      onClick: () => onClose()
    },
    /* @__PURE__ */ import_react.default.createElement("style", null, `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        button {
          -webkit-tap-highlight-color: transparent;
          -webkit-appearance: none;
          appearance: none;
          font-family: inherit;
        }
        button, button * {
          color: inherit;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid ${primaryColor};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid ${primaryColor};
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
        }
      `),
    /* @__PURE__ */ import_react.default.createElement(
      "div",
      {
        style: {
          background: "#212121",
          borderRadius: "20px",
          maxWidth: "640px",
          width: "92%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
          animation: "slideUp 0.3s ease-out",
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          border: "1px solid rgba(255, 255, 255, 0.1)"
        },
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          onClick: () => onClose(),
          style: {
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "transparent",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: COLORS.textMuted,
            lineHeight: "1",
            padding: 0,
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s",
            fontFamily: "system-ui, -apple-system, sans-serif",
            fontWeight: 300
          },
          onMouseOver: (e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "#e5e5e5";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
          },
          onMouseOut: (e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#737373";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
          }
        },
        "\xD7"
      ),
      /* @__PURE__ */ import_react.default.createElement("div", { style: { marginBottom: "2.5rem" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", gap: "0.625rem", justifyContent: "center", marginBottom: step === 2 ? "1rem" : "0" } }, [0, 1, 2, 3].map((i) => /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          key: i,
          style: {
            width: i === step ? "32px" : "10px",
            height: "10px",
            borderRadius: "6px",
            background: i === step ? "#e5e5e5" : i < step ? "rgba(229, 229, 229, 0.3)" : "rgba(115, 115, 115, 0.3)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: i === step ? "scale(1)" : "scale(0.9)"
          }
        }
      ))), step === 2 && /* @__PURE__ */ import_react.default.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "0.8125rem", color: COLORS.textSecondary, fontWeight: 600, marginBottom: "0.5rem" } }, "Dimension ", currentDimension + 1, " of ", POLICIES.length), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", gap: "0.375rem", justifyContent: "center" } }, POLICIES.map((_, i) => /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          key: i,
          style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: i <= currentDimension ? "#e5e5e5" : "rgba(115, 115, 115, 0.3)",
            transition: "all 0.3s"
          }
        }
      ))))),
      renderStep(),
      step !== 2 && step !== 3 && /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)" } }, step > 0 && /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          onClick: () => setStep(step - 1),
          style: {
            padding: "0.875rem 1.75rem",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            background: "transparent",
            color: COLORS.accent
          },
          onMouseOver: (e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.transform = "translateY(-1px)";
          },
          onMouseOut: (e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.transform = "translateY(0)";
          }
        },
        "\u2190 Back"
      ), /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          onClick: () => setStep(step + 1),
          style: {
            padding: "0.875rem 1.75rem",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            background: "#e5e5e5",
            color: COLORS.accentText,
            marginLeft: "auto",
            boxShadow: "0 4px 12px rgba(255, 255, 255, 0.2)"
          },
          onMouseOver: (e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 255, 255, 0.3)";
          },
          onMouseOut: (e) => {
            e.currentTarget.style.background = "#e5e5e5";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 255, 255, 0.2)";
          }
        },
        "Continue \u2192"
      )),
      step === 2 && currentDimension > 0 && /* @__PURE__ */ import_react.default.createElement("div", { style: { marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(255, 255, 255, 0.1)", textAlign: "center" } }, /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          onClick: () => setCurrentDimension(currentDimension - 1),
          style: {
            padding: "0.75rem 1.5rem",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "12px",
            fontSize: "0.9375rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            background: "transparent",
            color: COLORS.textSecondary
          },
          onMouseOver: (e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            e.currentTarget.style.color = "#ffffff";
          },
          onMouseOut: (e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
            e.currentTarget.style.color = "#a3a3a3";
          }
        },
        "\u2190 Previous dimension"
      ))
    )
  );
}

// src/SquaresEmbedReact.tsx
var COLORS2 = {
  bgPrimary: "#121113",
  bgSecondary: "#1A191B",
  textPrimary: "#ffffff",
  textSecondary: "#B8B8B9",
  textMuted: "#7A797B",
  accent: "#e5e5e5",
  accentText: "#121113",
  border: "rgba(255, 255, 255, 0.08)"
};
var COLOR_RAMP2 = [
  "#7e568e",
  // Purple
  "#1f6adb",
  // Blue
  "#398a34",
  // Green
  "#eab308",
  // Yellow
  "#e67e22",
  // Orange
  "#c0392b",
  // Red
  "#383b3d"
  // Dark slate
];
function ColorSquare2({ value, size = 48 }) {
  return /* @__PURE__ */ import_react2.default.createElement("div", { style: {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "8px",
    backgroundColor: COLOR_RAMP2[value],
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    flexShrink: 0
  } });
}
function SquaresEmbedReact({
  variant = "card",
  buttonText = "Map Your Squares",
  align = "center",
  maxWidth,
  primaryColor = "#57534e",
  borderRadius = "16px",
  shadow = true
}) {
  const [showWidget, setShowWidget] = (0, import_react2.useState)(false);
  const handleClick = () => {
    setShowWidget(true);
  };
  const containerStyle = {
    width: "100%",
    position: "relative",
    ...align === "left" && { marginLeft: 0, marginRight: "auto" },
    ...align === "right" && { marginLeft: "auto", marginRight: 0 },
    ...align === "center" && { marginLeft: "auto", marginRight: "auto" },
    ...maxWidth && { maxWidth }
  };
  if (variant === "button") {
    return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { style: containerStyle }, /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        onClick: handleClick,
        style: {
          backgroundColor: primaryColor,
          color: "white",
          border: "none",
          padding: "clamp(12px, 2.5vw, 16px) clamp(20px, 4vw, 32px)",
          fontSize: "clamp(0.9375rem, 2vw, 1.0625rem)",
          fontWeight: 600,
          borderRadius,
          cursor: "pointer",
          boxShadow: shadow ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
          transition: "all 0.2s ease",
          width: "100%",
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        },
        onMouseOver: (e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = shadow ? "0 4px 12px rgba(0, 0, 0, 0.12)" : "none";
        },
        onMouseOut: (e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = shadow ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none";
        }
      },
      buttonText
    )), showWidget && /* @__PURE__ */ import_react2.default.createElement(SquaresWidget, { onClose: () => setShowWidget(false), primaryColor }));
  }
  return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { style: containerStyle }, /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      style: {
        background: COLORS2.bgPrimary,
        border: `1px solid ${COLORS2.border}`,
        borderRadius,
        padding: "clamp(20px, 4vw, 32px)",
        boxShadow: shadow ? "0 4px 12px rgba(0, 0, 0, 0.4)" : "none",
        fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }
    },
    /* @__PURE__ */ import_react2.default.createElement("div", { style: { marginBottom: "24px" } }, /* @__PURE__ */ import_react2.default.createElement("h3", { style: { margin: "0 0 12px 0", fontSize: "clamp(1.375rem, 3vw, 1.75rem)", fontWeight: 700, color: COLORS2.textPrimary, lineHeight: 1.2 } }, "Map Your Political Positions"), /* @__PURE__ */ import_react2.default.createElement("p", { style: { margin: 0, fontSize: "clamp(0.9375rem, 2vw, 1rem)", color: COLORS2.textSecondary, lineHeight: "1.5" } }, "Use the TAME-R framework to visualize where you stand on 5 key policy dimensions")),
    /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        style: {
          background: COLORS2.bgSecondary,
          border: `1px solid ${COLORS2.border}`,
          borderRadius: "12px",
          padding: "clamp(16px, 3vw, 20px)",
          marginBottom: "24px"
        }
      },
      /* @__PURE__ */ import_react2.default.createElement("div", { style: { marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" } }, /* @__PURE__ */ import_react2.default.createElement("span", { style: { fontSize: "0.8125rem", fontWeight: 600, color: COLORS2.textMuted, textTransform: "uppercase", letterSpacing: "0.05em" } }, "EXAMPLE:"), /* @__PURE__ */ import_react2.default.createElement("span", { style: { fontSize: "clamp(0.9375rem, 2vw, 1rem)", fontWeight: 600, color: COLORS2.textPrimary } }, "Martin Luther King Jr.")),
      /* @__PURE__ */ import_react2.default.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ import_react2.default.createElement("div", { style: { marginBottom: "12px", display: "flex", justifyContent: "center", gap: "clamp(6px, 1.5vw, 12px)" } }, /* @__PURE__ */ import_react2.default.createElement(ColorSquare2, { value: 2, size: 48 }), /* @__PURE__ */ import_react2.default.createElement(ColorSquare2, { value: 1, size: 48 }), /* @__PURE__ */ import_react2.default.createElement(ColorSquare2, { value: 2, size: 48 }), /* @__PURE__ */ import_react2.default.createElement(ColorSquare2, { value: 4, size: 48 }), /* @__PURE__ */ import_react2.default.createElement(ColorSquare2, { value: 0, size: 48 })), /* @__PURE__ */ import_react2.default.createElement("div", { style: { fontSize: "0.6875rem", color: COLORS2.textSecondary, display: "flex", justifyContent: "center", gap: "clamp(8px, 2vw, 16px)", flexWrap: "wrap", fontWeight: 500 } }, /* @__PURE__ */ import_react2.default.createElement("span", null, "Trade"), /* @__PURE__ */ import_react2.default.createElement("span", null, "Abortion"), /* @__PURE__ */ import_react2.default.createElement("span", null, "Migration"), /* @__PURE__ */ import_react2.default.createElement("span", null, "Economics"), /* @__PURE__ */ import_react2.default.createElement("span", null, "Rights")))
    ),
    /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        onClick: handleClick,
        style: {
          backgroundColor: COLORS2.accent,
          color: COLORS2.accentText,
          border: "none",
          padding: "clamp(12px, 2.5vw, 16px) clamp(20px, 4vw, 32px)",
          fontSize: "clamp(0.9375rem, 2vw, 1.0625rem)",
          fontWeight: 600,
          borderRadius: "12px",
          cursor: "pointer",
          width: "100%",
          marginBottom: "16px",
          transition: "all 0.2s ease",
          boxShadow: "0 4px 12px rgba(255, 255, 255, 0.2)"
        },
        onMouseOver: (e) => {
          e.currentTarget.style.backgroundColor = "#ffffff";
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 6px 16px rgba(255, 255, 255, 0.3)";
        },
        onMouseOut: (e) => {
          e.currentTarget.style.backgroundColor = COLORS2.accent;
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 255, 255, 0.2)";
        }
      },
      buttonText
    ),
    /* @__PURE__ */ import_react2.default.createElement("p", { style: { margin: 0, fontSize: "0.8125rem", color: COLORS2.textMuted, textAlign: "center", lineHeight: 1.5 } }, "Takes less than 2 minutes \xB7 Free & open source")
  )), showWidget && /* @__PURE__ */ import_react2.default.createElement(SquaresWidget, { onClose: () => setShowWidget(false), primaryColor }));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SquaresEmbedReact,
  SquaresWidget
});
