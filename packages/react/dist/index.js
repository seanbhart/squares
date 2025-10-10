"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  SquaresEmbedReact: () => SquaresEmbedReact
});
module.exports = __toCommonJS(index_exports);

// src/SquaresEmbedReact.tsx
var import_react = __toESM(require("react"));
function SquaresEmbedReact({
  variant = "card",
  buttonText = "Map Your Squares",
  align = "center",
  maxWidth,
  primaryColor,
  borderRadius,
  shadow = true
}) {
  const containerRef = (0, import_react.useRef)(null);
  const elementIdRef = (0, import_react.useRef)(`squares-widget-${Math.random().toString(36).substr(2, 9)}`);
  (0, import_react.useEffect)(() => {
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
  return /* @__PURE__ */ import_react.default.createElement("div", { ref: containerRef, id: elementIdRef.current });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  SquaresEmbedReact
});
