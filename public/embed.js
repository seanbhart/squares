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
        buttonText = 'Map Your Squares',
        align = 'center', // 'left', 'center', 'right'
        maxWidth = null, // e.g., '600px', '100%'
        primaryColor = null, // e.g., '#4285f4'
        borderRadius = null, // e.g., '12px'
        shadow = true // show/hide shadow
      } = options || {};

      if (!elementId) {
        console.error('[SquaresEmbed] elementId is required');
        return;
      }

      // Defer initialization to avoid interfering with React render cycles
      // Use requestAnimationFrame to ensure DOM is ready and React has finished rendering
      requestAnimationFrame(function() {
        const container = document.getElementById(elementId);
        if (!container) {
          console.error('[SquaresEmbed] Element not found:', elementId);
          return;
        }

        // Check if already initialized
        if (container.hasAttribute('data-squares-initialized')) {
          console.warn('[SquaresEmbed] Widget already initialized for element:', elementId);
          return;
        }

        // Mark as initialized
        container.setAttribute('data-squares-initialized', 'true');

        // Create a shadow DOM for complete isolation from host app
        const shadowRoot = container.attachShadow({ mode: 'open' });
        
        // Create iframe container in shadow DOM
        const iframeContainer = document.createElement('div');
        iframeContainer.style.width = '100%';
        iframeContainer.style.position = 'relative';
        
        // Apply alignment
        if (align === 'left') {
          iframeContainer.style.marginLeft = '0';
          iframeContainer.style.marginRight = 'auto';
        } else if (align === 'right') {
          iframeContainer.style.marginLeft = 'auto';
          iframeContainer.style.marginRight = '0';
        } else {
          iframeContainer.style.marginLeft = 'auto';
          iframeContainer.style.marginRight = 'auto';
        }
        
        // Apply max width
        if (maxWidth) {
          iframeContainer.style.maxWidth = maxWidth;
        }
        
        // Create iframe for the widget
        const iframe = document.createElement('iframe');
        
        // Build URL with all customization options
        const params = new URLSearchParams({
          variant: variant,
          buttonText: buttonText,
          elementId: elementId
        });
        
        if (primaryColor) params.append('primaryColor', primaryColor);
        if (borderRadius) params.append('borderRadius', borderRadius);
        if (shadow !== undefined) params.append('shadow', shadow.toString());
        
        iframe.src = `${WIDGET_HOST}/embed-widget?${params.toString()}`;
        iframe.style.border = 'none';
        iframe.style.width = '100%';
        iframe.style.minHeight = variant === 'card' ? '400px' : '60px';
        iframe.style.overflow = 'hidden';
        iframe.style.display = 'block';
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('title', 'Squares.vote Widget');
        iframe.setAttribute('loading', 'lazy');
        
        iframeContainer.appendChild(iframe);
        shadowRoot.appendChild(iframeContainer);

        // Listen for height changes from iframe
        // Store reference to avoid multiple listeners
        const messageHandler = function(event) {
          if (event.origin !== WIDGET_HOST) return;
          
          if (event.data.type === 'squares-resize' && event.data.elementId === elementId) {
            iframe.style.height = event.data.height + 'px';
          }
        };

        window.addEventListener('message', messageHandler);
        
        // Store cleanup function
        container._squaresCleanup = function() {
          window.removeEventListener('message', messageHandler);
          if (shadowRoot) {
            shadowRoot.innerHTML = '';
          }
        };
      });
    },
    
    // Method to destroy a widget instance
    destroy: function(elementId) {
      const container = document.getElementById(elementId);
      if (container && container._squaresCleanup) {
        container._squaresCleanup();
        container.removeAttribute('data-squares-initialized');
        delete container._squaresCleanup;
      }
    }
  };
})();
