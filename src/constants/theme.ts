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
  /** Perspective value for 3D transforms (px) */
  perspective: 900,
  /** Max rotation at the very edge of the card (deg) */
  maxRotation: 8,
  /** Extra scale applied while hovering (0.02 = +2%) */
  hoverScale: 0.02,
  /**
   * Smoothing rates (1/s) for the exponential easing.
   * Higher = snappier. `follow` tracks the cursor, `release` eases back to rest.
   */
  followSpeed: 16,
  releaseSpeed: 6,
} as const;

// Map Config
export const MAP_CONFIG = {
  /** Marseille coordinates [latitude, longitude] */
  center: [43.2969, 5.3699] as [number, number],
  /** Default zoom level */
  zoom: 13,
  /** Zoom bounds the visitor can navigate between */
  minZoom: 4,
  maxZoom: 18,
  /** CartoDB tile URL template */
  tileUrl: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}",
  /** Available subdomains for tile loading */
  subdomains: "abcd",
} as const;

// Social Card Dimensions
export const CARD_SIZES = {
  socialCard: "125px",
} as const;
