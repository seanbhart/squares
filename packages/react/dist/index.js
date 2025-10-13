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
var POLICIES = [
  { key: "trade", label: "Trade", emoji: "\u{1F310}" },
  { key: "abortion", label: "Abortion", emoji: "\u{1F930}" },
  { key: "migration", label: "Migration", emoji: "\u{1F30D}" },
  { key: "economics", label: "Economics", emoji: "\u{1F4B0}" },
  { key: "rights", label: "Rights", emoji: "\u{1F3F3}\uFE0F\u200D\u{1F308}" }
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
    "partial birth abortion",
    "limit after viability",
    "limit after third trimester",
    "limit after second trimester",
    "limit after first trimester",
    "limit after heartbeat detection",
    "no exceptions allowed"
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
function getEmojiSquare(value) {
  const emojis = ["\u{1F7EA}", "\u{1F7E6}", "\u{1F7E9}", "\u{1F7E8}", "\u{1F7E7}", "\u{1F7E5}", "\u2B1B\uFE0F"];
  return emojis[value] || "\u{1F7E8}";
}
function SquaresWidget({ onClose, primaryColor = "#57534e" }) {
  const [step, setStep] = (0, import_react.useState)(0);
  const [spectrum, setSpectrum] = (0, import_react.useState)({
    trade: 3,
    abortion: 3,
    migration: 3,
    economics: 3,
    rights: 3
  });
  const [copied, setCopied] = (0, import_react.useState)(false);
  const [currentDimension, setCurrentDimension] = (0, import_react.useState)(0);
  const [selectedSpectrumDimension, setSelectedSpectrumDimension] = (0, import_react.useState)(0);
  const emojiSignature = POLICIES.map((p) => getEmojiSquare(spectrum[p.key])).join("");
  const handleCopy = (0, import_react.useCallback)(async () => {
    try {
      await navigator.clipboard.writeText(emojiSignature);
      setCopied(true);
      setTimeout(() => setCopied(false), 2e3);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }, [emojiSignature]);
  const renderStep = () => {
    switch (step) {
      case 0:
        return /* @__PURE__ */ import_react.default.createElement("div", { style: { minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" } }, /* @__PURE__ */ import_react.default.createElement("h2", { style: { margin: "0 0 3rem 0", color: "#292524", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, lineHeight: 1.2, textAlign: "center" } }, "You're not one word.", /* @__PURE__ */ import_react.default.createElement("br", null), "You're many dimensions."), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "1rem", margin: "2rem 0", flexWrap: "wrap" } }, POLICIES.map((policy, index) => {
          const letters = ["T", "A", "M", "E", "R"];
          const colors = ["#9b59b6", "#3498db", "#e74c3c", "#f39c12", "#2ecc71"];
          return /* @__PURE__ */ import_react.default.createElement("div", { key: policy.key, style: { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "80px", height: "80px", borderRadius: "12px", backgroundColor: colors[index], display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "2.5rem", color: "white", fontWeight: 900 } }, letters[index])), /* @__PURE__ */ import_react.default.createElement("span", { style: { color: "#292524", fontSize: "0.875rem", fontWeight: 600 } }, policy.label.split(" ")[0]));
        })), /* @__PURE__ */ import_react.default.createElement("p", { style: { fontSize: "1rem", color: "#78716c", textAlign: "center", marginTop: "2rem", lineHeight: 1.6 } }, "TAME-R measures where you stand on five", /* @__PURE__ */ import_react.default.createElement("br", null), "independent policy dimensions."));
      case 1: {
        const selectedPolicy = POLICIES[selectedSpectrumDimension];
        const letters = ["T", "A", "M", "E", "R"];
        const colors = ["#9b59b6", "#3498db", "#e74c3c", "#f39c12", "#2ecc71"];
        return /* @__PURE__ */ import_react.default.createElement("div", { style: { minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" } }, /* @__PURE__ */ import_react.default.createElement("h2", { style: { margin: "0 0 2rem 0", color: "#292524", fontSize: "clamp(2rem, 5vw, 2.5rem)", fontWeight: 700, lineHeight: 1.2, textAlign: "center" } }, "Each dimension uses a", /* @__PURE__ */ import_react.default.createElement("br", null), "7-color spectrum"), /* @__PURE__ */ import_react.default.createElement("div", { style: { margin: "1.5rem 0" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", gap: "4px", marginBottom: "1rem", justifyContent: "center" } }, ["\u{1F7EA}", "\u{1F7E6}", "\u{1F7E9}", "\u{1F7E8}", "\u{1F7E7}", "\u{1F7E5}", "\u2B1B\uFE0F"].map((emoji, i) => /* @__PURE__ */ import_react.default.createElement("div", { key: i, style: { width: "48px", height: "48px", fontSize: "2.5rem", display: "flex", alignItems: "center", justifyContent: "center" } }, emoji))), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.875rem", color: "#78716c", fontWeight: 600 } }, "Minimal intervention"), /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "1.25rem", color: "#a8a29e" } }, "\u2192"), /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.875rem", color: "#78716c", fontWeight: 600 } }, "Total control"))), /* @__PURE__ */ import_react.default.createElement("p", { style: { fontSize: "0.9375rem", color: "#78716c", textAlign: "center", marginBottom: "1rem" } }, "See what the scale means for each dimension:"), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" } }, POLICIES.map((policy, index) => /* @__PURE__ */ import_react.default.createElement(
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
              background: selectedSpectrumDimension === index ? "rgba(52, 152, 219, 0.1)" : "rgba(249, 250, 251, 0.6)",
              border: selectedSpectrumDimension === index ? "2px solid #3498db" : "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.2s",
              minWidth: "80px"
            }
          },
          /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "40px", height: "40px", borderRadius: "8px", backgroundColor: colors[index], display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "1.25rem", color: "white", fontWeight: 900 } }, letters[index])),
          /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.75rem", color: "#292524", fontWeight: 600 } }, policy.label.split(" ")[0])
        ))), /* @__PURE__ */ import_react.default.createElement("div", { style: { background: "rgba(249, 250, 251, 0.6)", borderRadius: "12px", padding: "1.5rem", border: "1px solid rgba(0, 0, 0, 0.06)" } }, /* @__PURE__ */ import_react.default.createElement("h3", { style: { margin: "0 0 1rem 0", fontSize: "1.125rem", color: "#292524", fontWeight: 600, textAlign: "center" } }, selectedPolicy.label), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "0.5rem" } }, POSITION_LABELS[selectedPolicy.key].map((label, index) => /* @__PURE__ */ import_react.default.createElement("div", { key: index, style: { display: "flex", alignItems: "center", gap: "1rem" } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "1.5rem" } }, getEmojiSquare(index)), /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.875rem", color: "#292524", flex: 1 } }, label))))));
      }
      case 2: {
        const policy = POLICIES[currentDimension];
        const letters = ["T", "A", "M", "E", "R"];
        const isLastDimension = currentDimension === POLICIES.length - 1;
        return /* @__PURE__ */ import_react.default.createElement("div", { style: { minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { textAlign: "center", marginBottom: "2rem" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "inline-block", marginBottom: "1rem" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { width: "80px", height: "80px", borderRadius: "16px", backgroundColor: "#f0ad4e", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(240, 173, 78, 0.3)" } }, /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "3rem", color: "white", fontWeight: 900 } }, letters[currentDimension]))), /* @__PURE__ */ import_react.default.createElement("h2", { style: { margin: "0 0 1rem 0", color: "#292524", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 800 } }, policy.label), /* @__PURE__ */ import_react.default.createElement("p", { style: { fontSize: "1rem", color: "#78716c", marginBottom: "2rem" } }, "Where do you stand on government intervention?")), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "0.75rem", marginBottom: "2rem" } }, POSITION_LABELS[policy.key].map((label, valueIndex) => {
          const isSelected = spectrum[policy.key] === valueIndex;
          return /* @__PURE__ */ import_react.default.createElement(
            "button",
            {
              key: valueIndex,
              onClick: () => setSpectrum((prev) => ({ ...prev, [policy.key]: valueIndex })),
              style: {
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.75rem",
                padding: "1rem 0.75rem",
                background: isSelected ? "rgba(52, 152, 219, 0.15)" : "rgba(249, 250, 251, 0.6)",
                border: isSelected ? "2px solid #3498db" : "1px solid rgba(0, 0, 0, 0.06)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: isSelected ? "0 4px 16px rgba(52, 152, 219, 0.3)" : "none"
              }
            },
            /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "2rem" } }, getEmojiSquare(valueIndex)),
            /* @__PURE__ */ import_react.default.createElement("span", { style: { fontSize: "0.8125rem", color: "#292524", textAlign: "center", lineHeight: 1.3, fontWeight: 500 } }, label)
          );
        })), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#a8a29e", marginBottom: "1.5rem", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" } }, /* @__PURE__ */ import_react.default.createElement("span", null, "Minimal intervention"), /* @__PURE__ */ import_react.default.createElement("span", null, "Total control")), /* @__PURE__ */ import_react.default.createElement("div", { style: { textAlign: "center" } }, !isLastDimension ? /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: () => setCurrentDimension(currentDimension + 1),
            style: {
              padding: "1rem 2rem",
              background: primaryColor,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
            }
          },
          "Next Dimension \u2192"
        ) : /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: () => setStep(3),
            style: {
              padding: "1rem 2rem",
              background: primaryColor,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
            }
          },
          "See Your Results \u2192"
        )));
      }
      case 3:
        return /* @__PURE__ */ import_react.default.createElement("div", { style: { minHeight: "400px", display: "flex", flexDirection: "column", justifyContent: "center" } }, /* @__PURE__ */ import_react.default.createElement("h2", { style: { margin: "0 0 3rem 0", color: "#292524", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 700, lineHeight: 1.2, textAlign: "center" } }, "Your Political Signature"), /* @__PURE__ */ import_react.default.createElement("div", { style: { textAlign: "center", margin: "2rem 0", padding: "2.5rem 2rem", background: "rgba(249, 250, 251, 0.6)", borderRadius: "16px", border: "1px solid rgba(0, 0, 0, 0.06)" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "clamp(3rem, 10vw, 4rem)", letterSpacing: "clamp(0.4rem, 1.5vw, 0.8rem)", marginBottom: "2rem", wordBreak: "break-all", lineHeight: "1.4" } }, emojiSignature), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "clamp(1rem, 4vw, 2.5rem)", flexWrap: "wrap", marginBottom: "0.5rem" } }, ["T", "A", "M", "E", "R"].map((letter, i) => /* @__PURE__ */ import_react.default.createElement("span", { key: letter, style: { fontSize: "0.875rem", color: "#78716c", fontWeight: 600, letterSpacing: "0.02em" } }, letter)))), /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: handleCopy,
            style: {
              padding: "1.125rem 2rem",
              background: primaryColor,
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1.0625rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%",
              marginBottom: "1rem",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
            },
            onMouseOver: (e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
            },
            onMouseOut: (e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.08)";
            }
          },
          copied ? "\u2713 Copied!" : "Copy to Clipboard"
        ), /* @__PURE__ */ import_react.default.createElement(
          "button",
          {
            onClick: () => window.open("https://squares.vote", "_blank", "noopener,noreferrer"),
            style: {
              padding: "1.125rem 2rem",
              background: "transparent",
              color: primaryColor,
              border: `2px solid ${primaryColor}`,
              borderRadius: "12px",
              fontSize: "1.0625rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%"
            },
            onMouseOver: (e) => {
              e.currentTarget.style.background = primaryColor;
              e.currentTarget.style.color = "white";
              e.currentTarget.style.transform = "translateY(-2px)";
            },
            onMouseOut: (e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = primaryColor;
              e.currentTarget.style.transform = "translateY(0)";
            }
          },
          "Take the Full Assessment \u2192"
        ));
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
      onClick: onClose
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
          background: "linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)",
          borderRadius: "20px",
          maxWidth: "640px",
          width: "92%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "clamp(1.5rem, 4vw, 2.5rem)",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15), 0 0 1px rgba(0, 0, 0, 0.05)",
          animation: "slideUp 0.3s ease-out",
          fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
        },
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          onClick: onClose,
          style: {
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "rgba(249, 250, 251, 0.8)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#78716c",
            lineHeight: 1,
            padding: 0,
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s"
          },
          onMouseOver: (e) => {
            e.currentTarget.style.background = "#292524";
            e.currentTarget.style.color = "#ffffff";
            e.currentTarget.style.borderColor = "#292524";
          },
          onMouseOut: (e) => {
            e.currentTarget.style.background = "rgba(249, 250, 251, 0.8)";
            e.currentTarget.style.color = "#78716c";
            e.currentTarget.style.borderColor = "rgba(0, 0, 0, 0.06)";
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
            background: i === step ? primaryColor : i < step ? "rgba(87, 83, 78, 0.3)" : "rgba(168, 162, 158, 0.2)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            transform: i === step ? "scale(1)" : "scale(0.9)"
          }
        }
      ))), step === 2 && /* @__PURE__ */ import_react.default.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ import_react.default.createElement("div", { style: { fontSize: "0.8125rem", color: "#78716c", fontWeight: 600, marginBottom: "0.5rem" } }, "Dimension ", currentDimension + 1, " of ", POLICIES.length), /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", gap: "0.375rem", justifyContent: "center" } }, POLICIES.map((_, i) => /* @__PURE__ */ import_react.default.createElement(
        "div",
        {
          key: i,
          style: {
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: i <= currentDimension ? primaryColor : "rgba(168, 162, 158, 0.2)",
            transition: "all 0.3s"
          }
        }
      ))))),
      renderStep(),
      step !== 2 && step !== 3 && /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "2.5rem", paddingTop: "2rem", borderTop: "1px solid rgba(0, 0, 0, 0.06)" } }, step > 0 && /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          onClick: () => setStep(step - 1),
          style: {
            padding: "0.875rem 1.75rem",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            background: "transparent",
            color: "#292524"
          },
          onMouseOver: (e) => {
            e.currentTarget.style.background = "rgba(249, 250, 251, 0.8)";
            e.currentTarget.style.transform = "translateY(-1px)";
          },
          onMouseOut: (e) => {
            e.currentTarget.style.background = "transparent";
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
            background: primaryColor,
            color: "white",
            marginLeft: "auto",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.08)"
          },
          onMouseOver: (e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.12)";
          },
          onMouseOut: (e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.08)";
          }
        },
        "Continue \u2192"
      )),
      step === 2 && currentDimension > 0 && /* @__PURE__ */ import_react.default.createElement("div", { style: { marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid rgba(0, 0, 0, 0.06)", textAlign: "center" } }, /* @__PURE__ */ import_react.default.createElement(
        "button",
        {
          onClick: () => setCurrentDimension(currentDimension - 1),
          style: {
            padding: "0.75rem 1.5rem",
            border: "1px solid rgba(0, 0, 0, 0.1)",
            borderRadius: "12px",
            fontSize: "0.9375rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            background: "transparent",
            color: "#78716c"
          },
          onMouseOver: (e) => {
            e.currentTarget.style.background = "rgba(249, 250, 251, 0.8)";
            e.currentTarget.style.color = "#292524";
          },
          onMouseOut: (e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#78716c";
          }
        },
        "\u2190 Previous dimension"
      ))
    )
  );
}

// src/SquaresEmbedReact.tsx
function SquaresEmbedReact({
  variant = "card",
  buttonText = "Map Your Squares",
  align = "center",
  maxWidth,
  primaryColor = "#4285f4",
  borderRadius = "12px",
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
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: 600,
          borderRadius,
          cursor: "pointer",
          boxShadow: shadow ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
          transition: "all 0.2s ease",
          width: "100%"
        },
        onMouseOver: (e) => {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "translateY(-1px)";
        },
        onMouseOut: (e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "translateY(0)";
        }
      },
      buttonText
    )), showWidget && /* @__PURE__ */ import_react2.default.createElement(SquaresWidget, { onClose: () => setShowWidget(false), primaryColor }));
  }
  return /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { style: containerStyle }, /* @__PURE__ */ import_react2.default.createElement(
    "div",
    {
      style: {
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius,
        padding: "24px",
        boxShadow: shadow ? "0 4px 12px rgba(0,0,0,0.1)" : "none"
      }
    },
    /* @__PURE__ */ import_react2.default.createElement("div", { style: { marginBottom: "20px" } }, /* @__PURE__ */ import_react2.default.createElement("h3", { style: { margin: "0 0 8px 0", fontSize: "20px", fontWeight: 600, color: "#111827" } }, "Map Your Political Positions"), /* @__PURE__ */ import_react2.default.createElement("p", { style: { margin: 0, fontSize: "14px", color: "#6b7280", lineHeight: "1.5" } }, "Use the TAME-R framework to visualize where you stand on 5 key policy dimensions")),
    /* @__PURE__ */ import_react2.default.createElement(
      "div",
      {
        style: {
          backgroundColor: "#f9fafb",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "20px"
        }
      },
      /* @__PURE__ */ import_react2.default.createElement("div", { style: { marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ import_react2.default.createElement("span", { style: { fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" } }, "Example:"), /* @__PURE__ */ import_react2.default.createElement("span", { style: { fontSize: "14px", fontWeight: 600, color: "#111827" } }, "Martin Luther King Jr.")),
      /* @__PURE__ */ import_react2.default.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ import_react2.default.createElement("div", { style: { fontSize: "clamp(24px, 6vw, 32px)", marginBottom: "8px", display: "flex", justifyContent: "center", gap: "4px" } }, /* @__PURE__ */ import_react2.default.createElement("span", null, "\u{1F7E9}"), /* @__PURE__ */ import_react2.default.createElement("span", null, "\u{1F7E6}"), /* @__PURE__ */ import_react2.default.createElement("span", null, "\u{1F7E9}"), /* @__PURE__ */ import_react2.default.createElement("span", null, "\u{1F7E7}"), /* @__PURE__ */ import_react2.default.createElement("span", null, "\u{1F7EA}")), /* @__PURE__ */ import_react2.default.createElement("div", { style: { fontSize: "10px", color: "#6b7280", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" } }, /* @__PURE__ */ import_react2.default.createElement("span", null, "Trade"), /* @__PURE__ */ import_react2.default.createElement("span", null, "Abortion"), /* @__PURE__ */ import_react2.default.createElement("span", null, "Migration"), /* @__PURE__ */ import_react2.default.createElement("span", null, "Economics"), /* @__PURE__ */ import_react2.default.createElement("span", null, "Rights")))
    ),
    /* @__PURE__ */ import_react2.default.createElement(
      "button",
      {
        onClick: handleClick,
        style: {
          backgroundColor: primaryColor,
          color: "white",
          border: "none",
          padding: "12px 24px",
          fontSize: "16px",
          fontWeight: 600,
          borderRadius: "8px",
          cursor: "pointer",
          width: "100%",
          marginBottom: "12px",
          transition: "all 0.2s ease"
        },
        onMouseOver: (e) => {
          e.currentTarget.style.opacity = "0.9";
          e.currentTarget.style.transform = "translateY(-1px)";
        },
        onMouseOut: (e) => {
          e.currentTarget.style.opacity = "1";
          e.currentTarget.style.transform = "translateY(0)";
        }
      },
      buttonText
    ),
    /* @__PURE__ */ import_react2.default.createElement("p", { style: { margin: 0, fontSize: "12px", color: "#9ca3af", textAlign: "center" } }, "Takes less than 2 minutes \xB7 Free & open source")
  )), showWidget && /* @__PURE__ */ import_react2.default.createElement(SquaresWidget, { onClose: () => setShowWidget(false), primaryColor }));
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SquaresEmbedReact,
  SquaresWidget
});
