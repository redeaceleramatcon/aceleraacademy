"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { COOKIE_VER_COMO, getSessionUser } from "@/lib/auth";
import { podePublicarConteudo } from "@/lib/atividade";

/** Admin/editor escolhe ver o site como lojista (normal) ou como colaborador. */
export async function definirVerComo(modo: "lojista" | "colaborador"): Promise<{ error?: string }> {
  const user = await getSessionUser();
  if (!user) return { error: "Sua sessão expirou. Entre novamente." };
  if (!(await podePublicarConteudo(user.id))) return { error: "Você não tem acesso a esta opção." };

  const jar = await cookies();
  if (modo === "colaborador") {
    jar.set(COOKIE_VER_COMO, "colaborador", { path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 8 });
  } else {
    jar.delete(COOKIE_VER_COMO);
  }
  revalidatePath("/", "layout");
  return {};
}
