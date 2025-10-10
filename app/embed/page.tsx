'use client';

import { useState } from 'react';
import SquaresWidget from '@/components/embed/SquaresWidget';
import styles from './embed.module.css';

export default function EmbedPage() {
  const [showWidget, setShowWidget] = useState(false);

  return (
    <div className={styles.container}>
      <h1>Squares.vote Embed Demo</h1>
      <p>This page demonstrates the embeddable widget that can be added to any website.</p>
      
      <div className={styles.demo}>
        <h2>Preview</h2>
        <p>Click the button below to see the widget in action:</p>
        <button onClick={() => setShowWidget(true)} className={styles.demoButton}>
          Open Squares Widget
        </button>
      </div>

      <div className={styles.instructions}>
        <h2>How to Embed</h2>
        <p>Add this code to your website:</p>
        <pre className={styles.code}>
{`<!-- Add this where you want the button to appear -->
<div id="squares-widget"></div>

<!-- Add this before closing </body> tag -->
<script src="https://squares.vote/embed.js"></script>
<script>
  SquaresWidget.init({
    elementId: 'squares-widget',
    buttonText: 'Map Your Squares',
    theme: 'light' // or 'dark'
  });
</script>`}
        </pre>
      </div>

      {showWidget && <SquaresWidget onClose={() => setShowWidget(false)} />}
    </div>
  );
}
