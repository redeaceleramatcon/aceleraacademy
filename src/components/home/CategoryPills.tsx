"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import type { Category } from "@/types/content";
import { cn } from "@/lib/utils";

/**
 * Chips de categoria: entram em sequência, e um "fundo" deslizante acompanha o chip sob o mouse
 * (layoutId compartilhado = o mesmo elemento se move de um chip para o outro).
 * O chip ativo fica laranja e pulsa um brilho discreto.
 */
export function CategoryPills({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug?: string;
}) {
  const [hover, setHover] = useState<string | null>(null);

  return (
    <motion.div
      className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
      onMouseLeave={() => setHover(null)}
    >
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;
        return (
          <motion.div
            key={category.slug}
            className="flex-shrink-0"
            variants={{
              hidden: { opacity: 0, y: 14, scale: 0.9 },
              show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } },
            }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href={`/categorias/${category.slug}`}
              onMouseEnter={() => setHover(category.slug)}
              onFocus={() => setHover(category.slug)}
              className={cn(
                "relative block rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "border-brand-orange bg-brand-orange text-white shadow-[0_0_22px_-4px_rgb(245_115_10/0.7)]"
                  : "border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-foreground",
              )}
            >
              {hover === category.slug && !isActive && (
                <motion.span
                  layoutId="categoria-hover"
                  className="absolute inset-0 rounded-full bg-white/10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative">{category.name}</span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
