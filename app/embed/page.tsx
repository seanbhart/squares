'use client';

import { useState } from 'react';
import SquaresEmbed from '@/components/embed/SquaresEmbed';
import styles from './embed.module.css';

export default function EmbedPage() {
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

  const cardEmbedCode = `<!-- Add this where you want the card to appear -->
<div id="squares-widget"></div>

<!-- Add this before closing </body> tag -->
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'squares-widget',
    variant: 'card',
    buttonText: 'Map Your Squares'
  });
</script>`;

  const buttonEmbedCode = `<!-- Add this where you want the button to appear -->
<div id="squares-widget"></div>

<!-- Add this before closing </body> tag -->
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresEmbed.init({
    elementId: 'squares-widget',
    variant: 'button',
    buttonText: 'Map Your Squares'
  });
</script>`;

  return (
    <div className={styles.container}>
      <a href="/" className={styles.backLink}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Back to Squares.vote
      </a>
      <h1>Squares.vote Embed Demo</h1>
      <p>Choose the embed style that works best for your website.</p>
      
      <div className={styles.demo}>
        <h2>Option 1: Card Embed (Recommended)</h2>
        <p>Self-contained with explanation and example. Best for first-time visitors.</p>
        <div className={styles.preview}>
          <SquaresEmbed variant="card" />
        </div>
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
        <div className={styles.preview}>
          <SquaresEmbed variant="button" />
        </div>
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
        <h2>Features</h2>
        <ul>
          <li>✅ <strong>Self-contained:</strong> No dependencies, works anywhere</li>
          <li>✅ <strong>Responsive:</strong> Works on all screen sizes</li>
          <li>✅ <strong>Fast:</strong> Lightweight and optimized</li>
          <li>✅ <strong>Customizable:</strong> Choose button text and variant</li>
          <li>✅ <strong>Privacy-focused:</strong> No tracking or data collection</li>
        </ul>
      </div>
    </div>
  );
}
