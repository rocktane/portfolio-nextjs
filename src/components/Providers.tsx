"use client";

import { useEffect } from "react";
import { MotionConfig } from "motion/react";
import SmoothScroll from "@/components/SmoothScroll";
import KeyboardNav from "@/components/KeyboardNav";
import ProjectsProvider from "@/components/ProjectsProvider";

declare global {
  interface Window {
    __revealFallback?: ReturnType<typeof setTimeout>;
  }
}

/**
 * Frontière client unique du site. `reducedMotion="user"` neutralise d'un coup
 * toutes les animations Motion pour qui a demandé moins de mouvement.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  // Cet effet ne s'exécute que si l'hydratation a réussi : il désamorce le
  // filet de sécurité posé dans <head>, qui sinon rendrait tout visible.
  useEffect(() => {
    clearTimeout(window.__revealFallback);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll />
      <KeyboardNav />
      <ProjectsProvider>{children}</ProjectsProvider>
    </MotionConfig>
  );
}
