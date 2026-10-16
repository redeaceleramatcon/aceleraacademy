"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useState } from "react";

/** Botão "voltar ao topo" que surge depois de rolar bastante. */
export function BackToTop() {
  const { scrollY } = useScroll();
  const [visivel, setVisivel] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setVisivel(v > 900));

  return (
    <AnimatePresence>
      {visivel && (
        <motion.button
          type="button"
          aria-label="Voltar ao topo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 24, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.8 }}
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-4 left-4 z-[70] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-surface-elevated/90 text-white shadow-elevated backdrop-blur"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m18 15-6-6-6 6" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
