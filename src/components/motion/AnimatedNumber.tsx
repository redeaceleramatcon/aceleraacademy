"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

/** Número que "conta" de 0 até o valor quando entra na tela (estilo contador de métricas). */
export function AnimatedNumber({
  value,
  duration = 1.4,
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visivel = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  useEffect(() => {
    const el = ref.current;
    if (!el || !visivel) return;
    const controles = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = `${Math.round(v).toLocaleString("pt-BR")}${suffix}`;
      },
    });
    return () => controles.stop();
  }, [visivel, value, duration, suffix]);

  return (
    <span ref={ref} className={className}>
      {`0${suffix}`}
    </span>
  );
}
