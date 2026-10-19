"use client";

import { motion } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { entrada } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";

/**
 * Card com luz que segue o mouse (classe `.spot`, ver globals.css). Só atualiza duas variáveis CSS na
 * posição do cursor — não re-renderiza. Dentro de um <Stagger> herda a entrada em sequência.
 */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function mover(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
  }

  return (
    <motion.div
      ref={ref}
      variants={entrada}
      onPointerMove={mover}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className={cn("spot", className)}
    >
      {children}
    </motion.div>
  );
}
