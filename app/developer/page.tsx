'use client';

import { useState } from 'react';
import { SquaresEmbedReact } from '@squares-app/react';
import styles from './developer.module.css';

// Main site URL for cross-subdomain navigation
const mainSiteUrl = process.env.NODE_ENV === 'production'
  ? 'https://squares.vote/figures'
  : 'http://localhost:3000/figures';

export default function DeveloperPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const cardEmbedCode = `import { SquaresEmbedReact } from '@squares-app/react';

function MyComponent() {
  return (
    <SquaresEmbedReact
      variant="card"
      buttonText="Square Your Political Personality"
      align="center"
      maxWidth="600px"
      primaryColor="#4285f4"
      borderRadius="12px"
      shadow={true}
    />
  );
}`;

  const buttonEmbedCode = `import { SquaresEmbedReact } from '@squares-app/react';

function MyComponent() {
  return (
    <SquaresEmbedReact
      variant="button"
      buttonText="Square Your Political Personality"
      align="center"
      maxWidth="400px"
    />
  );
}`;

  return (
    <div className={styles.container}>
      <a href={mainSiteUrl} className={styles.backLink}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to squares.vote
      </a>
      <h1>squares.vote embed demo</h1>
      <p>Choose the embed style that works best for your website.</p>
      
      <div className={styles.demo}>
        <h2>Option 1: Card Embed (Recommended)</h2>
        <p>Self-contained with explanation and example. Best for first-time visitors.</p>
        <SquaresEmbedReact variant="card" />
        <details className={styles.codeDetails}>
          <summary>Show embed code</summary>
          <div className={styles.codeWrapper}>
            <button
              onClick={() => copyToClipboard(cardEmbedCode, 'card')}
              className={styles.copyButton}
              title="Copy to clipboard"
            >
              {copiedId === 'card' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
            <pre className={styles.code}>{cardEmbedCode}</pre>
          </div>
        </details>
      </div>

      <div className={styles.demo}>
        <h2>Live Demo - Card Variant</h2>
        <p>Full card with image, description, and button</p>
        <SquaresEmbedReact
          variant="card"
          buttonText="Square Your Political Personality"
        />
        <details className={styles.codeDetails}>
          <summary>Show embed code</summary>
          <div className={styles.codeWrapper}>
            <button
              onClick={() => copyToClipboard(cardEmbedCode, 'card')}
              className={styles.copyButton}
              title="Copy to clipboard"
            >
              {copiedId === 'card' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
            <pre className={styles.code}>{cardEmbedCode}</pre>
          </div>
        </details>
      </div>

      <div className={styles.demo}>
        <h2>Option 2: Button Only</h2>
        <p>Minimal embed for sites where context is already provided.</p>
        <SquaresEmbedReact variant="button" />
        <details className={styles.codeDetails}>
          <summary>Show embed code</summary>
          <div className={styles.codeWrapper}>
            <button
              onClick={() => copyToClipboard(buttonEmbedCode, 'button')}
              className={styles.copyButton}
              title="Copy to clipboard"
            >
              {copiedId === 'button' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              )}
            </button>
            <pre className={styles.code}>{buttonEmbedCode}</pre>
          </div>
        </details>
      </div>

      <div className={styles.features}>
        <h2>Customization Options</h2>
        <table className={styles.optionsTable}>
          <thead>
            <tr>
              <th>Option</th>
              <th>Type</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>variant</code></td>
              <td>string</td>
              <td><code>'card'</code></td>
              <td><code>'card'</code> or <code>'button'</code></td>
            </tr>
            <tr>
              <td><code>buttonText</code></td>
              <td>string</td>
              <td><code>'Square Your Political Personality'</code></td>
              <td>Custom button text</td>
            </tr>
            <tr>
              <td><code>align</code></td>
              <td>string</td>
              <td><code>'center'</code></td>
              <td><code>'left'</code>, <code>'center'</code>, or <code>'right'</code></td>
            </tr>
            <tr>
              <td><code>maxWidth</code></td>
              <td>string</td>
              <td><code>null</code></td>
              <td>Max width (e.g., <code>'600px'</code>)</td>
            </tr>
            <tr>
              <td><code>primaryColor</code></td>
              <td>string</td>
              <td><code>null</code></td>
              <td>Custom button color (hex)</td>
            </tr>
            <tr>
              <td><code>borderRadius</code></td>
              <td>string</td>
              <td><code>null</code></td>
              <td>Custom border radius</td>
            </tr>
            <tr>
              <td><code>shadow</code></td>
              <td>boolean</td>
              <td><code>true</code></td>
              <td>Show/hide shadow</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.features}>
        <h2>Features</h2>
        <ul>
          <li>✅ <strong>Self-contained:</strong> No dependencies, works anywhere</li>
          <li>✅ <strong>Responsive:</strong> Works on all screen sizes</li>
          <li>✅ <strong>Fast:</strong> Lightweight and optimized</li>
          <li>✅ <strong>Customizable:</strong> Full styling control</li>
          <li>✅ <strong>Isolated:</strong> Shadow DOM prevents conflicts</li>
          <li>✅ <strong>Privacy-focused:</strong> No tracking or data collection</li>
        </ul>
      </div>
    </div>
  );
}
