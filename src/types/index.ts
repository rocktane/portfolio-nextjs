export interface Logo {
  src: string;
  alt: string;
  href: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  url: string;
  urlLabel: string;
  status: "beta" | "progress" | "live";
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
