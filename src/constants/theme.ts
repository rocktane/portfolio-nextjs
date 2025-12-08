// Colors
export const COLORS = {
  primary: "rgba(1, 56, 63, 0.8)",
  linkedin: "#0078b5",
  github: "#0d2636",
} as const;

// Typography
export const FONTS = {
  bright: "Bright, sans-serif",
  alata: 'var(--font-alata), "Alata", system-ui, -apple-system, sans-serif',
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
