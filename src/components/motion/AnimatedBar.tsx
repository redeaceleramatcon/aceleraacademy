"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/** Barra de progresso que cresce da esquerda até o valor quando entra na tela. */
export function AnimatedBar({
  value,
  className,
  delay = 0,
}: {
  value: number;
  className?: string;
  delay?: number;
}) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-white/10", className)}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-brand-orange to-brand-orange-light"
        initial={{ width: 0 }}
        whileInView={{ width: `${v}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay }}
      />
    </div>
  );
}
