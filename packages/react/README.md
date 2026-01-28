# @squares-app/react

Official React component for embedding [squares.vote](https://squares.vote) widgets.

## Version 3.0.0 - CORE Framework Migration

🚨 **Breaking Changes** - This major version introduces the CORE political spectrum framework:

### What Changed
- **4 dimensions instead of 5**: The new CORE framework uses Civil Rights, Openness, Redistribution, and Ethics
- **0-5 scale instead of 0-6**: Each dimension now uses a 6-point scale (0-5) instead of 7-point (0-6)
- **New spectrum keys**: `CoreSpectrum` uses `civilRights`, `openness`, `redistribution`, `ethics` instead of legacy TAMER keys
- **6 colors instead of 7**: The color ramp has been updated to match the new scale

### Migration Guide from v2 to v3

If you're upgrading from v2.x, you'll need to update your spectrum data structure:

**Before (v2 - TAMER):**
```typescript
const spectrum = {
  trade: 3,      // 0-6 scale
  abortion: 2,   // 0-6 scale
  migration: 4,  // 0-6 scale
  economics: 5,  // 0-6 scale
  rights: 1      // 0-6 scale
};
```

**After (v3 - CORE):**
```typescript
import type { CoreSpectrum } from '@squares-app/react';

const spectrum: CoreSpectrum = {
  civilRights: 2,      // 0-5 scale: Liberty to Authority
  openness: 3,         // 0-5 scale: Global to National
  redistribution: 4,   // 0-5 scale: Market to Social
  ethics: 1            // 0-5 scale: Progressive to Traditional
};
```

### New Exports in v3

The package now exports the CORE configuration:

```typescript
import {
  CORE_DIMENSIONS,      // Array of dimension metadata
  COLOR_RAMP,           // 6-color array for the 0-5 scale
  POSITION_LABELS,      // Detailed labels for each position
  getEmojiSquare,       // Convert value to emoji (🟪🟦🟩🟨🟧🟥)
  getCoreCode,          // Generate 4-letter code (e.g., "LGMP")
  type CoreSpectrum,    // TypeScript type for spectrum data
  type CoreDimensionKey // TypeScript type for dimension keys
} from '@squares-app/react';
```

## Installation

```bash
npm install @squares-app/react
# or
yarn add @squares-app/react
# or
pnpm add @squares-app/react
```

## Usage

### Basic Example

```tsx
import { SquaresEmbedReact } from '@squares-app/react';

function App() {
  return (
    <div>
      <h1>My Political Views</h1>
      <SquaresEmbedReact variant="card" />
    </div>
  );
}
```

### With Customization

```tsx
import { SquaresEmbedReact, type CoreSpectrum } from '@squares-app/react';

function App() {
  return (
    <SquaresEmbedReact
      variant="card"
      buttonText="Take the Quiz"
      align="center"
      maxWidth="600px"
      primaryColor="#ff6b6b"
      borderRadius="16px"
      shadow={true}
    />
  );
}
```

### Using CORE Configuration

```tsx
import {
  SquaresEmbedReact,
  CORE_DIMENSIONS,
  COLOR_RAMP,
  getEmojiSquare,
  getCoreCode,
  type CoreSpectrum
} from '@squares-app/react';

function MyComponent() {
  const mySpectrum: CoreSpectrum = {
    civilRights: 2,
    openness: 3,
    redistribution: 4,
    ethics: 1
  };

  // Generate a 4-letter code like "LGST"
  const code = getCoreCode(mySpectrum);

  // Get emoji representation
  const emoji = getEmojiSquare(mySpectrum.civilRights); // 🟩

  return (
    <div>
      <h2>My Political Position: {code}</h2>
      <SquaresEmbedReact variant="card" />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'card' \| 'button'` | `'card'` | Widget variant |
| `buttonText` | `string` | `'Map Your Squares'` | Custom button text |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Alignment |
| `maxWidth` | `string` | `undefined` | Max width (e.g., `'600px'`) |
| `primaryColor` | `string` | `undefined` | Custom button color (hex) |
| `borderRadius` | `string` | `undefined` | Custom border radius |
| `shadow` | `boolean` | `true` | Show/hide shadow |

## The CORE Framework

The CORE framework represents political positions across four key dimensions:

| Dimension | Low (0-2) | High (3-5) | Description |
|-----------|-----------|------------|-------------|
| **C**ivil Rights | Liberty (L) | Authority (A) | Government constraint on personal freedoms |
| **O**penness | Global (G) | National (N) | Supranational integration vs national sovereignty |
| **R**edistribution | Market (M) | Social (S) | Market allocation vs state redistribution |
| **E**thics | Progressive (P) | Traditional (T) | Change-seeking vs preservation-seeking |

Each dimension uses a **0-5 scale** with detailed position labels and a 6-color visual representation.

## Features

- ✅ **React-first:** Built specifically for React applications
- ✅ **TypeScript:** Full type safety with CORE framework types
- ✅ **CORE framework:** 4-dimension political spectrum (C, O, R, E)
- ✅ **Lifecycle-aware:** Properly integrates with React's lifecycle
- ✅ **Auto-cleanup:** Automatically cleans up on unmount
- ✅ **No conflicts:** Uses refs to avoid DOM manipulation conflicts
- ✅ **SSR-safe:** Works with Next.js and other SSR frameworks

## Advanced Usage

### With Next.js

```tsx
'use client'; // Required for client components

import { SquaresEmbedReact } from '@squares/react';

export default function MyPage() {
  return <SquaresEmbedReact variant="card" />;
}
```

### Dynamic Props

```tsx
import { useState } from 'react';
import { SquaresEmbedReact } from '@squares/react';

function App() {
  const [variant, setVariant] = useState<'card' | 'button'>('card');

  return (
    <div>
      <button onClick={() => setVariant(variant === 'card' ? 'button' : 'card')}>
        Toggle Variant
      </button>
      <SquaresEmbedReact variant={variant} />
    </div>
  );
}
```

## License

MIT

## Links

- [squares.vote](https://squares.vote)
- [Embed Demo](https://squares.vote/developer)
- [GitHub](https://github.com/seanbhart/squares)
