"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Barra fina no topo que enche conforme a página é rolada. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-gradient-to-r from-brand-blue-light via-brand-orange to-brand-orange-light"
    />
  );
}
