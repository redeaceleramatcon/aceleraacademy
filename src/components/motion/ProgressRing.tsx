"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Anel de progresso que se desenha ao entrar na tela. */
export function ProgressRing({
  percent,
  size = 64,
  stroke = 5,
  children,
}: {
  percent: number;
  size?: number;
  stroke?: number;
  children?: ReactNode;
}) {
  const raio = (size - stroke) / 2;
  const circ = 2 * Math.PI * raio;
  const valor = Math.min(100, Math.max(0, percent));

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={raio} fill="none" strokeWidth={stroke} className="stroke-white/10" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={raio}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          className="stroke-brand-orange"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          whileInView={{ strokeDashoffset: circ * (1 - valor / 100) }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-foreground">
        {children ?? `${Math.round(valor)}%`}
      </div>
    </div>
  );
}
