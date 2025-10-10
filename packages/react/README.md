# @squares-app/react

Official React component for embedding [Squares.vote](https://squares.vote) widgets.

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
import { SquaresEmbedReact } from '@squares-app/react';

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

## Features

- ✅ **React-first:** Built specifically for React applications
- ✅ **TypeScript:** Full type safety
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

- [Squares.vote](https://squares.vote)
- [Embed Demo](https://squares.vote/embed)
- [GitHub](https://github.com/seanbhart/squares)
