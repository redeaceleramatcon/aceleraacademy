import { Estrelas } from "@/components/marca/Estrelas";
import { Aurora } from "@/components/motion/HeroMotion";
import { cn } from "@/lib/utils";

/**
 * Fundo próprio da marca para as áreas de destaque (Hero da Home, topo das páginas de conteúdo):
 * azul institucional em degradê, grade técnica sutil que desliza devagar, manchas de luz (aurora) e
 * feixes diagonais. Substitui a miniatura do vídeo esticada na tela (que já vem com texto escrito
 * e brigava com o título).
 */
export function HeroBackground({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("absolute inset-0 overflow-hidden", className)}>
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-dark via-[#0c1d3a] to-background" />
      <Estrelas />
      <Aurora />
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_30%_45%,#000_15%,transparent_78%)]">
        <div className="grade-fundo" />
      </div>
      <div className="feixe-fundo absolute -top-1/2 left-[-20%] h-[200%] w-[22%]" />
      <div className="feixe-fundo absolute -top-1/2 left-[40%] h-[200%] w-[10%] [animation-delay:-9s] [animation-duration:26s]" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
