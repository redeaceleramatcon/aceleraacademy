"use client";

import { remover } from "./actions";

export function RemoverButton({ vinculoId }: { vinculoId: string }) {
  return (
    <form action={remover.bind(null, vinculoId)}>
      <button
        type="submit"
        className="text-xs font-semibold text-brand-orange-light transition-colors hover:text-brand-orange"
      >
        Remover
      </button>
    </form>
  );
}
