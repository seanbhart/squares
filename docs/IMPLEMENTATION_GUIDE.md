# Squares Implementation Guide

> **Companion to STYLE_GUIDE.md** — Technical reference for developers implementing the Squares design system.

---

## Quick Start

```bash
# Install dependencies
npm install

# Development (main site)
npm run dev

# Development (miniapp)
# Access at /miniapp route
```

---

## Project Structure

```
squares/
├── app/                          # Next.js app directory
│   ├── assessment/              # Main assessment flow
│   ├── miniapp/                 # Farcaster miniapp
│   └── api/                     # API routes
├── components/
│   ├── assessment/              # Main site assessment components
│   │   ├── AssessmentQuestion.tsx
│   │   ├── ScrollAssessment.tsx
│   │   └── ResultsSection.tsx
│   ├── miniapp/                 # Miniapp-specific components
│   │   ├── AssessmentSlides.tsx
│   │   ├── Leaderboard.tsx
│   │   └── MiniAppClient.tsx
│   └── icons.tsx                # SVG icon components
├── lib/
│   └── tamer-config.ts          # Core configuration
└── packages/
    └── react/                   # Embeddable widget package
        └── src/SquaresWidget.tsx
```

---

## Core Configuration

### `lib/tamer-config.ts`

This is the **single source of truth** for the TAME-R framework.

```typescript
// Color spectrum (0-6 scale)
export const COLOR_RAMP = [
  '#8B5CF6', // Purple - 0
  '#3B82F6', // Blue - 1
  '#10B981', // Green - 2
  '#EAB308', // Yellow - 3 (center/balanced)
  '#F97316', // Orange - 4
  '#EF4444', // Red - 5
  '#171717', // Black - 6
];

// Policy dimensions
export const POLICIES = [
  { key: 'trade', label: 'Trade' },
  { key: 'abortion', label: 'Abortion' },
  { key: 'migration', label: 'Migration / Immigration' },
  { key: 'economics', label: 'Economics' },
  { key: 'rights', label: 'Rights (civil liberties)' },
];

// Position labels for each dimension
export const POSITION_LABELS: Record<string, string[]> = {
  trade: [
    'free trade',
    'minimal tariffs',
    'selective trade agreements',
    'balanced tariffs',
    'strategic protections',
    'heavy tariffs',
    'closed economy'
  ],
  // ... (see full config in file)
};

// Helper functions
export function getScoreColor(policyKey: string, value: number): string {
  return COLOR_RAMP[value];
}

export function getEmojiSquare(value: number): string {
  const emojis = ['🟪', '🟦', '🟩', '🟨', '🟧', '🟥', '⬛️'];
  return emojis[value] || '🟨';
}
```

**Usage**: Import these helpers in any component that needs to display political positions.

---

## Component Patterns

### 1. Assessment Question Component

**Purpose**: Display a single dimension question with 7 options.

```typescript
interface AssessmentQuestionProps {
  policyKey: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  hasBeenTouched: boolean;
}
```

**Key features**:
- Displays colored badge with dimension letter (T, A, M, E, R)
- Shows 7 option buttons in a row (desktop) or 3-1-3 grid (mobile)
- Center option (index 3) has dashed border by default, solid on hover/select
- Scale labels at bottom: "Minimal intervention → Total control"

**Implementation notes**:
```tsx
// Center option styling
const isCenterOption = valueIndex === 3;

<button
  className={styles.option}
  data-selected={isSelected}
  style={{
    borderStyle: isCenterOption && !isSelected ? 'dashed' : 'solid'
  }}
>
  <ColorSquare value={valueIndex} />
  <span>{optionLabel}</span>
</button>
```

### 2. Results Display Component

**Purpose**: Show the final TAMER squares with copy functionality.

```typescript
interface ResultsSectionProps {
  answers: Record<number, number>; // dimension index -> value (0-6)
  onStartOver?: () => void;
}
```

**Key features**:
- Displays 5 colored squares with letters
- Shows dimension labels below squares
- Emoji signature with copy-to-clipboard
- Start Over button

**Emoji format**:
```typescript
const emojiSignature = POLICIES
  .map(p => getEmojiSquare(answers[policyIndex]))
  .join('');
// Result: "🟦🟩🟦🟩🟦"
```

**Copy format** (with username):
```typescript
const textToCopy = username 
  ? `${emojiSignature} @${username}`
  : emojiSignature;
// Result: "🟦🟩🟦🟩🟦 @username"
```

### 3. Miniapp-Specific Patterns

The miniapp uses a slide-based navigation:

```typescript
enum Step {
  Introduction = 0,
  SelectDimension = 1,
  QuestionSlide = 2,
  Results = 3,
}

const [step, setStep] = useState<Step>(0);
```

**Farcaster integration**:
```typescript
import { sdk } from '@farcaster/miniapp-sdk';

// Get user info
const context = await sdk.context;
const userInfo = context.user;

// Save spectrum
await fetch('/api/farcaster/spectrum', {
  method: 'POST',
  body: JSON.stringify({
    fid: userInfo.fid,
    username: userInfo.username,
    spectrum: { trade: 1, abortion: 2, ... },
    is_public: true
  })
});
```

---

## CSS Module Patterns

### Using CSS Variables

Define in your module:
```css
.container {
  --foreground: #ffffff;
  --foreground-secondary: #e5e5e5;
  --foreground-muted: #a3a3a3;
  
  color: var(--foreground);
}
```

### Data Attributes for State

Better than multiple class names:

```tsx
<button
  className={styles.option}
  data-selected={isSelected}
  data-tentative={isTentative}
  data-center={isCenterOption}
>
```

```css
.option[data-selected="true"] {
  border: 2px solid rgba(255, 255, 255, 0.4);
}

.option[data-tentative="true"] {
  opacity: 0.7;
}

.option:nth-child(4),
.option[data-center="true"] {
  border-style: dashed;
}
```

### Responsive Grid Pattern

```css
/* Desktop: 7 columns */
.scaleContainer {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.75rem;
}

/* Mobile: 3-1-3 pattern */
@media (max-width: 768px) {
  .scaleContainer {
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
  }
  
  /* Center option on row 2, middle column */
  .option:nth-child(4) {
    grid-column: 2 / 3;
    grid-row: 2;
  }
  
  /* Last 3 on row 3 */
  .option:nth-child(5) { grid-row: 3; grid-column: 1; }
  .option:nth-child(6) { grid-row: 3; grid-column: 2; }
  .option:nth-child(7) { grid-row: 3; grid-column: 3; }
}
```

### Sticky Positioning

For miniapp results header:

```css
.signatureBox {
  position: sticky;
  top: 1rem;
  z-index: 100;
  backdrop-filter: blur(20px);
  background: rgba(26, 26, 26, 0.95);
}
```

---

## State Management Patterns

### Assessment State

```typescript
// Main site - object with all dimensions
const [answers, setAnswers] = useState<Record<number, number>>({});

// Update single dimension
const handleAnswerChange = (dimensionIndex: number, value: number) => {
  setAnswers(prev => ({ ...prev, [dimensionIndex]: value }));
};

// Check completion
const isComplete = Object.keys(answers).length === POLICIES.length;
```

### Miniapp State (per-dimension flow)

```typescript
interface SpectrumState {
  trade: number | null;
  abortion: number | null;
  migration: number | null;
  economics: number | null;
  rights: number | null;
}

const [spectrum, setSpectrum] = useState<SpectrumState>({
  trade: null,
  abortion: null,
  migration: null,
  economics: null,
  rights: null,
});

// Update single dimension
const handleSelect = (value: number) => {
  const policyKey = POLICIES[currentDimension].key;
  setSpectrum(prev => ({ ...prev, [policyKey]: value }));
};
```

### Copy State Management

```typescript
const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(textToCopy);
    setCopyState('copied');
    setTimeout(() => setCopyState('idle'), 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
  }
};
```

---

## API Integration

### Spectrum Endpoints

**GET** `/api/farcaster/spectrum?fid={fid}`
```typescript
// Response
{
  spectrum: {
    trade_score: 1,
    abortion_score: 2,
    migration_score: 1,
    economics_score: 2,
    rights_score: 1
  },
  is_public: true
}
```

**POST** `/api/farcaster/spectrum`
```typescript
// Request
{
  fid: 4612,
  username: "username",
  displayName: "Display Name",
  pfpUrl: "https://...",
  spectrum: {
    trade: 1,
    abortion: 2,
    migration: 1,
    economics: 2,
    rights: 1
  },
  is_public: true
}
```

**GET** `/api/farcaster/leaderboard?sortBy=recent&limit=50`
```typescript
// Response
{
  leaderboard: [
    {
      fid: 4612,
      username: "username",
      display_name: "Display Name",
      pfp_url: "https://...",
      trade_score: 1,
      abortion_score: 2,
      migration_score: 1,
      economics_score: 2,
      rights_score: 1,
      created_at: "2025-01-01T00:00:00Z"
    },
    // ...
  ]
}
```

---

## Accessibility Checklist

### Required ARIA Labels

```tsx
<button
  aria-label={`Select ${optionLabel} for ${dimensionLabel}`}
  aria-pressed={isSelected}
>
  {/* ... */}
</button>

<div role="group" aria-labelledby="dimension-title">
  <h2 id="dimension-title">{dimensionLabel}</h2>
  {/* options */}
</div>
```

### Keyboard Navigation

- **Tab**: Move between options
- **Enter/Space**: Select option
- **Arrow keys** (optional): Navigate between options in a row

```tsx
const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
  if (e.key === 'ArrowRight' && index < 6) {
    // Focus next option
  } else if (e.key === 'ArrowLeft' && index > 0) {
    // Focus previous option
  }
};
```

### Color Contrast

- Text on dark background: Use `#ffffff` or `#e5e5e5`
- Text on light buttons: Use `#171717` or `#212121`
- Minimum contrast ratio: **4.5:1** for body text, **3:1** for large text

### Focus Indicators

```css
.interactive:focus-visible {
  outline: 2px solid #3B82F6;
  outline-offset: 2px;
}
```

---

## Performance Optimization

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Squares logo"
  width={80}
  height={80}
  priority // For above-fold images
/>
```

### Dynamic Imports

```tsx
// For miniapp SDK (client-side only)
import dynamic from 'next/dynamic';

const MiniAppClient = dynamic(
  () => import('@/components/miniapp/MiniAppClient'),
  { ssr: false }
);
```

### Memoization

```tsx
import { useMemo, useCallback } from 'react';

// Memoize expensive calculations
const emojiSignature = useMemo(() => {
  return POLICIES.map(p => getEmojiSquare(spectrum[p.key])).join('');
}, [spectrum]);

// Memoize callbacks
const handleCopy = useCallback(async () => {
  await navigator.clipboard.writeText(emojiSignature);
}, [emojiSignature]);
```

---

## Testing Guidelines

### Component Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import AssessmentQuestion from './AssessmentQuestion';

test('selects option on click', () => {
  const onChange = jest.fn();
  render(
    <AssessmentQuestion
      policyKey="trade"
      label="Trade"
      value={3}
      onChange={onChange}
    />
  );
  
  const option = screen.getByText('balanced tariffs');
  fireEvent.click(option);
  
  expect(onChange).toHaveBeenCalledWith(3);
});
```

### Visual Regression Testing

Use tools like Chromatic or Percy to catch unintended visual changes:

```bash
npm run build-storybook
npx chromatic --project-token=<token>
```

### Accessibility Testing

```bash
npm install -D @axe-core/playwright
```

```typescript
import { injectAxe, checkA11y } from 'axe-playwright';

test('assessment page is accessible', async ({ page }) => {
  await page.goto('/assessment');
  await injectAxe(page);
  await checkA11y(page);
});
```

---

## Common Pitfalls

### ❌ Don't hardcode spectrum values

```tsx
// Bad
const color = value === 0 ? '#8B5CF6' : '#3B82F6';

// Good
const color = getScoreColor(policyKey, value);
```

### ❌ Don't forget mobile grid layout

```tsx
// Bad - assumes 7 columns always
{options.map(option => <Option />)}

// Good - uses CSS grid that responds to breakpoints
<div className={styles.scaleContainer}>
  {options.map((option, index) => (
    <Option key={index} />
  ))}
</div>
```

### ❌ Don't copy emojis with spaces

```tsx
// Bad
const emojis = squares.join(' '); // "🟦 🟩 🟦"

// Good
const emojis = squares.join(''); // "🟦🟩🟦"
```

### ❌ Don't forget username in copy

```tsx
// Bad
await clipboard.writeText(emojis);

// Good
const text = username ? `${emojis} @${username}` : emojis;
await clipboard.writeText(text);
```

### ❌ Don't use margin-top on buttons inside flex containers

```tsx
// Bad - causes inconsistent spacing
.button {
  margin-top: 1rem;
}

// Good - use gap on parent
.buttonContainer {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
```

---

## Deployment

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Build Commands

```bash
# Main site
npm run build

# React widget package
cd packages/react
npm run build
npm publish  # Bump version first
```

### Vercel Configuration

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

---

## Package Versioning

The `@squares-app/react` widget follows semantic versioning:

- **Patch** (2.5.x): Bug fixes, style tweaks
- **Minor** (2.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking API changes

```bash
# After changes
cd packages/react
npm version patch  # or minor, major
npm run build
npm publish
```

Then update main package.json:
```json
{
  "dependencies": {
    "@squares-app/react": "^2.5.7"
  }
}
```

---

## Resources

- **Style Guide**: [STYLE_GUIDE.md](./STYLE_GUIDE.md)
- **Miniapp Setup**: [FARCASTER_MINIAPP_SETUP.md](./FARCASTER_MINIAPP_SETUP.md)
- **Next.js Docs**: https://nextjs.org/docs
- **Farcaster SDK**: https://docs.farcaster.xyz/developers/miniapp-sdk

---

## Questions?

For implementation questions or bug reports, please open an issue or reach out to the development team.

**Last Updated**: October 2025
