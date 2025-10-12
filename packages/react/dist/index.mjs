// src/SquaresEmbedReact.tsx
import React2, { useState as useState2 } from "react";

// src/SquaresWidget.tsx
import React, { useState, useCallback } from "react";
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
var EXAMPLE_FIGURES = [
  {
    name: "Martin Luther King Jr.",
    spectrum: [2, 1, 2, 4, 0],
    period: "1963-1965",
    title: "Civil Rights Movement Leadership",
    description: "Led the March on Washington and Selma campaign, advocating for civil rights legislation and voting rights while maintaining nonviolent resistance."
  },
  {
    name: "Ronald Reagan",
    spectrum: [0, 5, 3, 1, 4],
    period: "1981-1989",
    title: "Reagan Presidency",
    description: "Presidency marked by supply-side economics, conservative social policies, and strong anti-communist foreign policy during the Cold War."
  },
  {
    name: "Franklin D. Roosevelt",
    spectrum: [3, 2, 2, 5, 2],
    period: "1933-1936",
    title: "First New Deal",
    description: "First term implementing the New Deal programs to combat the Great Depression through unprecedented government intervention in the economy."
  }
];
function getEmojiSquare(value) {
  const emojis = ["\u{1F7EA}", "\u{1F7E6}", "\u{1F7E9}", "\u{1F7E8}", "\u{1F7E7}", "\u{1F7E5}", "\u2B1B\uFE0F"];
  return emojis[value] || "\u{1F7E8}";
}
function SquaresWidget({ onClose, primaryColor = "#4285f4" }) {
  const [step, setStep] = useState(0);
  const [spectrum, setSpectrum] = useState({
    trade: 3,
    abortion: 3,
    migration: 3,
    economics: 3,
    rights: 3
  });
  const [copied, setCopied] = useState(false);
  const emojiSignature = POLICIES.map((p) => getEmojiSquare(spectrum[p.key])).join("");
  const handleCopy = useCallback(async () => {
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
        return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "400px" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 1rem 0", color: "#1a1a1a", fontSize: "1.8rem" } }, "Welcome to squares.vote"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "1.1rem", lineHeight: "1.6", color: "#333", marginBottom: "1.5rem" } }, "Map your political positions across five key policy dimensions using the ", /* @__PURE__ */ React.createElement("strong", null, "TAME-R"), " framework:"), /* @__PURE__ */ React.createElement("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem", margin: "1.5rem 0" } }, POLICIES.map((policy) => /* @__PURE__ */ React.createElement("div", { key: policy.key, style: { display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", background: "#f8f9fa", borderRadius: "8px", fontSize: "1rem" } }, /* @__PURE__ */ React.createElement("span", { style: { fontSize: "1.5rem" } }, policy.emoji), /* @__PURE__ */ React.createElement("strong", { style: { color: "#1a1a1a" } }, policy.label)))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "0.9rem", color: "#666", textAlign: "center", marginTop: "1rem" } }, "Each dimension uses a 7-point scale from minimal government intervention to maximum control."));
      case 1:
        return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "400px" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 1rem 0", color: "#1a1a1a", fontSize: "1.8rem" } }, "See How It Works"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "1.1rem", lineHeight: "1.6", color: "#333", marginBottom: "1.5rem" } }, "Here are some historical figures mapped on the TAME-R spectrum:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "1rem", margin: "1.5rem 0" } }, EXAMPLE_FIGURES.map((figure) => /* @__PURE__ */ React.createElement("div", { key: figure.name, style: { padding: "1.25rem", background: "#f8f9fa", borderRadius: "12px", border: "2px solid #e0e0e0" } }, /* @__PURE__ */ React.createElement("h3", { style: { margin: "0 0 0.25rem 0", fontSize: "1.2rem", color: "#1a1a1a" } }, figure.name), /* @__PURE__ */ React.createElement("p", { style: { margin: "0.25rem 0 0 0", color: "#1a1a1a", fontSize: "1rem", fontWeight: 600 } }, figure.title), /* @__PURE__ */ React.createElement("p", { style: { margin: "0.25rem 0 1rem 0", color: primaryColor, fontSize: "0.85rem", fontWeight: 500 } }, figure.period), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", fontSize: "2rem", marginBottom: "0.5rem", justifyContent: "flex-start" } }, figure.spectrum.map((val, idx) => /* @__PURE__ */ React.createElement("span", { key: idx, style: { display: "inline-block", width: "2rem" } }, getEmojiSquare(val)))), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", justifyContent: "flex-start" } }, POLICIES.map((p) => /* @__PURE__ */ React.createElement("span", { key: p.key, style: { fontSize: "0.75rem", color: "#666", fontWeight: 600, textAlign: "center", width: "2rem" } }, p.label[0]))), /* @__PURE__ */ React.createElement("p", { style: { margin: "1rem 0 0 0", color: "#555", fontSize: "0.9rem", lineHeight: "1.5" } }, figure.description)))), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "0.9rem", color: "#666", textAlign: "center", marginTop: "1rem" } }, "Each colored square represents their position on one dimension."));
      case 2:
        return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "400px" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 1rem 0", color: "#1a1a1a", fontSize: "1.8rem" } }, "Map Your Squares"), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "1.1rem", lineHeight: "1.6", color: "#333", marginBottom: "1.5rem" } }, "Adjust each slider to reflect your political positions. Each scale represents minimal to maximal government control or intervention:"), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", flexDirection: "column", gap: "2rem", margin: "1.5rem 0" } }, POLICIES.map((policy) => /* @__PURE__ */ React.createElement("div", { key: policy.key, style: { display: "flex", flexDirection: "column", gap: "0.5rem" } }, /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("label", { style: { fontWeight: 600, fontSize: "1.1rem", color: "#1a1a1a" } }, policy.emoji, " ", policy.label), /* @__PURE__ */ React.createElement("span", { style: { fontSize: "1.8rem" } }, getEmojiSquare(spectrum[policy.key]))), /* @__PURE__ */ React.createElement(
          "input",
          {
            type: "range",
            min: "0",
            max: "6",
            value: spectrum[policy.key],
            onChange: (e) => setSpectrum((prev) => ({
              ...prev,
              [policy.key]: parseInt(e.target.value)
            })),
            style: {
              width: "100%",
              height: "8px",
              borderRadius: "4px",
              background: "linear-gradient(to right, #9333ea, #3b82f6, #10b981, #eab308, #f97316, #ef4444, #000)",
              outline: "none",
              WebkitAppearance: "none",
              cursor: "pointer"
            }
          }
        ), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" } }, /* @__PURE__ */ React.createElement("span", null, "Minimal"), /* @__PURE__ */ React.createElement("span", null, "Maximal")), /* @__PURE__ */ React.createElement("p", { style: { margin: 0, padding: "0.75rem", background: "#f8f9fa", borderRadius: "6px", fontSize: "0.95rem", color: "#1a1a1a", fontWeight: 500, textAlign: "center", border: "2px solid #e0e0e0" } }, POSITION_LABELS[policy.key][spectrum[policy.key]])))));
      case 3:
        return /* @__PURE__ */ React.createElement("div", { style: { minHeight: "400px" } }, /* @__PURE__ */ React.createElement("h2", { style: { margin: "0 0 1rem 0", color: "#1a1a1a", fontSize: "1.8rem" } }, "Your Political Signature"), /* @__PURE__ */ React.createElement("div", { style: { textAlign: "center", margin: "2rem 0" } }, /* @__PURE__ */ React.createElement("div", { style: { fontSize: "clamp(2rem, 8vw, 3rem)", letterSpacing: "clamp(0.2rem, 1vw, 0.5rem)", marginBottom: "1rem", wordBreak: "break-all", lineHeight: "1.2" } }, emojiSignature), /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "center", gap: "clamp(0.5rem, 3vw, 2.5rem)", marginBottom: "2rem", flexWrap: "wrap" } }, POLICIES.map((p) => /* @__PURE__ */ React.createElement("span", { key: p.key, style: { fontSize: "0.85rem", color: "#666", fontWeight: 600, whiteSpace: "nowrap" } }, p.label)))), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: handleCopy,
            style: {
              padding: "1rem 2rem",
              background: primaryColor,
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%",
              marginBottom: "1rem"
            },
            onMouseOver: (e) => e.currentTarget.style.transform = "translateY(-2px)",
            onMouseOut: (e) => e.currentTarget.style.transform = "translateY(0)"
          },
          copied ? "\u2713 Copied!" : "Copy to Clipboard"
        ), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: () => window.open("https://squares.vote", "_blank", "noopener,noreferrer"),
            style: {
              padding: "1rem 2rem",
              background: "white",
              color: primaryColor,
              border: `2px solid ${primaryColor}`,
              borderRadius: "8px",
              fontSize: "1.1rem",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              width: "100%",
              marginBottom: "1rem"
            },
            onMouseOver: (e) => {
              e.currentTarget.style.background = primaryColor;
              e.currentTarget.style.color = "white";
              e.currentTarget.style.transform = "translateY(-2px)";
            },
            onMouseOut: (e) => {
              e.currentTarget.style.background = "white";
              e.currentTarget.style.color = primaryColor;
              e.currentTarget.style.transform = "translateY(0)";
            }
          },
          "Explore More at squares.vote \u2192"
        ), /* @__PURE__ */ React.createElement("p", { style: { fontSize: "0.9rem", color: "#666", textAlign: "center", marginTop: "0.5rem" } }, "Share your squares on social media"));
      default:
        return null;
    }
  };
  return /* @__PURE__ */ React.createElement(
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
    /* @__PURE__ */ React.createElement("style", null, `
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
    /* @__PURE__ */ React.createElement(
      "div",
      {
        style: {
          background: "white",
          borderRadius: "16px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          position: "relative",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          animation: "slideUp 0.3s ease-out"
        },
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: onClose,
          style: {
            position: "absolute",
            top: "1rem",
            right: "1rem",
            background: "none",
            border: "none",
            fontSize: "2rem",
            cursor: "pointer",
            color: "#666",
            lineHeight: 1,
            padding: 0,
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            transition: "all 0.2s"
          },
          onMouseOver: (e) => {
            e.currentTarget.style.background = "#f0f0f0";
            e.currentTarget.style.color = "#000";
          },
          onMouseOut: (e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#666";
          }
        },
        "\xD7"
      ),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem" } }, [0, 1, 2, 3].map((i) => /* @__PURE__ */ React.createElement(
        "div",
        {
          key: i,
          style: {
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: i <= step ? primaryColor : "#e0e0e0",
            transition: "all 0.3s",
            transform: i <= step ? "scale(1.2)" : "scale(1)"
          }
        }
      ))),
      renderStep(),
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #e0e0e0" } }, step > 0 && /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setStep(step - 1),
          style: {
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            background: "#f0f0f0",
            color: "#333"
          },
          onMouseOver: (e) => e.currentTarget.style.background = "#e0e0e0",
          onMouseOut: (e) => e.currentTarget.style.background = "#f0f0f0"
        },
        "\u2190 Back"
      ), step < 3 ? /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: () => setStep(step + 1),
          style: {
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            background: primaryColor,
            color: "white",
            marginLeft: "auto"
          },
          onMouseOver: (e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 4px 12px rgba(66, 133, 244, 0.3)`;
          },
          onMouseOut: (e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        },
        "Next \u2192"
      ) : /* @__PURE__ */ React.createElement(
        "button",
        {
          onClick: onClose,
          style: {
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            background: primaryColor,
            color: "white",
            marginLeft: "auto"
          },
          onMouseOver: (e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 4px 12px rgba(66, 133, 244, 0.3)`;
          },
          onMouseOut: (e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        },
        "Done"
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
  const [showWidget, setShowWidget] = useState2(false);
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
    return /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement("div", { style: containerStyle }, /* @__PURE__ */ React2.createElement(
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
    )), showWidget && /* @__PURE__ */ React2.createElement(SquaresWidget, { onClose: () => setShowWidget(false), primaryColor }));
  }
  return /* @__PURE__ */ React2.createElement(React2.Fragment, null, /* @__PURE__ */ React2.createElement("div", { style: containerStyle }, /* @__PURE__ */ React2.createElement(
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
    /* @__PURE__ */ React2.createElement("div", { style: { marginBottom: "20px" } }, /* @__PURE__ */ React2.createElement("h3", { style: { margin: "0 0 8px 0", fontSize: "20px", fontWeight: 600, color: "#111827" } }, "Map Your Political Positions"), /* @__PURE__ */ React2.createElement("p", { style: { margin: 0, fontSize: "14px", color: "#6b7280", lineHeight: "1.5" } }, "Use the TAME-R framework to visualize where you stand on 5 key policy dimensions")),
    /* @__PURE__ */ React2.createElement(
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
      /* @__PURE__ */ React2.createElement("div", { style: { marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" } }, /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "12px", fontWeight: 600, color: "#6b7280", textTransform: "uppercase" } }, "Example:"), /* @__PURE__ */ React2.createElement("span", { style: { fontSize: "14px", fontWeight: 600, color: "#111827" } }, "Martin Luther King Jr.")),
      /* @__PURE__ */ React2.createElement("div", { style: { textAlign: "center" } }, /* @__PURE__ */ React2.createElement("div", { style: { fontSize: "clamp(24px, 6vw, 32px)", marginBottom: "8px", display: "flex", justifyContent: "center", gap: "4px" } }, /* @__PURE__ */ React2.createElement("span", null, "\u{1F7E9}"), /* @__PURE__ */ React2.createElement("span", null, "\u{1F7E6}"), /* @__PURE__ */ React2.createElement("span", null, "\u{1F7E9}"), /* @__PURE__ */ React2.createElement("span", null, "\u{1F7E7}"), /* @__PURE__ */ React2.createElement("span", null, "\u{1F7EA}")), /* @__PURE__ */ React2.createElement("div", { style: { fontSize: "10px", color: "#6b7280", display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap" } }, /* @__PURE__ */ React2.createElement("span", null, "Trade"), /* @__PURE__ */ React2.createElement("span", null, "Abortion"), /* @__PURE__ */ React2.createElement("span", null, "Migration"), /* @__PURE__ */ React2.createElement("span", null, "Economics"), /* @__PURE__ */ React2.createElement("span", null, "Rights")))
    ),
    /* @__PURE__ */ React2.createElement(
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
    /* @__PURE__ */ React2.createElement("p", { style: { margin: 0, fontSize: "12px", color: "#9ca3af", textAlign: "center" } }, "Takes less than 2 minutes \xB7 Free & open source")
  )), showWidget && /* @__PURE__ */ React2.createElement(SquaresWidget, { onClose: () => setShowWidget(false), primaryColor }));
}
export {
  SquaresEmbedReact,
  SquaresWidget
};
