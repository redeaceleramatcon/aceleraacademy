import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { getSessionUser } from "@/lib/auth";
import { SignUpForm } from "./SignUpForm";

export default async function CadastroPage() {
  const user = await getSessionUser();
  if (user) redirect("/minha-area");

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue-dark/70 via-background to-background" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <Container className="relative">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white">
              Acelera <span className="text-brand-orange">Academy</span>
            </span>
          </Link>

          <div className="mt-8 rounded-2xl border border-white/10 bg-surface/80 p-6 backdrop-blur-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-orange-light">
              Acesso master
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Criar acesso da sua loja
            </h1>
            <p className="mt-2 text-sm text-muted">
              Este cadastro é para o responsável cadastrado no ADM da Rede — quem depois convida
              a própria equipe para a Academy. Se você é funcionário, peça para o responsável da
              sua loja te cadastrar.
            </p>

            <SignUpForm />
          </div>

          <p className="mt-6 text-center text-xs text-subtle">
            Já tem acesso?{" "}
            <Link href="/login" className="transition-colors hover:text-brand-orange-light">
              Entrar na Academy
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-subtle">
            <Link href="/conteudos" className="transition-colors hover:text-brand-orange-light">
              Voltar para o catálogo
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
