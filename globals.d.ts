declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

interface Window {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
}
