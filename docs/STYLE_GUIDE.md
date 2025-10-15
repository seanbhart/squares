# Squares Design System & Style Guide

> **Version 1.1** — A comprehensive guide for designers and developers building products in the Squares ecosystem.

---

## Quick Start for Developers

**Building a new extension?** Follow these rules:

1. ✅ **Use CSS variables** for all colors: `var(--bg-primary)`, `var(--text-secondary)`, etc.
2. ✅ Import from `/app/globals.css` (automatic in Next.js)
3. ❌ **Never hardcode** hex colors like `#121113` or `#B8B8B9`
4. ✅ **Policy colors** (purple→red spectrum) come from `/lib/tamer-config.ts`
5. ✅ Test your component on figures page, miniapp, and main site for consistency

**Color variables**: See [Color System](#color-system) for complete reference.

---

## Table of Contents

1. [Brand Overview](#brand-overview)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Interactive States](#interactive-states)
7. [Icons & Visual Elements](#icons--visual-elements)
8. [Mobile & Responsive Design](#mobile--responsive-design)
9. [Code Examples](#code-examples)

---

## Brand Overview

**Squares** is a political spectrum mapping tool that uses the **TAME-R framework** to map users across five dimensions:

- **T** — Trade
- **A** — Abortion
- **M** — Migration / Immigration
- **E** — Economics
- **R** — Rights (civil liberties)

### Design Philosophy

- **Dimensional, not binary**: Politics is multi-faceted, and our design reflects complexity through color gradients and visual spectrums
- **Clean & modern**: Minimal UI with intentional spacing and clear hierarchy
- **Accessible**: High contrast, readable typography, clear interactive states
- **Data-forward**: Visual emphasis on the spectrum squares and emoji signatures

---

## Color System

### Political Spectrum Colors (7-point scale)

```css
/* COLOR_RAMP - Used for all political position indicators */
--spectrum-0: #7e568e;  /* Purple - Most progressive/minimal intervention */
--spectrum-1: #1f6adb;  /* Blue */
--spectrum-2: #398a34;  /* Green */
--spectrum-3: #eab308;  /* Yellow - Balanced/center */
--spectrum-4: #e67e22;  /* Orange */
--spectrum-5: #c0392b;  /* Red */
--spectrum-6: #383b3d;  /* Dark slate - Most conservative/maximal intervention */
```

**Usage**: Applied to colored squares, option buttons, and badge elements to indicate political positions.

### UI Colors (Dark Mode Default)

**⚠️ IMPORTANT**: Always use CSS variables, not hardcoded hex values.

All colors are defined in `/app/globals.css` and available as CSS variables:

```css
/* Backgrounds */
--bg-primary: #121113;                      /* Main page background (dark warm) */
--bg-secondary: #1A191B;                    /* Secondary background */
--surface: rgba(24, 23, 25, 0.85);          /* Cards, info boxes */
--surface-hover: rgba(32, 31, 33, 0.95);    /* Hover state for surfaces */
--surface-lighter: rgba(40, 39, 41, 0.35);  /* Timeline, subtle overlays */

/* Text/Foreground */
--text-primary: #ffffff;                    /* Primary text */
--text-secondary: #B8B8B9;                  /* Muted/helper text (warm gray) */
--text-muted: #7A797B;                      /* Disabled states */

/* Borders */
--border: rgba(255, 255, 255, 0.08);        /* Default borders (subtle) */
--border-strong: rgba(255, 255, 255, 0.12); /* Emphasized borders */
--border-light: rgba(255, 255, 255, 0.04);  /* Very subtle borders */

/* Interactive/Accent Colors */
--accent: #e5e5e5;                          /* Primary buttons, links */
--accent-hover: #ffffff;                    /* Primary button hover */
--accent-text: #121113;                     /* Text on accent backgrounds */
--neutral-button: #4A494B;                  /* Secondary buttons (warm gray) */
--neutral-button-hover: #5A595B;            /* Neutral button hover */

/* Shadows */
--shadow: rgba(0, 0, 0, 0.4);               /* Standard shadows (deeper) */
--shadow-strong: rgba(0, 0, 0, 0.6);        /* Stronger shadows */
--shadow-light: rgba(255, 255, 255, 0.15);  /* Light shadows */
```

**Usage Example**:
```css
/* ✅ DO: Use CSS variables */
.myComponent {
  background: var(--bg-primary);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

/* ❌ DON'T: Hardcode colors */
.myComponent {
  background: #121113;
  color: #B8B8B9;
}
```

### Theme Architecture

**Current**: Dark mode only (warm, slightly purple-tinted)

**Future**: If light mode is added, use CSS media queries or data attributes:
```css
@media (prefers-color-scheme: light) {
  :root {
    --bg-primary: #f9fafb;
    --text-primary: #171717;
    /* ... */
  }
}
```

**Extending**: When creating new components or pages:
1. Import from `/app/globals.css` (automatic in Next.js)
2. Reference variables: `var(--variable-name)`
3. Never hardcode #hex colors
4. Test theme consistency across all pages

---

## Typography

### Font Families

```css
/* System font stack - optimized for performance and consistency */
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
```

### Type Scale

```css
/* Headings */
--text-4xl: clamp(2rem, 5vw, 3rem);        /* Major headings */
--text-3xl: clamp(1.75rem, 4vw, 2.5rem);   /* Section headings */
--text-2xl: clamp(1.5rem, 3vw, 2rem);      /* Card titles */
--text-xl: clamp(1.25rem, 2.5vw, 1.5rem);  /* Subheadings */

/* Body Text */
--text-lg: 1.125rem;   /* Large body text */
--text-base: 1rem;     /* Default body text */
--text-sm: 0.875rem;   /* Small text, button labels */
--text-xs: 0.75rem;    /* Captions, helper text */
--text-2xs: 0.6875rem; /* Tiny labels */

/* Emoji/Visual Text */
--emoji-lg: 3rem;      /* Large dimension badges */
--emoji-md: 2rem;      /* Medium squares */
--emoji-sm: 1.5rem;    /* Small inline emojis */
```

### Font Weights

```css
--font-black: 900;     /* Large dimension letters (T, A, M, E, R) */
--font-bold: 800;      /* Headings */
--font-semibold: 600;  /* Buttons, labels */
--font-medium: 500;    /* Body emphasis */
--font-regular: 400;   /* Body text, options */
```

### Line Heights

```css
--leading-tight: 1.2;   /* Headings */
--leading-normal: 1.3;  /* Option labels */
--leading-relaxed: 1.5; /* Body text */
```

---

## Spacing & Layout

### Spacing Scale (rem-based)

```css
/* Base unit: 0.25rem (4px) */
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Common Spacing Patterns

```css
/* Vertical Rhythm */
--section-padding: 4rem 1rem;
--card-padding: 1.5rem;
--button-padding: 0.625rem 1.5rem;
--input-padding: 0.875rem 0.5rem;

/* Gaps */
--gap-options: 0.75rem;     /* Between option buttons (desktop) */
--gap-buttons: 0.5rem;      /* Between action buttons */
--gap-squares: 1rem;        /* Between result squares */
--gap-inline: 0.5rem;       /* Between inline elements */
```

### Border Radius

```css
--radius-sm: 6px;      /* Small elements, copy icons */
--radius-md: 8px;      /* Input fields */
--radius-lg: 10px;     /* Buttons, small squares */
--radius-xl: 12px;     /* Cards, containers */
--radius-2xl: 16px;    /* Large cards */
```

### Max Widths

```css
--max-width-content: 1200px;   /* Main site content */
--max-width-miniapp: 640px;    /* Miniapp containers */
--max-width-narrow: 900px;     /* Results section */
```

---

## Components

### Colored Squares

The core visual element of the Squares brand.

#### Large Square (Dimension Badge)

```css
.dimensionBadge {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  background-color: [spectrum-color];
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.badgeLetter {
  font-size: 3rem;
  color: #e5e5e5;
  font-weight: 900;
}
```

#### Medium Square (Option Button)

```css
.optionSquare {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  background-color: [spectrum-color];
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### Small Square (Results Display)

```css
.resultSquare {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background-color: [spectrum-color];
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Buttons

#### Primary Button

```css
.primaryButton {
  width: 100%;
  padding: 0.625rem 1.5rem;
  background: var(--accent);
  color: var(--accent-text);
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(255, 255, 255, 0.2);
}

.primaryButton:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
}
```

#### Secondary Button

```css
.secondaryButton {
  padding: 0.625rem 1.5rem;
  background: transparent;
  color: var(--accent);
  border: 1.5px solid var(--neutral-button);
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.secondaryButton:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--neutral-button-hover);
  transform: translateY(-1px);
}
```

### Option Cards

```css
.option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.625rem;
  padding: 0.875rem 0.5rem;
  background: transparent;
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

/* Center option uses dashed border */
.option:nth-child(4) {
  border-style: dashed;
  border-color: rgba(255, 255, 255, 0.2);
}

.option:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.03);
  border-style: solid;  /* Dashed becomes solid on hover */
}

.option[data-selected="true"] {
  border: 2px solid rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.05);
}
```

### Cards & Containers

```css
.card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 0.75rem;
  border: 1px solid var(--border);
}

.signatureBox {
  text-align: center;
  padding: 1.5rem 1.5rem 1.25rem 1.5rem;
  background: rgba(26, 26, 26, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);  /* For sticky/overlay contexts */
}
```

### Progress Indicators

#### Dots

```css
.progressDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #404040;
  transition: background-color 0.2s;
}

.progressDot[data-complete="true"] {
  background-color: [dimension-color];
}

.progressDot[data-current="true"] {
  background-color: #737373;
}
```

---

## Interactive States

### Hover States

- **Lift effect**: `transform: translateY(-2px)`
- **Background overlay**: `rgba(255, 255, 255, 0.05)`
- **Border brightening**: Increase opacity by ~0.1-0.15
- **Shadow enhancement**: Increase from `0 2px 8px` to `0 4px 12px`

### Selected States

- **Border**: 2px solid with higher opacity
- **Background**: Subtle overlay `rgba(255, 255, 255, 0.05)`
- **NO transform** on selected state (stable)

### Disabled States

- **Opacity**: 0.5
- **Cursor**: `not-allowed`
- **No hover effects**

### Focus States

```css
.interactive:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

### Copy Success Feedback

```css
.copyButton[data-copied="true"] {
  color: #398a34;  /* Green */
  background: #398a34;  /* If background button */
}
```

---

## Page-Specific Patterns

### Figures Page

The Figures page uses a consistent dark theme with card-based layouts for displaying historical political figures.

**All colors verified from actual CSS files.**

#### Background Colors

```css
/* Main page background */
.main {
  background: #212121;
  color: #ffffff;
}

/* Card backgrounds - All use same surface color */
.userCard,
.detailCard,
.figureCard,
.emojiSignature,
.chatReasoning,
.emptyState {
  background: rgba(30, 30, 30, 0.8);
}

/* Card borders */
.userCard,
.detailCard {
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
}

.figureCard,
.emojiSignature,
.chatReasoning {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px; /* emojiSignature, chatReasoning */
  border-radius: 12px; /* figureCard */
}

.emptyState {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* Timeline entries - lighter background */
.timelineEntry {
  background: rgba(50, 50, 50, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

/* Chat box */
.chatBox {
  background: #212121;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Chat message area - uses --bg-secondary */
.messages {
  background: #1a1a1a;
}

/* Chat message bubbles */
.userMessage {
  background: #e5e5e5;
  color: #212121;
}

.assistantMessage {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* Chat header and input form */
.header,
.inputForm {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Form inputs */
.dropdown {
  background: rgba(30, 30, 30, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown:hover {
  background: rgba(40, 40, 40, 0.9);
  border-color: rgba(255, 255, 255, 0.2);
}

.input {
  background: rgba(40, 40, 40, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

#### Interactive Elements

```css
/* Chat button */
.mobileChatButton,
.minimizedButton {
  background: #525252;
  color: white;
}

.mobileChatButton:hover,
.minimizedButton:hover {
  background: #737373;
}

/* Share button gradient */
.chatBanner {
  background: linear-gradient(135deg, #525252, #737373);
}
```

#### Selected States

```css
.figureCard[data-selected="true"] {
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px rgba(255, 255, 255, 0.15);
}
```

#### Mobile Overlay

```css
.mobileOverlay {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
}
```

### Embed Page

The embed documentation page uses a simplified **2-layer background system** for maximum clarity.

**All colors verified from actual CSS files.**

#### Background Hierarchy

```css
/* Layer 1: Page background only */
.container {
  background: var(--bg-primary); /* #212121 */
}

/* Demo and features sections have no background - use page background */
.demo,
.features {
  background: transparent;
  border: none;
}

/* Layer 2: Code blocks only */
.code,
.codeDetails summary {
  background: var(--bg-secondary); /* #1A1A1A */
  border: 1px solid var(--border);
}

/* React embed components render with their own backgrounds */
/* Card variant: #212121 outer, #1A1A1A inner example area */
```

**Design principle**: Minimize background layers. Only add a different background color when functionally necessary (code blocks). Let the embed component itself provide visual structure.

---

## Icons & Visual Elements

### Icon System

Using SVG icons with these properties:

```css
.icon {
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
}
```

### Common Icons

- **Clipboard**: Copy functionality
- **Check**: Success confirmation
- **X**: Close/dismiss
- **Arrow**: Navigation, scale indicators

### Emoji Squares

```css
/* Emojis used for shareable signatures */
🟪 /* Purple - Spectrum 0 */
🟦 /* Blue - Spectrum 1 */
🟩 /* Green - Spectrum 2 */
🟨 /* Yellow - Spectrum 3 */
🟧 /* Orange - Spectrum 4 */
🟥 /* Red - Spectrum 5 */
⬛️ /* Black - Spectrum 6 */
```

**Format**: `🟦🟩🟦🟩🟦 @username`

---

## Mobile & Responsive Design

### Breakpoints

```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1200px;
```

### Mobile Patterns

#### Grid Layouts

**Desktop (≥768px)**: 7 columns (all options in one row)
```css
grid-template-columns: repeat(7, 1fr);
gap: 0.75rem;
```

**Mobile (<768px)**: 3-1-3 pattern
```css
grid-template-columns: repeat(3, 1fr);
gap: 0.5rem;

.option:nth-child(4) {
  grid-column: 2 / 3;  /* Center option in middle */
  grid-row: 2;
}
```

#### Touch Targets

Minimum touch target: **44px × 44px** (iOS guidelines)

```css
/* Ensure adequate padding for mobile */
@media (max-width: 768px) {
  .option {
    padding: 0.75rem 0.4rem;
    min-height: 44px;
  }
  
  .button {
    padding: 0.75rem 1rem;
    min-height: 44px;
  }
}
```

#### Mobile Spacing

- Reduce gaps by ~25% on mobile
- Reduce padding by ~15-20%
- Use `clamp()` for fluid typography
- Hide scale labels on narrow screens

#### Safe Areas

```css
padding-top: env(safe-area-inset-top);
padding-bottom: env(safe-area-inset-bottom);
```

---

## Code Examples

### Dimension Question Card

```tsx
<div className={styles.questionArea}>
  <div className={styles.dimensionBadge}>
    <span className={styles.badgeSquare} style={{ backgroundColor: color }}>
      {letter}
    </span>
  </div>
  
  <h2 className={styles.question}>{label}</h2>
  
  <p className={styles.instruction}>
    Where do you stand on government intervention?
  </p>
  
  <div className={styles.scaleContainer}>
    {options.map((option, index) => (
      <button
        key={index}
        className={styles.option}
        data-selected={value === index}
        onClick={() => onChange(index)}
      >
        <div
          className={styles.optionSquare}
          style={{ backgroundColor: getColor(index) }}
        />
        <span className={styles.optionLabel}>{option}</span>
      </button>
    ))}
  </div>
  
  <div className={styles.scaleLabels}>
    <span>Minimal intervention</span>
    <span className={styles.scaleArrow}>→</span>
    <span>Total control</span>
  </div>
</div>
```

### Results Display

```tsx
<div className={styles.resultsArea}>
  <h2 className={styles.resultsTitle}>Your Squares</h2>
  
  <div className={styles.squaresDisplay}>
    {POLICIES.map((policy, index) => (
      <div key={policy.key} className={styles.resultSquare}>
        <div
          className={styles.resultSquareColor}
          style={{ backgroundColor: getColor(value) }}
        >
          <span className={styles.resultLetter}>{letters[index]}</span>
        </div>
        <span className={styles.resultLabel}>{policy.label}</span>
      </div>
    ))}
  </div>
  
  <div className={styles.emojiSignature}>
    <span className={styles.emojiText}>{emojis}</span>
    <button className={styles.copyButton} onClick={handleCopy}>
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      Copy
    </button>
  </div>
</div>
```

### Copy to Clipboard Pattern

```tsx
const [copied, setCopied] = useState(false);

const handleCopy = async () => {
  const emojis = getEmojiSquares().join('');
  const text = username ? `${emojis} @${username}` : emojis;
  
  try {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};
```

---

## Design Principles Summary

1. **Use CSS variables**: All colors from `var(--variable)`, never hardcoded hex
2. **Spectrum over binary**: Use the 7-color gradient to show nuance
3. **Transparent by default**: Buttons and options use transparent backgrounds with borders
4. **Subtle interactions**: Small transforms (2px) and gentle overlays
5. **Consistent spacing**: Use the spacing scale; reduce by ~25% on mobile
6. **Color as meaning**: Spectrum colors indicate political positions, not decoration
7. **Readability first**: High contrast, adequate sizing, clear labels
8. **Copy-friendly**: Always include username context when copying emojis
9. **Progressive disclosure**: Show complexity progressively, don't overwhelm

---

## Questions or Contributions?

For design questions or to propose additions to this guide, please reach out to the Squares design team or submit a PR with updates.

**Version History**:
- **v1.1** (Oct 2025) — Updated color system to CSS variables, refined dark theme
- **v1.0** (Oct 2025) — Initial style guide creation
