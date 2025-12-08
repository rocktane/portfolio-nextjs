"use client";

import { useTilt } from "@/hooks/useTilt";
import { ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export default function TiltCard({ children, className = "" }: TiltCardProps) {
  const tiltRef = useTilt<HTMLDivElement>();

  // Check if className contains any padding utility class (p-*, px-*, py-*, pt-*, pr-*, pb-*, pl-*)
  const hasPadding = /\bp-[xytrbl]?-\d+|\bp-0\b/.test(className);
  const defaultPadding = hasPadding ? "" : "p-8";

  // Check if className contains any background utility class (bg-*)
  const hasBackground = /\bbg-/.test(className);
  const defaultBackground = hasBackground ? "" : "bg-yellow";

  return (
    <div
      ref={tiltRef}
      className={`
        ${defaultBackground} rounded-3xl ${defaultPadding} shadow-sm
        transform-gpu origin-center transition-transform duration-1000
        relative z-0 first:z-10 hover:z-50
        ${className}
      `}
      style={{
        fontFamily: 'var(--font-alata), "Alata", system-ui, -apple-system, sans-serif',
        fontSize: 'clamp(1rem, 2vw, 1.5rem)',
      }}
    >
      {children}
    </div>
  );
}
