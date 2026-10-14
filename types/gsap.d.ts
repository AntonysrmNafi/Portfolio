// Minimal ambient types for the GSAP + ScrollTrigger builds loaded from the CDN.
type GsapTarget = string | Element | null | Array<Element | null>;

interface GsapVars {
  [key: string]: unknown;
}

declare const gsap: {
  registerPlugin(...plugins: unknown[]): void;
  set(targets: GsapTarget, vars: GsapVars): unknown;
  to(targets: GsapTarget, vars: GsapVars): unknown;
  from(targets: GsapTarget, vars: GsapVars): unknown;
  ticker: { add(callback: () => void): void };
};

declare const ScrollTrigger: unknown;
