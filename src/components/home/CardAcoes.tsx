"use client";

import { PlayIcon } from "@/components/icons";
import { useMinhaLista } from "@/components/lista/MinhaListaProvider";
import { cn } from "@/lib/utils";

/**
 * Botões redondos no canto do card (como na plataforma anterior): ▶ assistir e + / ✓ Minha lista.
 * Aparecem ao passar o mouse e ficam fixos no card selecionado. O "+" não abre o card (só salva).
 */
export function CardAcoes({
  uuid,
  titulo,
  fixo = false,
  className,
}: {
  uuid: string;
  titulo: string;
  fixo?: boolean;
  className?: string;
}) {
  const { tem, alternar } = useMinhaLista();
  const naLista = tem(uuid);

  return (
    <div
      className={cn(
        "absolute right-2.5 top-2.5 z-20 flex gap-1.5 transition-all duration-300",
        fixo ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
        className,
      )}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-orange text-white shadow-lg transition-transform hover:scale-110">
        <PlayIcon className="h-3 w-3 translate-x-px" />
      </span>
      <button
        type="button"
        aria-label={naLista ? `Remover ${titulo} da minha lista` : `Adicionar ${titulo} à minha lista`}
        aria-pressed={naLista}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          alternar(uuid, titulo);
        }}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold leading-none shadow-lg backdrop-blur transition-all hover:scale-110",
          naLista
            ? "border-emerald-300/60 bg-emerald-500/80 text-white"
            : "border-white/50 bg-black/60 text-white hover:border-brand-orange hover:text-brand-orange-light",
        )}
      >
        {naLista ? "✓" : "+"}
      </button>
    </div>
  );
}
