# @squares-app/react

Official React component for embedding squares.vote widgets with a complete interactive modal experience.

---

## Installation

```bash
npm install @squares-app/react
```
```bash
yarn add @squares-app/react
```
```bash
pnpm add @squares-app/react
```

---

## Quick Start

```tsx
import { SquaresEmbedReact } from '@squares-app/react';

export default function MyPage() {
  return <SquaresEmbedReact variant="card" maxWidth="600px" />;
}
```

When users click the button or card, a **full interactive modal** opens with:
- 4-step guided experience
- TAME-R framework introduction
- Historical figure examples
- Interactive sliders for all 5 policy dimensions
- Results with copy-to-clipboard and link to squares.vote

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'card' \| 'button'` | `'card'` | Widget display style |
| `buttonText` | `string` | `'Map Your Squares'` | Custom button text |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Horizontal alignment |
| `maxWidth` | `string` | `undefined` | Max width (e.g., `'600px'`, `'100%'`) |
| `primaryColor` | `string` | `undefined` | Custom button color (hex, e.g., `'#ff6b6b'`) |
| `borderRadius` | `string` | `undefined` | Custom border radius (e.g., `'16px'`) |
| `shadow` | `boolean` | `true` | Show/hide drop shadow |

---

## Examples

### Basic Card

```tsx
import { SquaresEmbedReact } from '@squares-app/react';

function App() {
  return (
    <div>
      <h1>Map Your Political Positions</h1>
      <SquaresEmbedReact variant="card" />
    </div>
  );
}
```

### Custom Styling

```tsx
<SquaresEmbedReact
  variant="card"
  buttonText="Take the Quiz"
  align="center"
  maxWidth="600px"
  primaryColor="#4285f4"
  borderRadius="16px"
  shadow={true}
/>
```

### Button Variant

```tsx
<SquaresEmbedReact
  variant="button"
  buttonText="Map Your Squares"
  align="left"
  maxWidth="400px"
/>
```

### Dynamic Props

```tsx
import { useState } from 'react';
import { SquaresEmbedReact } from '@squares-app/react';

function App() {
  const [variant, setVariant] = useState<'card' | 'button'>('card');

  return (
    <div>
      <button onClick={() => setVariant(v => v === 'card' ? 'button' : 'card')}>
        Toggle Variant
      </button>
      <SquaresEmbedReact variant={variant} />
    </div>
  );
}
```

---

## Framework Examples

### Next.js App Router

```tsx
'use client'; // Required for client components

import { SquaresEmbedReact } from '@squares-app/react';

export default function DeveloperPage() {
  return (
    <main>
      <SquaresEmbedReact 
        variant="card" 
        maxWidth="800px" 
        align="center"
      />
    </main>
  );
}
```

### Next.js Pages Router

```tsx
import { SquaresEmbedReact } from '@squares-app/react';

export default function Page() {
  return <SquaresEmbedReact variant="card" />;
}
```

### Remix

```tsx
import { SquaresEmbedReact } from '@squares-app/react';

export default function Index() {
  return <SquaresEmbedReact variant="card" />;
}
```

### Gatsby

```tsx
import { SquaresEmbedReact } from '@squares-app/react';

const IndexPage = () => {
  return <SquaresEmbedReact variant="card" />;
};

export default IndexPage;
```

### Astro

```astro
---
import { SquaresEmbedReact } from '@squares-app/react';
---

<SquaresEmbedReact client:load variant="card" />
```

---

## TypeScript Support

Full TypeScript support with exported types:

```tsx
import { SquaresEmbedReact, SquaresEmbedProps } from '@squares-app/react';

const config: SquaresEmbedProps = {
  variant: 'card',
  maxWidth: '600px',
  primaryColor: '#ff6b6b'
};

function App() {
  return <SquaresEmbedReact {...config} />;
}
```

---

## Variants

### Card Embed

Self-contained card with explanation and example. **Best for first-time visitors.**

Features:
- Explanation of TAME-R framework
- Visual example (e.g., Martin Luther King Jr.)
- Call-to-action button
- Recommended for landing pages and blog posts

### Button Only

Minimal embed for sites where context is already provided. **Best for compact layouts.**

Features:
- Just the call-to-action button
- Smaller footprint
- Recommended for sidebars and navigation

---

## Styling

### Alignment

```tsx
<SquaresEmbedReact align="left" />
<SquaresEmbedReact align="center" />
<SquaresEmbedReact align="right" />
```

### Width Control

```tsx
<SquaresEmbedReact maxWidth="600px" />
<SquaresEmbedReact maxWidth="100%" />
```

### Custom Colors

```tsx
<SquaresEmbedReact primaryColor="#ff6b6b" />
<SquaresEmbedReact primaryColor="#4285f4" />
```

### Border Radius

```tsx
<SquaresEmbedReact borderRadius="16px" />
<SquaresEmbedReact borderRadius="8px" />
```

### Shadow

```tsx
<SquaresEmbedReact shadow={true} />
<SquaresEmbedReact shadow={false} />
```

---

## Features

- ✅ **Complete interactive experience** - Full 4-step modal widget
- ✅ **Self-contained** - No external dependencies or iframes
- ✅ **No API calls** - All content bundled in the package
- ✅ **Proper lifecycle management** - Uses `useRef` and `useEffect`
- ✅ **No DOM conflicts** - Integrates cleanly with React's rendering
- ✅ **TypeScript support** - Full type safety
- ✅ **Auto-cleanup** - Automatically destroys widget on unmount
- ✅ **SSR-safe** - Works with Next.js and other SSR frameworks
- ✅ **Responsive** - Works on all screen sizes
- ✅ **Customizable** - Full styling control
- ✅ **Privacy-focused** - No tracking or data collection

---

## Troubleshooting

### Widget not appearing

**Issue:** Component renders but widget doesn't show.

**Solution:** Ensure you're using the component in a client component (Next.js App Router):

```tsx
'use client'; // Add this at the top

import { SquaresEmbedReact } from '@squares-app/react';
```

### Modal not opening

**Issue:** Clicking the button/card doesn't open the modal.

**Solution:** Ensure JavaScript is enabled and there are no console errors. The component uses React state to manage the modal visibility.

### Styling not applying

**Issue:** Custom colors or styles not showing.

**Solution:** Ensure you're passing valid CSS values:

```tsx
// ✅ Correct
<SquaresEmbedReact primaryColor="#ff6b6b" />

// ❌ Incorrect
<SquaresEmbedReact primaryColor="red" />
```

### Widget too wide/narrow

**Issue:** Widget doesn't fit your layout.

**Solution:** Use `maxWidth` and `align`:

```tsx
<SquaresEmbedReact 
  maxWidth="600px" 
  align="center" 
/>
```

---

## Support

- **Live Demo:** [squares.vote/developer](https://squares.vote/developer)
- **GitHub:** [github.com/seanbhart/squares](https://github.com/seanbhart/squares)
- **Issues:** [github.com/seanbhart/squares/issues](https://github.com/seanbhart/squares/issues)
- **npm Package:** [@squares-app/react](https://www.npmjs.com/package/@squares-app/react)

---

## License

MIT License - Free to use for any purpose.
