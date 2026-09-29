import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Container } from "@/components/ui/Container";
import { getSessionUser } from "@/lib/auth";
import { ehAdmin } from "@/lib/atividade";
import { listarCategoriasAdmin, listarMentoresAdmin } from "@/lib/conteudo";
import { NovoConteudoForm } from "./NovoConteudoForm";

/** Cadastro de vídeo — só Admin. Hoje só cobre vídeo avulso do YouTube. */
export default async function NovoConteudoPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?redirect=/admin/conteudos/novo");
  if (!(await ehAdmin(user.id))) redirect("/minha-area");

  const [categorias, mentores] = await Promise.all([listarCategoriasAdmin(), listarMentoresAdmin()]);

  return (
    <>
      <Header />
      <main className="pt-24 sm:pt-28">
        <Container className="pb-16 pt-2 sm:pt-4">
          <Link href="/admin" className="text-xs font-semibold text-brand-blue-light hover:underline">
            ← Voltar para o painel admin
          </Link>

          <h1 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">Novo conteúdo</h1>
          <p className="mt-2 text-sm text-muted">
            Cole o link de um vídeo do YouTube (o canal deve estar configurado como{" "}
            <strong>Não listado</strong>) e preencha os dados abaixo.
          </p>

          <div className="mt-8 max-w-2xl rounded-2xl border border-white/10 bg-surface p-6">
            <NovoConteudoForm categorias={categorias} mentores={mentores} />
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
