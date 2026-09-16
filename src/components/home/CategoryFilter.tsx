import Link from "next/link";
import { getCategories } from "@/lib/data/content";
import { cn } from "@/lib/utils";

export async function CategoryFilter({ activeSlug }: { activeSlug?: string }) {
  const categories = await getCategories();

  if (categories.length === 0) return null;

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
