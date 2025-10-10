// src/SquaresEmbedReact.tsx
import React, { useEffect, useRef } from "react";
function SquaresEmbedReact({
  variant = "card",
  buttonText = "Map Your Squares",
  align = "center",
  maxWidth,
  primaryColor,
  borderRadius,
  shadow = true
}) {
  const containerRef = useRef(null);
  const elementIdRef = useRef(`squares-widget-${Math.random().toString(36).substr(2, 9)}`);
  useEffect(() => {
    if (!window.SquaresEmbed) {
      const script = document.createElement("script");
      script.src = "https://squares.vote/embed.js";
      script.async = true;
      script.onload = () => {
        initializeWidget();
      };
      document.body.appendChild(script);
      return () => {
        document.body.removeChild(script);
      };
    } else {
      initializeWidget();
    }
    function initializeWidget() {
      if (window.SquaresEmbed && containerRef.current) {
        window.SquaresEmbed.init({
          elementId: elementIdRef.current,
          variant,
          buttonText,
          align,
          maxWidth,
          primaryColor,
          borderRadius,
          shadow
        });
      }
    }
    return () => {
      if (window.SquaresEmbed) {
        window.SquaresEmbed.destroy(elementIdRef.current);
      }
    };
  }, [variant, buttonText, align, maxWidth, primaryColor, borderRadius, shadow]);
  return /* @__PURE__ */ React.createElement("div", { ref: containerRef, id: elementIdRef.current });
}
export {
  SquaresEmbedReact
};
