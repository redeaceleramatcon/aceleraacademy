import { getCategories } from "@/lib/data/content";
import { CategoryPills } from "@/components/home/CategoryPills";

export async function CategoryFilter({ activeSlug }: { activeSlug?: string }) {
  const categories = await getCategories();

  if (categories.length === 0) return null;

  return <CategoryPills categories={categories} activeSlug={activeSlug} />;
}
