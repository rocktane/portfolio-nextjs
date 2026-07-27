"use client";

import { motion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Le titre de section, volontairement démesuré : c'est lui qui rythme le
 * défilement et sépare les chapitres du catalogue.
 */
export default function SectionHeading({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count?: number;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 pb-5">
      <div className="flex items-baseline gap-4">
        <motion.h2
          id={id}
          className="display text-[clamp(2.5rem,9vw,7.5rem)]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15% 0px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          {title}
        </motion.h2>
        {count !== undefined && (
          <span className="mono text-muted tabular-nums">
            {String(count).padStart(2, "0")}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
