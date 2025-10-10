# Squares.vote Embed Guide

Complete guide for embedding Squares.vote widgets on your website.

---

## Quick Start

### React / Next.js (Recommended)

```bash
npm install @squares-app/react
```

```tsx
import { SquaresEmbedReact } from '@squares-app/react';

export default function MyPage() {
  return <SquaresEmbedReact variant="card" maxWidth="600px" />;
}
```

### Vanilla JavaScript

```html
<div id="squares-widget"></div>
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'squares-widget',
    variant: 'card',
    maxWidth: '600px',
    align: 'center'
  });
</script>
```

---

## React Component API

### Installation

```bash
npm install @squares-app/react
# or
yarn add @squares-app/react
# or
pnpm add @squares-app/react
```

### Basic Usage

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

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'card' \| 'button'` | `'card'` | Widget display style |
| `buttonText` | `string` | `'Map Your Squares'` | Custom button text |
| `align` | `'left' \| 'center' \| 'right'` | `'center'` | Horizontal alignment |
| `maxWidth` | `string` | `undefined` | Max width (e.g., `'600px'`, `'100%'`) |
| `primaryColor` | `string` | `undefined` | Custom button color (hex, e.g., `'#ff6b6b'`) |
| `borderRadius` | `string` | `undefined` | Custom border radius (e.g., `'16px'`) |
| `shadow` | `boolean` | `true` | Show/hide drop shadow |

### Advanced Examples

#### Custom Styling

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

#### Button Variant

```tsx
<SquaresEmbedReact
  variant="button"
  buttonText="Map Your Squares"
  align="left"
  maxWidth="400px"
/>
```

#### Dynamic Props

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

#### Next.js App Router

```tsx
'use client'; // Required for client components

import { SquaresEmbedReact } from '@squares-app/react';

export default function EmbedPage() {
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

### TypeScript Support

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

## Vanilla JavaScript API

### Installation

Add the script to your HTML:

```html
<script src="https://squares.vote/embed.js"></script>
```

### Basic Usage

```html
<!-- 1. Add container element -->
<div id="squares-widget"></div>

<!-- 2. Initialize widget -->
<script>
  SquaresEmbed.init({
    elementId: 'squares-widget',
    variant: 'card'
  });
</script>
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `elementId` | `string` | **required** | ID of container element |
| `variant` | `string` | `'card'` | `'card'` or `'button'` |
| `buttonText` | `string` | `'Map Your Squares'` | Custom button text |
| `align` | `string` | `'center'` | `'left'`, `'center'`, or `'right'` |
| `maxWidth` | `string` | `null` | Max width (e.g., `'600px'`) |
| `primaryColor` | `string` | `null` | Custom button color (hex) |
| `borderRadius` | `string` | `null` | Custom border radius |
| `shadow` | `boolean` | `true` | Show/hide shadow |

### Examples

#### Card Embed (Recommended)

```html
<div id="squares-widget"></div>
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'squares-widget',
    variant: 'card',
    align: 'center',
    maxWidth: '600px',
    primaryColor: '#4285f4',
    borderRadius: '12px',
    shadow: true
  });
</script>
```

#### Button Only

```html
<div id="squares-button"></div>
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'squares-button',
    variant: 'button',
    buttonText: 'Take the Quiz',
    align: 'center',
    maxWidth: '400px'
  });
</script>
```

#### Multiple Widgets

```html
<!-- Widget 1 -->
<div id="widget-1"></div>

<!-- Widget 2 -->
<div id="widget-2"></div>

<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'widget-1',
    variant: 'card'
  });

  SquaresEmbed.init({
    elementId: 'widget-2',
    variant: 'button'
  });
</script>
```

#### Cleanup

```javascript
// Destroy widget when no longer needed
SquaresEmbed.destroy('squares-widget');
```

---

## Features

### React Component Benefits

- ✅ **Proper lifecycle management** - Uses `useRef` and `useEffect`
- ✅ **No DOM conflicts** - Integrates cleanly with React's rendering
- ✅ **TypeScript support** - Full type safety
- ✅ **Auto-cleanup** - Automatically destroys widget on unmount
- ✅ **SSR-safe** - Works with Next.js and other SSR frameworks
- ✅ **Dynamic props** - Re-initializes when props change

### Vanilla JavaScript Benefits

- ✅ **No dependencies** - Works anywhere
- ✅ **Shadow DOM isolation** - Prevents style conflicts
- ✅ **Async initialization** - No React render conflicts
- ✅ **Multiple instances** - Multiple widgets per page
- ✅ **Lazy loading** - Iframe loads on demand

### General Features

- ✅ **Responsive** - Works on all screen sizes
- ✅ **Fast** - Lightweight and optimized
- ✅ **Customizable** - Full styling control
- ✅ **Privacy-focused** - No tracking or data collection
- ✅ **Accessible** - ARIA labels and semantic HTML

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

Control horizontal alignment:

```tsx
// React
<SquaresEmbedReact align="left" />
<SquaresEmbedReact align="center" />
<SquaresEmbedReact align="right" />
```

```javascript
// Vanilla JS
SquaresEmbed.init({
  elementId: 'squares-widget',
  align: 'center'
});
```

### Width Control

Set maximum width:

```tsx
// React
<SquaresEmbedReact maxWidth="600px" />
<SquaresEmbedReact maxWidth="100%" />
```

```javascript
// Vanilla JS
SquaresEmbed.init({
  elementId: 'squares-widget',
  maxWidth: '600px'
});
```

### Custom Colors

Match your brand:

```tsx
// React
<SquaresEmbedReact primaryColor="#ff6b6b" />
```

```javascript
// Vanilla JS
SquaresEmbed.init({
  elementId: 'squares-widget',
  primaryColor: '#4285f4'
});
```

### Border Radius

Customize corner rounding:

```tsx
// React
<SquaresEmbedReact borderRadius="16px" />
```

```javascript
// Vanilla JS
SquaresEmbed.init({
  elementId: 'squares-widget',
  borderRadius: '12px'
});
```

### Shadow

Toggle drop shadow:

```tsx
// React
<SquaresEmbedReact shadow={false} />
```

```javascript
// Vanilla JS
SquaresEmbed.init({
  elementId: 'squares-widget',
  shadow: false
});
```

---

## Framework Examples

### Next.js (App Router)

```tsx
'use client';

import { SquaresEmbedReact } from '@squares-app/react';

export default function Page() {
  return <SquaresEmbedReact variant="card" />;
}
```

### Next.js (Pages Router)

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

### WordPress

Add to your theme or use a custom HTML block:

```html
<div id="squares-widget"></div>
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'squares-widget',
    variant: 'card'
  });
</script>
```

### Webflow

1. Add an Embed element
2. Paste the vanilla JavaScript code
3. Publish

---

## Troubleshooting

### React: Widget not appearing

**Issue:** Component renders but widget doesn't show.

**Solution:** Ensure you're using the component in a client component:

```tsx
'use client'; // Add this at the top

import { SquaresEmbedReact } from '@squares-app/react';
```

### Vanilla JS: Multiple widgets conflict

**Issue:** Multiple widgets on same page interfere with each other.

**Solution:** Use unique element IDs:

```html
<div id="widget-1"></div>
<div id="widget-2"></div>

<script>
  SquaresEmbed.init({ elementId: 'widget-1', variant: 'card' });
  SquaresEmbed.init({ elementId: 'widget-2', variant: 'button' });
</script>
```

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

- **Live Demo:** [squares.vote/embed](https://squares.vote/embed)
- **GitHub:** [github.com/seanbhart/squares](https://github.com/seanbhart/squares)
- **Issues:** [github.com/seanbhart/squares/issues](https://github.com/seanbhart/squares/issues)
- **npm Package:** [@squares-app/react](https://www.npmjs.com/package/@squares-app/react)

---

## License

MIT License - Free to use for any purpose.
