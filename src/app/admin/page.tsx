import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { getSessionUser } from "@/lib/auth";
import { ehAdmin } from "@/lib/atividade";
import { listarTodosUsuarios, listarEquipeInterna } from "@/lib/admin";
import { ConvidarInternoForm } from "./ConvidarInternoForm";
import { RemoverInternoButton } from "./RemoverInternoButton";

/** Só para quem está em academy_admins — vê a rede inteira, todas as lojas. */
export default async function AdminPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/admin");
  if (!(await ehAdmin(user.id))) redirect("/minha-area");

  const [usuarios, equipeInterna] = await Promise.all([listarTodosUsuarios(), listarEquipeInterna()]);
  const porLoja = new Map<string, typeof usuarios>();
  for (const u of usuarios) {
    const lista = porLoja.get(u.lojaCnpj) ?? [];
    lista.push(u);
    porLoja.set(u.lojaCnpj, lista);
  }

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-16 pt-2 sm:pt-4">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Rede — atividade</h1>
          <p className="mt-2 text-sm text-muted">
            {usuarios.length} conta{usuarios.length === 1 ? "" : "s"} ativa
            {usuarios.length === 1 ? "" : "s"} em {porLoja.size} loja{porLoja.size === 1 ? "" : "s"}.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
              Equipe interna (sem loja)
            </p>
            <p className="mt-2 text-sm text-muted">
              Contas do time Acelera Matcon — treinamento, suporte, conteúdo — sem vínculo com
              nenhum CNPJ do ADM.
            </p>

            <ConvidarInternoForm />

            <ul className="mt-6 divide-y divide-white/10">
              {equipeInterna.map((m) => (
                <li key={m.vinculoId} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{m.nome || m.email}</p>
                    {m.nome && <p className="truncate text-xs text-muted">{m.email}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <Link
                      href={`/atividade/${m.userId}`}
                      className="text-xs font-semibold text-brand-blue-light hover:underline"
                    >
                      Ver atividade
                    </Link>
                    <RemoverInternoButton vinculoId={m.vinculoId} />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {[...porLoja.entries()].map(([cnpj, membros]) => (
            <div key={cnpj} className="mt-8 rounded-2xl border border-white/10 bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">CNPJ {cnpj}</p>
              <ul className="mt-4 divide-y divide-white/10">
                {membros.map((m) => (
                  <li key={m.userId} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {m.nome || m.email}
                        {m.papel === "master" && (
                          <span className="ml-2 text-xs font-normal text-brand-orange-light">responsável</span>
                        )}
                      </p>
                      {m.nome && <p className="truncate text-xs text-muted">{m.email}</p>}
                    </div>
                    <Link
                      href={`/atividade/${m.userId}`}
                      className="shrink-0 text-xs font-semibold text-brand-blue-light hover:underline"
                    >
                      Ver atividade
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Container>
      </main>
      <Footer />
    </>
  );
}
