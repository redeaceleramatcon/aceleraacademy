import Image from "next/image";
import Link from "next/link";
import { TypeBadge } from "@/components/ui/Badge";
import { PlayIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types/content";

export function FeaturedCard({ item, className }: { item: ContentItem; className?: string }) {
  return (
    <Link href={`/conteudos/${item.id}`} className={cn("group block", className)}>
      <div className="overflow-hidden rounded-2xl bg-surface ring-1 ring-white/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-white/10 group-hover:shadow-elevated">
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 80vw, 360px"
            className="object-cover [filter:saturate(0.92)_contrast(1.04)_brightness(0.96)] transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-brand-blue-dark/15 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <TypeBadge type={item.type} className="absolute left-3 top-3" />
          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
            <PlayIcon className="h-3.5 w-3.5 translate-x-0.5" />
          </span>
        </div>

        <div className="p-4">
          <p className="line-clamp-1 text-base font-semibold text-foreground">{item.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>
          <div className="mt-3 flex items-center justify-between text-xs text-subtle">
            <span>{item.mentor}</span>
            <span>{item.duration}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
