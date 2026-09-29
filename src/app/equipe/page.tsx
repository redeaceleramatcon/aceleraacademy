import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { getSessionProfile } from "@/lib/auth";
import { listarEquipe } from "@/lib/vinculos";
import { ConvidarForm } from "./ConvidarForm";
import { RemoverButton } from "./RemoverButton";

/**
 * Minha equipe — só existe para quem é master de pelo menos uma loja.
 * Funcionário que tentar acessar direto cai de volta em /minha-area: não tem
 * vínculo master nenhum pra montar a lista.
 */
export default async function EquipePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?redirect=/equipe");

  const lojasMaster = profile.vinculos.filter((v) => v.papel === "master").map((v) => v.lojaCnpj);
  if (lojasMaster.length === 0) redirect("/minha-area");

  const equipesPorLoja = await Promise.all(
    lojasMaster.map(async (cnpj) => ({ cnpj, membros: await listarEquipe(cnpj) })),
  );

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-16 pt-2 sm:pt-4">
          <h1 className="text-xl font-bold text-foreground sm:text-2xl">Minha equipe</h1>
          <p className="mt-2 text-sm text-muted">
            Convide quem da sua loja também vai acessar a Academy. A pessoa recebe um e-mail para
            criar a própria senha.
          </p>

          {equipesPorLoja.map(({ cnpj, membros }) => (
            <div key={cnpj} className="mt-8 rounded-2xl border border-white/10 bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-subtle">
                CNPJ {cnpj}
              </p>

              <ConvidarForm lojaCnpj={cnpj} />

              <ul className="mt-6 divide-y divide-white/10">
                {membros.map((m) => (
                  <li key={m.vinculoId} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {m.nome || m.email}
                        {m.papel === "master" && (
                          <span className="ml-2 text-xs font-normal text-brand-orange-light">
                            responsável
                          </span>
                        )}
                      </p>
                      {m.nome && <p className="truncate text-xs text-muted">{m.email}</p>}
                    </div>
                    {m.papel === "funcionario" && <RemoverButton vinculoId={m.vinculoId} />}
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
