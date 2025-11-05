declare global {
  interface Window {
    HSStaticMethods: {
      autoInit(): void;
    };
    FloatingUIDOM: typeof import('@floating-ui/dom');
  }
}

export {};
