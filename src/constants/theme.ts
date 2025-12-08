/**
 * Design tokens - Single source of truth
 * These values are mirrored in globals.css as CSS custom properties
 * Update both files when making changes
 */

// Colors - Reference CSS variables for runtime, keep hex values for type safety
export const COLORS = {
  /** Primary text color - var(--text-dark) in CSS */
  primary: "var(--text-dark)",
  /** LinkedIn brand color - var(--linkedin-bg) in CSS */
  linkedin: "var(--linkedin-bg)",
  /** GitHub brand color - var(--github-bg) in CSS */
  github: "var(--github-bg)",
} as const;

// Typography
export const FONTS = {
  bright: "var(--font-bright)",
  alata: "var(--font-alata)",
} as const;

export const FONT_SIZES = {
  heroTitle: "clamp(2rem, 8vw, 5rem)",
  sectionTitle: "clamp(1rem, 2vw, 1.5rem)",
  small: "clamp(0.8rem, 2vw, 1rem)",
} as const;

// Effects
export const SHADOWS = {
  emoji: "0 0 2px white, -1px -1px 1px white, -1px 1px 1px white, 1px 1px 1px white, 1px -1px 1px white",
} as const;

// Tilt Animation Config
export const TILT_CONFIG = {
  /** Delay before disabling initial transition (ms) */
  initialDelay: 500,
  /** Multiplier for calculating rotation based on element size */
  sizeFactor: 1000,
  /** Rotation scale factor */
  rotationScale: 0.025,
  /** Perspective value for 3D transforms (px) */
  perspective: 1000,
  /** Transition duration for first mouse move */
  transitionInitial: "0.5s",
  /** Transition duration for subsequent moves */
  transitionDefault: "0s",
  /** Transition duration when mouse leaves */
  transitionLeave: "1s",
} as const;

// Map Config
export const MAP_CONFIG = {
  /** Marseille coordinates [latitude, longitude] */
  center: [43.2969, 5.3699] as [number, number],
  /** Default zoom level */
  zoom: 13,
  /** CartoDB tile URL template */
  tileUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}",
  /** Available subdomains for tile loading */
  subdomains: "abcd",
} as const;

// Social Card Dimensions
export const CARD_SIZES = {
  socialCard: "125px",
} as const;
