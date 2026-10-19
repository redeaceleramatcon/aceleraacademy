import type { MouseEvent } from "react";

/** Props extras dos cards quando estão numa fileira com painel de detalhes (CatalogoRow). */
export interface PropsCardSelecionavel {
  /** Este card está "aberto" (o painel de detalhes mostra o conteúdo dele). */
  selecionado?: boolean;
  /** Clique no card: em vez de navegar, abre/fecha o painel. Sem isto o card é só um link. */
  aoSelecionar?: () => void;
}

/**
 * Clique normal abre o painel; Ctrl/⌘/Shift/botão do meio continuam abrindo o conteúdo (nova aba etc.),
 * como qualquer link.
 */
export function aoClicarCard(aoSelecionar?: () => void) {
  if (!aoSelecionar) return undefined;
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    aoSelecionar();
  };
}
