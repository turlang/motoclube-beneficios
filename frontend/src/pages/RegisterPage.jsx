import { useState } from "react";
import { ArrowLeft, ArrowRight, Bike, IdCard, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { BrandCrest } from "../components/BrandCrest.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { api } from "../services/api.js";

const HERO = "https://images.pexels.com/photos/12202235/pexels-photo-12202235.jpeg?auto=compress&cs=tinysrgb&w=2200";
const initialForm = { nome: "", apelidoEstrada: "", cpf: "", email: "", senha: "", moto: { modelo: "", placa: "" } };

export function RegisterPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function updateField(field, value) { setForm((current) => ({ ...current, [field]: value })); }
  function updateMoto(field, value) { setForm((current) => ({ ...current, moto: { ...current.moto, [field]: value } })); }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const data = await api("/api/auth/register", { method: "POST", body: JSON.stringify(form) });
      setUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mc-auth-shell mc-register-shell">
      <img src={HERO} alt="Motociclista em estrada aberta" className="mc-auth-photo" />
      <div className="mc-auth-overlay" />
      <header className="mc-auth-top">
        <Link to="/" className="mc-auth-back"><ArrowLeft /> Voltar para o motoclube</Link>
        <span>ENTRADA NA IRMANDADE • NOVO ASSOCIADO</span>
      </header>

      <section className="mc-register-grid">
        <aside className="mc-register-story">
          <div className="mc-register-crest"><BrandCrest active size="large" /></div>
          <p className="mc-auth-kicker">ANTES DO BENEFÍCIO, VEM O COMPROMISSO</p>
          <h1>TODO ESCUDO COMEÇA <span>COM UM PRIMEIRO PASSO.</span></h1>
          <p>O cadastro inicia sua caminhada como <strong>Próspero</strong>. A identidade digital é criada imediatamente, mas o QR de benefícios só é liberado quando a situação da assinatura estiver ativa.</p>
          <div className="mc-register-steps">
            <div><b>01</b><span>Identidade</span><small>Nome, apelido e CPF.</small></div>
            <div><b>02</b><span>Sua máquina</span><small>Modelo e placa da moto.</small></div>
            <div><b>03</b><span>Entrada</span><small>Patente inicial Próspero.</small></div>
          </div>
        </aside>

        <div className="mc-auth-panel mc-register-panel">
          <div className="mc-auth-panel-bar">FICHA DE ENTRADA • IRMÃOS DO ASFALTO</div>
          <p className="mc-auth-kicker">NOVO ASSOCIADO</p>
          <h2>CRIE SUA IDENTIDADE DE ESTRADA</h2>

          <form onSubmit={handleSubmit} className="mc-register-form">
            <FormSection title="IDENTIDADE DO IRMÃO" />
            <Field icon={<UserRound />} label="Nome completo" value={form.nome} onChange={(value) => updateField("nome", value)} placeholder="Seu nome" />
            <Field icon={<IdCard />} label="Apelido de estrada" value={form.apelidoEstrada} onChange={(value) => updateField("apelidoEstrada", value)} placeholder="Ex.: Falcão" />
            <Field icon={<IdCard />} label="CPF" value={form.cpf} onChange={(value) => updateField("cpf", value)} placeholder="000.000.000-00" inputMode="numeric" />

            <FormSection title="ACESSO À SEDE DIGITAL" />
            <Field icon={<Mail />} label="E-mail" type="email" value={form.email} onChange={(value) => updateField("email", value)} placeholder="voce@email.com" />
            <Field icon={<LockKeyhole />} label="Senha" type="password" value={form.senha} onChange={(value) => updateField("senha", value)} placeholder="Mínimo 8 caracteres" />

            <FormSection title="SUA MÁQUINA" />
            <Field icon={<Bike />} label="Modelo da moto" value={form.moto.modelo} onChange={(value) => updateMoto("modelo", value)} placeholder="Ex.: Honda CG 160 Titan" />
            <Field icon={<Bike />} label="Placa" value={form.moto.placa} onChange={(value) => updateMoto("placa", value.toUpperCase())} placeholder="ABC1D23" />

            {error && <p className="mc-auth-error mc-register-full">{error}</p>}
            <button type="submit" disabled={submitting} className="mc-auth-submit mc-register-full">
              {submitting ? "CRIANDO SUA IDENTIDADE..." : "CRIAR MEU ESCUDO"}<ArrowRight />
            </button>
          </form>

          <p className="mc-register-note">A entrada digital não substitui as regras internas, convivência, avaliação ou demais critérios definidos pela Diretoria do motoclube.</p>
        </div>
      </section>
    </main>
  );
}

function FormSection({ title }) { return <div className="mc-form-section mc-register-full"><span>{title}</span></div>; }
function Field({ icon, label, type = "text", value, onChange, placeholder, inputMode }) {
  return (
    <label className="mc-auth-field-wrap">
      <span>{label}</span>
      <div className="mc-auth-field">
        {icon}
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} required />
      </div>
    </label>
  );
}
