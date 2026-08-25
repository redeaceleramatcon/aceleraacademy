import Image from "next/image";
import Link from "next/link";
import { TypeBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types/content";

export function LiveCard({ item, className }: { item: ContentItem; className?: string }) {
  return (
    <Link href={`/conteudos/${item.id}`} className={cn("group block", className)}>
      <div className="relative aspect-video overflow-hidden rounded-xl ring-1 ring-white/5 transition-all duration-300 group-hover:-translate-y-1 group-hover:ring-white/10 group-hover:shadow-elevated">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 80vw, 320px"
          className="object-cover [filter:saturate(0.92)_contrast(1.04)_brightness(0.96)] transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-brand-blue-dark/15 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        <TypeBadge type="live" className="absolute left-3 top-3" />

        <div className="absolute inset-x-0 bottom-0 p-4">
          {item.partner && (
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-orange-light">
              Parceria com {item.partner}
            </p>
          )}
          <p className="mt-1 line-clamp-2 text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-1 text-xs text-white/60">
            {item.mentor} · {item.duration}
          </p>
        </div>
      </div>
    </Link>
  );
}
