"use client";

import { useTilt } from "@/hooks/useTilt";
import { ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  /** Override default padding (p-8) */
  noPadding?: boolean;
  /** Override default background (bg-yellow) */
  noBackground?: boolean;
  /** Custom inline styles */
  style?: React.CSSProperties;
}

export default function TiltCard({
  children,
  className = "",
  noPadding = false,
  noBackground = false,
  style,
}: TiltCardProps) {
  const tiltRef = useTilt<HTMLDivElement>();

  // Use explicit props instead of fragile regex parsing
  const paddingClass = noPadding ? "" : "p-8";
  const backgroundClass = noBackground ? "" : "bg-yellow";

  return (
    <div
      ref={tiltRef}
      className={`
        tilt-card
        ${backgroundClass} rounded-3xl ${paddingClass} shadow-sm
        transform-gpu origin-center
        relative z-0 first:z-10 hover:z-50
        font-alata text-base md:text-lg
        ${className}
      `}
      style={style}
    >
      {children}
    </div>
  );
}
