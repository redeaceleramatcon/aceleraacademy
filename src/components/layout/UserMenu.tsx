"use client";

import Link from "next/link";
import { useState } from "react";
import { UserIcon } from "@/components/icons";

export function UserMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((value) => !value)}
        aria-label="Menu do usuário"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition-colors hover:border-white/30 hover:text-white"
      >
        <UserIcon className="h-4 w-4" />
      </button>

      {open && (
        <>
          <button
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-white/10 bg-surface-elevated py-2 shadow-elevated">
            <p className="px-4 py-2 text-xs text-subtle">Associado Acelera Matcon</p>
            <Link
              href="/minha-area"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-foreground hover:bg-white/5"
            >
              Minha área
            </Link>
            <Link
              href="/conteudos"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-foreground hover:bg-white/5"
            >
              Continuar assistindo
            </Link>
            <div className="my-1 border-t border-white/10" />
            <button className="block w-full px-4 py-2 text-left text-sm text-muted hover:bg-white/5">
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  );
}
