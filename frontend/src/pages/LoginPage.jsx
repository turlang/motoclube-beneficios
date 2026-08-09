import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { BrandCrest } from "../components/BrandCrest.jsx";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    senha: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell px-4 py-6 text-zinc-100">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center">
        <div className="mb-6 rounded-[2rem] border border-amber-400/20 bg-black/50 p-5 backdrop-blur-xl">
          <div className="warning-stripes mb-4 h-1.5 rounded-full opacity-80" />
          <div className="flex items-center gap-4">
            <BrandCrest active size="default" compact />
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.38em] text-amber-400">
                Motoclube
              </p>
              <h1 className="mt-2 text-3xl font-black uppercase leading-none text-white">
                Irmãos do Asfalto
              </h1>
              <p className="mt-3 text-sm leading-6 text-zinc-500">
                Mais que um clube. Uma irmandade sobre duas rodas.
              </p>
            </div>
          </div>
        </div>

        <div className="steel-card rounded-[2rem] p-5">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-300">
            Acesso do associado
          </p>
          <h2 className="mt-2 text-2xl font-black uppercase text-white">
            Entre para abrir seu escudo digital
          </h2>

          <form onSubmit={handleSubmit} className="mt-6">
            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
              E-mail
            </label>
            <div className="mb-4 flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4">
              <Mail className="h-4 w-4 text-zinc-500" />
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-700"
                placeholder="voce@email.com"
                required
              />
            </div>

            <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.25em] text-zinc-500">
              Senha
            </label>
            <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4">
              <LockKeyhole className="h-4 w-4 text-zinc-500" />
              <input
                type="password"
                autoComplete="current-password"
                value={form.senha}
                onChange={(event) =>
                  setForm((current) => ({ ...current, senha: event.target.value }))
                }
                className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-700"
                placeholder="Sua senha"
                required
              />
            </div>

            {error && (
              <p className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-amber-400 font-black uppercase tracking-[0.18em] text-black transition active:scale-[0.985] disabled:opacity-50"
            >
              {submitting ? "Abrindo escudo..." : "Entrar na área do motoclube"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-4 grid gap-2 text-center">
            <Link to="/cadastro" className="text-xs font-black uppercase tracking-[0.2em] text-amber-300">Ainda não é associado? Criar cadastro</Link>
            <Link to="/parceiro" className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-600">Acesso do parceiro comercial</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
