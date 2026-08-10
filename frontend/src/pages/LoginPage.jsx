import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";
import { BrandCrest } from "../components/BrandCrest.jsx";

const HERO = "https://images.pexels.com/photos/9789339/pexels-photo-9789339.jpeg?auto=compress&cs=tinysrgb&w=2200";

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

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
    <main className="mc-auth-shell">
      <img src={HERO} alt="Motociclistas reunidos na estrada" className="mc-auth-photo" />
      <div className="mc-auth-overlay" />
      <header className="mc-auth-top">
        <Link to="/" className="mc-auth-back"><ArrowLeft /> Voltar para o motoclube</Link>
        <span>SEDE DIGITAL • ACESSO DO ASSOCIADO</span>
      </header>

      <section className="mc-auth-grid">
        <div className="mc-auth-identity">
          <div className="mc-auth-crest"><BrandCrest active size="large" /></div>
          <p className="mc-auth-kicker">IRMÃOS DO ASFALTO • MOTOCLUBE</p>
          <h1>O ESCUDO NÃO É UM LOGIN.<br /><span>É PERTENCIMENTO.</span></h1>
          <p className="mc-auth-copy">Entre na sede digital para acessar seu escudo, parceiros de estrada, benefícios, situação no clube e canais da irmandade.</p>
          <div className="mc-auth-values"><span>HONRA</span><i /><span>RESPEITO</span><i /><span>IRMANDADE</span></div>
        </div>

        <div className="mc-auth-panel-wrap">
          <div className="mc-auth-panel">
            <div className="mc-auth-panel-bar"><ShieldCheck /> ÁREA RESERVADA DO ASSOCIADO</div>
            <p className="mc-auth-kicker">PORTÃO DA SEDE</p>
            <h2>ABRA SEU ESCUDO DIGITAL</h2>
            <p className="mc-auth-muted">Use o mesmo acesso vinculado ao seu cadastro no motoclube.</p>

            <form onSubmit={handleSubmit} className="mc-auth-form">
              <AuthField icon={<Mail />} label="E-mail do associado" type="email" autoComplete="email" value={form.email} onChange={(email) => setForm((current) => ({ ...current, email }))} placeholder="voce@email.com" />
              <AuthField icon={<LockKeyhole />} label="Senha" type="password" autoComplete="current-password" value={form.senha} onChange={(senha) => setForm((current) => ({ ...current, senha }))} placeholder="Sua senha" />

              {error && <p className="mc-auth-error">{error}</p>}

              <button type="submit" disabled={submitting} className="mc-auth-submit">
                {submitting ? "ABRINDO A SEDE..." : "ENTRAR NA SEDE DIGITAL"}
                <ArrowRight />
              </button>
            </form>

            <div className="mc-auth-links">
              <Link to="/cadastro">Ainda não faz parte? Solicitar entrada</Link>
              <Link to="/parceiro">Acesso do parceiro credenciado</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AuthField({ icon, label, type, autoComplete, value, onChange, placeholder }) {
  return (
    <label className="mc-auth-field-wrap">
      <span>{label}</span>
      <div className="mc-auth-field">
        {icon}
        <input type={type} autoComplete={autoComplete} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required />
      </div>
    </label>
  );
}
