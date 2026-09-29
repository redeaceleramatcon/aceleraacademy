"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Estado = "verificando" | "pronto" | "salvando" | "sucesso" | "erro";

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 transition-colors focus:border-brand-blue-light/60 focus:outline-none";

const labelClass = "mb-1.5 block text-xs uppercase tracking-wide text-subtle";

/**
 * O e-mail de convite/recuperação do Supabase confirma o token no domínio
 * dele e redireciona pra cá com a sessão pronta em `#access_token=...` — o
 * fragmento nunca chega ao servidor, então isso só dá pra ler no navegador.
 */
export function DefinirSenhaForm() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("verificando");
  const [erro, setErro] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");

  useEffect(() => {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(hash);

    const descricaoErro = params.get("error_description");
    if (descricaoErro) {
      setErro("Esse link expirou ou já foi usado. Peça um novo convite a quem te chamou pra Academy.");
      setEstado("erro");
      return;
    }

    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    if (!accessToken || !refreshToken) {
      setErro("Link inválido ou incompleto. Peça um novo convite a quem te chamou pra Academy.");
      setEstado("erro");
      return;
    }

    const supabase = createClient();
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken }).then(({ error }) => {
      if (error) {
        setErro("Esse link expirou ou já foi usado. Peça um novo convite.");
        setEstado("erro");
        return;
      }
      // Tira o token da barra de endereço — já cumpriu o papel dele.
      window.history.replaceState(null, "", window.location.pathname);
      setEstado("pronto");
    });
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro("");

    if (senha.length < 8) {
      setErro("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEstado("salvando");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });
    if (error) {
      setErro("Não foi possível salvar a senha agora. Tente novamente.");
      setEstado("pronto");
      return;
    }

    setEstado("sucesso");
    setTimeout(() => router.push("/minha-area"), 1200);
  }

  if (estado === "verificando") {
    return <p className="mt-6 text-sm text-muted">Confirmando seu convite...</p>;
  }

  if (estado === "erro") {
    return (
      <div className="mt-6">
        <p className="text-sm text-brand-orange-light">{erro}</p>
        <Link href="/login" className="mt-4 inline-block text-xs font-semibold text-brand-blue-light hover:underline">
          Ir para o login →
        </Link>
      </div>
    );
  }

  if (estado === "sucesso") {
    return <p className="mt-6 text-sm text-brand-blue-light">Senha definida! Entrando na Academy...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
      <div>
        <label className={labelClass} htmlFor="senha">
          Nova senha
        </label>
        <input
          id="senha"
          type="password"
          required
          minLength={8}
          placeholder="Mínimo de 8 caracteres"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass} htmlFor="confirmacao">
          Confirmar senha
        </label>
        <input
          id="confirmacao"
          type="password"
          required
          minLength={8}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={estado === "salvando"}
        className="rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {estado === "salvando" ? "Salvando..." : "Entrar na Academy"}
      </button>

      {erro && (
        <p role="alert" className="text-xs text-brand-orange-light">
          {erro}
        </p>
      )}
    </form>
  );
}
