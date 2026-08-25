import Image from "next/image";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PlayIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { ContentItem } from "@/types/content";

export function ContentCard({ item, className }: { item: ContentItem; className?: string }) {
  return (
    <Link href={`/conteudos/${item.id}`} className={cn("group block", className)}>
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface ring-1 ring-white/5 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:ring-white/10 group-hover:shadow-elevated">
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 70vw, 280px"
          className="object-cover [filter:saturate(0.92)_contrast(1.04)_brightness(0.96)] transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-brand-blue-dark/15 mix-blend-multiply" />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-95" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-background shadow-lg">
            <PlayIcon className="h-4 w-4 translate-x-0.5" />
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-3 pb-4">
          <p className="line-clamp-1 text-sm font-semibold text-white">{item.title}</p>
          <p className="mt-0.5 line-clamp-1 text-xs text-white/60">
            {item.mentor} · {item.duration}
          </p>
        </div>

        {typeof item.progress === "number" && (
          <ProgressBar
            value={item.progress}
            variant="flush"
            className="absolute inset-x-0 bottom-0"
          />
        )}
      </div>
    </Link>
  );
}
