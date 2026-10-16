import { cn } from "@/lib/utils";

/** Rodinha de carregamento para botões em "enviando...". */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white", className)}
    />
  );
}
