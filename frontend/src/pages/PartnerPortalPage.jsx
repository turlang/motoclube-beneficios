import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BadgeCheck, Camera, History, LockKeyhole, LogOut, Mail, ScanLine, ShieldCheck, Store, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandCrest } from "../components/BrandCrest.jsx";
import { api } from "../services/api.js";

const HERO = "https://images.pexels.com/photos/5195487/pexels-photo-5195487.jpeg?auto=compress&cs=tinysrgb&w=2000";

export function PartnerPortalPage() {
  const [partner, setPartner] = useState(null);
  const [checking, setChecking] = useState(true);
  const [credentials, setCredentials] = useState({ email: "", senha: "" });
  const [authError, setAuthError] = useState("");

  useEffect(() => { api("/api/partner/auth/me").then((data) => setPartner(data.partner)).catch(() => setPartner(null)).finally(() => setChecking(false)); }, []);

  async function handleLogin(event) {
    event.preventDefault(); setAuthError("");
    try { const data = await api("/api/partner/auth/login", { method: "POST", body: JSON.stringify(credentials) }); setPartner(data.partner); }
    catch (error) { setAuthError(error.message); }
  }

  async function handleLogout() { await api("/api/partner/auth/logout", { method: "POST" }); setPartner(null); }

  if (checking) return <main className="mc-partner-loading"><BrandCrest active compact /><span>ABRINDO PORTAL CREDENCIADO...</span></main>;
  if (!partner) return <PartnerLogin credentials={credentials} setCredentials={setCredentials} error={authError} onSubmit={handleLogin} />;
  return <PartnerValidator partner={partner} onLogout={handleLogout} />;
}

function PartnerLogin({ credentials, setCredentials, error, onSubmit }) {
  return (
    <main className="mc-auth-shell mc-partner-login-shell">
      <img src={HERO} alt="Motociclistas rodando na chuva" className="mc-auth-photo" />
      <div className="mc-auth-overlay" />
      <header className="mc-auth-top"><Link to="/" className="mc-auth-back"><ArrowLeft /> Voltar ao motoclube</Link><span>REDE CREDENCIADA • VALIDAÇÃO DE ESCUDO</span></header>
      <section className="mc-auth-grid">
        <div className="mc-auth-identity">
          <div className="mc-auth-crest"><BrandCrest active size="large" /></div>
          <p className="mc-auth-kicker">PARCEIRO DA ESTRADA</p>
          <h1>O BENEFÍCIO SÓ VALE <span>COM ESCUDO VALIDADO.</span></h1>
          <p className="mc-auth-copy">Este portal é exclusivo para estabelecimentos credenciados. A leitura confirma identidade, patente e situação ativa antes da concessão do benefício.</p>
        </div>
        <div className="mc-auth-panel-wrap">
          <div className="mc-auth-panel">
            <div className="mc-auth-panel-bar"><Store /> PORTAL DO PARCEIRO CREDENCIADO</div>
            <p className="mc-auth-kicker">ACESSO COMERCIAL</p>
            <h2>VALIDAÇÃO DA IRMANDADE</h2>
            <form onSubmit={onSubmit} className="mc-auth-form">
              <PartnerField icon={<Mail />} type="email" placeholder="E-mail do parceiro" value={credentials.email} onChange={(email) => setCredentials((current) => ({ ...current, email }))} />
              <PartnerField icon={<LockKeyhole />} type="password" placeholder="Senha" value={credentials.senha} onChange={(senha) => setCredentials((current) => ({ ...current, senha }))} />
              {error && <p className="mc-auth-error">{error}</p>}
              <button className="mc-auth-submit">ENTRAR PARA VALIDAR <ShieldCheck /></button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}

function PartnerValidator({ partner, onLogout }) {
  const [rawCode, setRawCode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);
  const [recent, setRecent] = useState([]);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);

  useEffect(() => { loadRecent(); return stopCamera; }, []);

  async function loadRecent() { try { const data = await api("/api/partner/auth/validations"); setRecent(data.validations || []); } catch { setRecent([]); } }
  function extractToken(value) { const text = String(value || "").trim(); if (!text) return ""; try { const parsed = JSON.parse(text); return parsed.token || text; } catch { return text; } }

  async function validateCode(value = rawCode) {
    const token = extractToken(value); if (!token) return;
    setValidating(true); setError(""); setResult(null);
    try { const data = await api("/api/partner/qr/validate", { method: "POST", body: JSON.stringify({ token }) }); setResult(data); setRawCode(""); loadRecent(); }
    catch (err) { setError(err.data?.reason || err.message); setResult({ valid: false }); loadRecent(); }
    finally { setValidating(false); }
  }

  async function startCamera() {
    setError("");
    if (!("BarcodeDetector" in window)) { setError("scanner_camera_indisponivel"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream; videoRef.current.srcObject = stream; await videoRef.current.play();
      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
      scanTimerRef.current = window.setInterval(async () => { if (!videoRef.current || validating) return; const codes = await detector.detect(videoRef.current); const value = codes?.[0]?.rawValue; if (value) { stopCamera(); validateCode(value); } }, 450);
    } catch { setError("Não foi possível acessar a câmera. Use a leitura manual abaixo."); }
  }

  function stopCamera() { if (scanTimerRef.current) window.clearInterval(scanTimerRef.current); scanTimerRef.current = null; streamRef.current?.getTracks()?.forEach((track) => track.stop()); streamRef.current = null; }

  return (
    <main className="mc-partner-shell">
      <header className="mc-partner-header">
        <div><div className="mc-partner-mark"><BrandCrest active compact /></div><p>PARCEIRO CREDENCIADO</p><h1>{partner.nome}</h1></div>
        <button onClick={onLogout} aria-label="Sair"><LogOut /></button>
      </header>

      <section className="mc-partner-grid">
        <div className="mc-partner-scanner">
          <div className="mc-partner-title"><ScanLine /><div><p>VALIDAÇÃO DO ESCUDO</p><h2>CONFIRA ANTES DE LIBERAR</h2></div></div>
          <video ref={videoRef} className="mc-scanner-video" playsInline muted />
          <button onClick={startCamera} className="mc-scanner-primary"><Camera /> ABRIR CÂMERA</button>
          <div className="mc-scanner-or"><span /> OU USE O CÓDIGO <span /></div>
          <textarea value={rawCode} onChange={(event) => setRawCode(event.target.value)} placeholder="Cole aqui o conteúdo lido do QR" />
          <button onClick={() => validateCode()} disabled={validating || !rawCode.trim()} className="mc-scanner-secondary">{validating ? "VALIDANDO..." : "VALIDAR CÓDIGO"}</button>
          <ValidationResult result={result} error={error} />
        </div>

        <aside className="mc-partner-history">
          <div className="mc-partner-title"><History /><div><p>REGISTRO DA ROTA</p><h2>VALIDAÇÕES RECENTES</h2></div></div>
          <div className="mc-validation-list">
            {recent.length === 0 ? <p className="mc-empty-state">Nenhuma validação registrada neste parceiro.</p> : recent.map((item) => (
              <div key={item._id} className="mc-validation-row">
                <div><strong>{item.membro?.apelidoEstrada || "Código inválido"}</strong><span>{item.membro?.patente || item.motivo}</span></div>
                <b className={item.valido ? "ok" : "denied"}>{item.valido ? "VÁLIDO" : "NEGADO"}</b>
              </div>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}

function ValidationResult({ result, error }) {
  if (!result && !error) return null;
  if (result?.valid) return <div className="mc-validation-result is-valid"><BadgeCheck /><h3>ESCUDO VÁLIDO</h3><strong>{result.member.apelidoEstrada}</strong><p>{result.member.patente} • {result.member.moto.modelo} • {result.member.moto.placa}</p><span>BENEFÍCIO LIBERADO</span></div>;
  return <div className="mc-validation-result is-invalid"><XCircle /><h3>ESCUDO NÃO VALIDADO</h3><p>{friendlyReason(error)}</p></div>;
}

function friendlyReason(reason) {
  const reasons = { expired: "O QR Code expirou. Peça ao associado para atualizar o escudo.", inactive_subscription: "A assinatura do associado está inativa.", invalid_signature: "A assinatura digital do QR não confere.", member_not_found: "O associado não foi encontrado.", invalid_token: "O conteúdo lido não é um QR válido do motoclube.", scanner_camera_indisponivel: "Este navegador não oferece leitura nativa de QR. Use a entrada manual." };
  return reasons[reason] || reason || "Não foi possível validar o escudo.";
}

function PartnerField({ icon, type, placeholder, value, onChange }) {
  return <div className="mc-auth-field">{icon}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required /></div>;
}
