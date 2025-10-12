# Landing Page Design - Scroll-Snap Experience

## Overview

The new landing page uses a scroll-snap design to create a captivating, experiential introduction to TAME-R Squares. Each full-viewport section reveals one concept at a time, building understanding progressively.

## Structure

### Section 1: The Problem (3 seconds attention)
**Message:** Political labels are broken.

**Visual:**
- Political labels (Liberal, Conservative, etc.) appear and dissolve/fragment
- Creates immediate recognition of the problem

**Purpose:** Establish pain point that visitors recognize

### Section 2: The Reality (5 seconds)
**Message:** You're not one word. You're five dimensions.

**Visual:**
- 5 colored squares appear with letters T-A-M-E-R
- Each square pulses and can be hovered
- Color-coded squares build visual vocabulary

**Purpose:** Introduce the TAME-R framework visually before explaining it

### Section 3: The Color Scale (Interactive)
**Message:** Each dimension uses a 7-color spectrum from minimal to total government control.

**Visual:**
- 7-color gradient display (purple → black)
- Interactive dimension selector (T-A-M-E-R buttons)
- Shows the scale for selected dimension with labels
- Example: Trade scale from "free trade" to "closed economy"

**Purpose:**
- Teach the color language before using it
- Show what each color represents
- Make the subsequent comparison meaningful

### Section 4: Show, Don't Tell (Interactive)
**Message:** Pick two figures you admire - see how they differ

**Visual:**
- Grid of 12 historical figures with emoji icons
- Click to select 2 figures
- Shows side-by-side comparison with actual colored squares
- TAME-R pattern for each figure displayed with labels
- Demonstrates that even admired figures differ across dimensions

**Purpose:**
- Interactive engagement
- Social proof (if they're mapped, it's interesting)
- Demonstrates complexity without overwhelming
- NOW readers understand what the colors mean!

### Sections 5-9: Assessment (Seamless Flow)
**Message:** Answer each dimension question

**Visual:**
- One full-screen question per dimension
- Progress dots at top (1 of 5, 2 of 5, etc.)
- 7 colored options to choose from
- Auto-advances to next question on selection
- "Scroll down for next dimension" hint

**Purpose:** 
- Capture user's position on all 5 dimensions
- Maintain engagement through the entire flow
- No friction - just keep scrolling

### Section 10: Results
**Message:** Your Squares

**Visual:**
- 5 colored squares with T-A-M-E-R labels
- Emoji signature: 🟪🟦🟩🟨🟧
- Copy to clipboard button
- "Start Over" and "See Detailed View" actions

**Purpose:** 
- Show completed pattern
- Enable easy sharing
- Provide next steps

## Technical Implementation

### Scroll-Snap CSS
```css
.container {
  scroll-snap-type: y mandatory;
  overflow-y: scroll;
  height: 100vh;
  scroll-behavior: smooth;
}

.section {
  height: 100vh;
  scroll-snap-align: start;
  scroll-snap-stop: always;
}
```

### Features

1. **Keyboard Navigation:** Arrow keys navigate between sections
2. **Smooth Scrolling:** Native CSS smooth-scroll
3. **Mobile Optimized:** Touch-friendly scroll-snap
4. **Animations:** Intersection Observer triggers animations when sections appear
5. **Theme Support:** Inherits from global theme settings

## User Flow

```
Landing Page (/) - Single Seamless Scroll Experience
  ↓ Section 1: See problem (labels are broken)
  ↓ Section 2: See solution (5 dimensions)
  ↓ Section 3: Learn color scale (interactive)
  ↓ Section 4: Compare figures (interactive)
  ↓ Section 5: Trade (select from 7 options) ← Assessment begins
  ↓ Section 6: Abortion (select from 7 options)
  ↓ Section 7: Migration (select from 7 options)
  ↓ Section 8: Economics (select from 7 options)
  ↓ Section 9: Rights (select from 7 options)
  ↓ Section 10: Results (copy emoji pattern) 🟪🟦🟩🟨🟧
  ↓ Click "See Detailed View" (optional)
Assessment Detail Page (/assess) - Full comparison interface
  ↓ Compare with historical figures
  ↓ See timelines and evolution
Share Results
```

## File Structure

```
components/
├── landing/
│   ├── LandingPage.tsx                  # Main container (includes assessment)
│   ├── LandingPage.module.css           # Scroll-snap container styles
│   └── sections/
│       ├── ProblemSection.tsx           # Section 1: Labels are broken
│       ├── ProblemSection.module.css
│       ├── RealitySection.tsx           # Section 2: 5 dimensions
│       ├── RealitySection.module.css
│       ├── ColorScaleSection.tsx        # Section 3: Color scale explainer
│       ├── ColorScaleSection.module.css
│       └── ShowDontTellSection.tsx      # Section 4: Figure comparison
│           └── ShowDontTellSection.module.css
└── assessment/
    ├── AssessmentQuestion.tsx           # Single question component (Sections 5-9)
    ├── AssessmentQuestion.module.css
    ├── ResultsSection.tsx               # Results display (Section 10)
    ├── ResultsSection.module.css
    ├── ScrollAssessment.tsx             # Standalone assessment page (/map)
    └── ScrollAssessment.module.css

app/
├── page.tsx                             # Home route → LandingPage (full experience)
├── map/
│   └── page.tsx                         # Direct to assessment → ScrollAssessment
└── assess/
    ├── page.tsx                         # Detailed view with figures/timelines
    └── assess.module.css
```

## Design Principles

### 1. **Experiential Over Informational**
- Show, don't tell
- Interactive before explanatory
- Visual before textual

### 2. **Progressive Disclosure**
- One concept per section
- Build complexity gradually
- Never overwhelm

### 3. **Frictionless Flow**
- NO "Start Assessment" button needed
- Education flows directly into action
- Users are already engaged when they start answering
- Removes decision fatigue ("Should I take this?")

### 4. **Avoiding Political Triggers**
- No left/right positioning
- No partisan examples in hero
- Figures presented as individuals, not categories

### 5. **Minimal Cognitive Load**
- Large fonts, simple messages
- Generous whitespace
- Clear visual hierarchy

## Key Innovation: Seamless Assessment Integration

Traditional landing pages follow this pattern:
```
Education → CTA Button → New Page → Assessment
```

We eliminate the friction:
```
Education → Keep Scrolling → Assessment → Results
```

**Benefits:**
- **Higher completion rates:** Users are already engaged
- **No bounce:** No opportunity to leave between education and action
- **Natural progression:** Feels like one continuous experience
- **Mobile-friendly:** Scroll is the most natural mobile gesture
- **Maintains momentum:** No interruption in the user journey

## Animations

### Section 1 (Problem)
```css
@keyframes dissolve {
  0%   { opacity: 1; transform: scale(1); }
  50%  { opacity: 0.5; transform: scale(1.1) rotate(5deg); }
  100% { opacity: 0.2; transform: scale(0.9); filter: blur(3px); }
}
```

### Section 2 (Reality)
```css
@keyframes slideInScale {
  0%   { opacity: 0; transform: translateY(30px) scale(0.8); }
  60%  { transform: translateY(-10px) scale(1.05); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Section 3 (Show Don't Tell)
- Hover effects on figure cards
- Selection animations
- Fade-in comparison message

## Accessibility

- **Keyboard Navigation:** Full keyboard support
- **Screen Readers:** Proper ARIA labels
- **Color Contrast:** Meets WCAG AA standards
- **Reduced Motion:** Respects `prefers-reduced-motion`

## Performance

- **Lazy Loading:** Sections render on-demand
- **CSS-Only Animations:** No JS animation overhead
- **Optimized Images:** Emoji icons (no image assets)
- **Bundle Size:** ~8KB additional (gzipped)

## Future Enhancements

### Possible Additions:
1. **Progress Indicator:** Dots showing section progress
2. **Auto-Advance:** Gentle nudge to scroll after inactivity
3. **Skip to Assessment:** Quick link for returning users
4. **A/B Testing Variants:**
   - Different section orders
   - Alternative copy
   - Different figure selections

### Metrics to Track:
- Scroll depth (how far users get)
- Time on each section
- Click-through rate to /assess
- Assessment completion rate

## Iteration Notes

### Decisions Made:
1. ✅ Chose scroll-snap over scatter plot (avoids left/right triggers)
2. ✅ 4 sections (Problem → Reality → Demo → CTA)
3. ✅ Interactive figure selection over passive viewing
4. ✅ Full viewport sections (no partial reveals)

### Next Steps:
1. Test with real users
2. Measure engagement metrics
3. A/B test variations
4. Optimize based on data

## Mobile Considerations

- Touch-friendly scroll
- Larger tap targets (min 44×44px)
- Readable font sizes (16px minimum)
- Reduced animation complexity
- Optimized grid layouts (fewer columns)

---

## Quick Start

To test the landing page:

```bash
npm run dev
# Navigate to http://localhost:3000
```

To go directly to the assessment:
```bash
# Navigate to http://localhost:3000/assess
```
