(function() {
  'use strict';

  // Prevent multiple initializations
  if (window.SquaresEmbed) {
    return;
  }

  const WIDGET_HOST = 'https://squares.vote';
  
  window.SquaresEmbed = {
    init: function(options) {
      const {
        elementId,
        variant = 'card',
        buttonText = 'Map Your Squares'
      } = options || {};

      if (!elementId) {
        console.error('[SquaresEmbed] elementId is required');
        return;
      }

      const container = document.getElementById(elementId);
      if (!container) {
        console.error('[SquaresEmbed] Element not found:', elementId);
        return;
      }

      // Create iframe for the widget
      const iframe = document.createElement('iframe');
      iframe.src = `${WIDGET_HOST}/embed-widget?variant=${variant}&buttonText=${encodeURIComponent(buttonText)}`;
      iframe.style.border = 'none';
      iframe.style.width = '100%';
      iframe.style.minHeight = variant === 'card' ? '400px' : '60px';
      iframe.style.overflow = 'hidden';
      iframe.setAttribute('scrolling', 'no');
      iframe.setAttribute('title', 'Squares.vote Widget');

      container.appendChild(iframe);

      // Listen for height changes from iframe
      window.addEventListener('message', function(event) {
        if (event.origin !== WIDGET_HOST) return;
        
        if (event.data.type === 'squares-resize') {
          iframe.style.height = event.data.height + 'px';
        }
      });
    }
  };
})();
