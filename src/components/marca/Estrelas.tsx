import { cn } from "@/lib/utils";

/** Campo de estrelas da marca (as mesmas do site institucional), em 3 camadas com parallax e brilho piscando. */
export function Estrelas({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="estrelas estrelas-1" />
      <div className="estrelas estrelas-2" />
      <div className="estrelas estrelas-3" />
    </div>
  );
}
