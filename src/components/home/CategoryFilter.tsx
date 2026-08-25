import Link from "next/link";
import { categories } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { CategorySlug } from "@/types/content";

export function CategoryFilter({ activeSlug }: { activeSlug?: CategorySlug }) {
  return (
    <div className="scrollbar-hide flex gap-2.5 overflow-x-auto pb-1">
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;
        return (
          <Link
            key={category.slug}
            href={`/categorias/${category.slug}`}
            className={cn(
              "flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
              isActive
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-white/10 bg-white/[0.03] text-muted hover:border-white/20 hover:text-foreground"
            )}
          >
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
