"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Raiz de todas as animações do site. `reducedMotion="user"` respeita quem pediu
 * "reduzir movimento" no sistema operacional: as animações de movimento viram
 * só fade, sem deslocar nem girar nada.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
