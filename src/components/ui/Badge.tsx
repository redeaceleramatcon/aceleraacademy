import { cn } from "@/lib/utils";
import type { ContentType } from "@/types/content";

const typeStyles: Record<ContentType, string> = {
  live: "bg-brand-orange text-white",
  curso: "bg-brand-blue-light text-white",
  aula: "bg-white/10 text-foreground",
  entrevista: "bg-white/10 text-foreground",
  parceiro: "border border-brand-orange/60 text-brand-orange-light",
};

const typeLabels: Record<ContentType, string> = {
  live: "Live",
  curso: "Curso",
  aula: "Aula",
  entrevista: "Entrevista",
  parceiro: "Parceiro",
};

export function TypeBadge({ type, className }: { type: ContentType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-sm",
        typeStyles[type],
        className
      )}
    >
      {type === "live" && <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
      {typeLabels[type]}
    </span>
  );
}
