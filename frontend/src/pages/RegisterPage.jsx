import { useState } from "react";
import { ArrowLeft, ArrowRight, Bike, IdCard, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { BrandCrest } from "../components/BrandCrest.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../services/api.js";

const initialForm = {
  nome: "",
  apelidoEstrada: "",
  cpf: "",
  email: "",
  senha: "",
  moto: {
    modelo: "",
    placa: ""
  }
};

export function RegisterPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateMoto(field, value) {
    setForm((current) => ({
      ...current,
      moto: { ...current.moto, [field]: value }
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(form)
      });
      setUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell min-h-screen px-4 py-6 text-zinc-100">
      <section className="mx-auto max-w-md">
        <Link to="/login" className="mb-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-zinc-500">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="steel-card rounded-[2rem] p-5">
          <div className="flex items-center gap-4">
            <BrandCrest active size="default" compact />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-amber-400">Novo associado</p>
              <h1 className="mt-2 text-2xl font-black uppercase leading-tight text-white">Entre para a irmandade</h1>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            <Field icon={<UserRound className="h-4 w-4" />} label="Nome completo" value={form.nome} onChange={(value) => updateField("nome", value)} placeholder="Seu nome" />
            <Field icon={<IdCard className="h-4 w-4" />} label="Apelido de estrada" value={form.apelidoEstrada} onChange={(value) => updateField("apelidoEstrada", value)} placeholder="Ex.: Falcão" />
            <Field icon={<IdCard className="h-4 w-4" />} label="CPF" value={form.cpf} onChange={(value) => updateField("cpf", value)} placeholder="000.000.000-00" inputMode="numeric" />
            <Field icon={<Mail className="h-4 w-4" />} label="E-mail" type="email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="voce@email.com" />
            <Field icon={<LockKeyhole className="h-4 w-4" />} label="Senha" type="password" value={form.senha} onChange={(value) => updateField("senha", value)} placeholder="Mínimo 8 caracteres" />

            <div className="warning-stripes my-1 h-1 rounded-full opacity-50" />

            <Field icon={<Bike className="h-4 w-4" />} label="Modelo da moto" value={form.moto.modelo} onChange={(value) => updateMoto("modelo", value)} placeholder="Ex.: Honda CG 160 Titan" />
            <Field icon={<Bike className="h-4 w-4" />} label="Placa" value={form.moto.placa} onChange={(value) => updateMoto("placa", value.toUpperCase())} placeholder="ABC1D23" />

            {error && (
              <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
            )}

            <button type="submit" disabled={submitting} className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-amber-400 font-black uppercase tracking-[0.18em] text-black disabled:opacity-50">
              {submitting ? "Criando cadastro..." : "Criar meu escudo"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] leading-5 text-zinc-600">
            O cadastro cria a patente inicial Próspero e assinatura inativa até a confirmação do pagamento.
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({ icon, label, type = "text", value, onChange, placeholder, inputMode }) {
  return (
    <label>
      <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.28em] text-zinc-500">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 focus-within:border-amber-400/40">
        <span className="text-zinc-600">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
          required
        />
      </div>
    </label>
  );
}
