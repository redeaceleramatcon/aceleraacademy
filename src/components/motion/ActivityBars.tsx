"use client";

import { motion } from "motion/react";

/** Gráfico de barras dos últimos dias: as barras crescem em sequência e destacam o dia sob o mouse. */
export function ActivityBars({ dados }: { dados: { dia: string; total: number }[] }) {
  const max = Math.max(1, ...dados.map((d) => d.total));

  return (
    <motion.div
      className="flex h-32 items-end gap-1.5 sm:gap-2"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
    >
      {dados.map((d) => {
        const [, mes, dia] = d.dia.split("-");
        return (
          <div key={d.dia} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={`${dia}/${mes}: ${d.total} ${d.total === 1 ? "evento" : "eventos"}`}>
            <span className="text-[10px] tabular-nums text-transparent transition-colors group-hover:text-white">{d.total}</span>
            <motion.div
              className="w-full rounded-t-md bg-gradient-to-t from-brand-blue to-brand-blue-light transition-[filter] group-hover:brightness-125"
              style={{ height: `${Math.max(4, (d.total / max) * 100)}%`, originY: 1, opacity: d.total === 0 ? 0.25 : 1 }}
              variants={{ hidden: { scaleY: 0 }, show: { scaleY: 1, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } } }}
            />
            <span className="text-[10px] text-subtle">{dia}</span>
          </div>
        );
      })}
    </motion.div>
  );
}
