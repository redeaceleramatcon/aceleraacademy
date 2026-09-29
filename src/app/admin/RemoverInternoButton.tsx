"use client";

import { removerMembroInterno } from "./actions";

export function RemoverInternoButton({ vinculoId }: { vinculoId: string }) {
  return (
    <form action={removerMembroInterno.bind(null, vinculoId)}>
      <button
        type="submit"
        className="text-xs font-semibold text-brand-orange-light transition-colors hover:text-brand-orange"
      >
        Remover
      </button>
    </form>
  );
}
