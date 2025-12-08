export interface Logo {
  src: string;
  alt: string;
  href: string;
}

export interface TiltConfig {
  initialDelay: number;
  sizeFactor: number;
  rotationScale: number;
  perspective: number;
  transitionInitial: string;
  transitionDefault: string;
  transitionLeave: string;
}

export interface MapConfig {
  center: [number, number];
  zoom: number;
  tileUrl: string;
  subdomains: string;
}
