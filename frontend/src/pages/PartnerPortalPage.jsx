import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Camera, History, LockKeyhole, LogOut, Mail, ScanLine, ShieldAlert, Store, XCircle } from "lucide-react";
import { BrandCrest } from "../components/BrandCrest.jsx";
import { api } from "../services/api.js";

export function PartnerPortalPage() {
  const [partner, setPartner] = useState(null);
  const [checking, setChecking] = useState(true);
  const [credentials, setCredentials] = useState({ email: "", senha: "" });
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    api("/api/partner/auth/me")
      .then((data) => setPartner(data.partner))
      .catch(() => setPartner(null))
      .finally(() => setChecking(false));
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setAuthError("");

    try {
      const data = await api("/api/partner/auth/login", {
        method: "POST",
        body: JSON.stringify(credentials)
      });
      setPartner(data.partner);
    } catch (error) {
      setAuthError(error.message);
    }
  }

  async function handleLogout() {
    await api("/api/partner/auth/logout", { method: "POST" });
    setPartner(null);
  }

  if (checking) {
    return <main className="page-shell grid min-h-screen place-items-center text-zinc-500">Carregando portal...</main>;
  }

  if (!partner) {
    return <PartnerLogin credentials={credentials} setCredentials={setCredentials} error={authError} onSubmit={handleLogin} />;
  }

  return <PartnerValidator partner={partner} onLogout={handleLogout} />;
}

function PartnerLogin({ credentials, setCredentials, error, onSubmit }) {
  return (
    <main className="page-shell min-h-screen px-4 py-8 text-zinc-100">
      <section className="mx-auto max-w-md">
        <div className="steel-card rounded-[2rem] p-5">
          <div className="flex items-center gap-4">
            <BrandCrest active size="default" compact />
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Portal comercial</p>
              <h1 className="mt-2 text-2xl font-black uppercase text-white">Parceiro da irmandade</h1>
              <p className="mt-2 text-sm text-zinc-500">Valide o escudo antes de liberar o benefício.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <PartnerField icon={<Mail className="h-4 w-4" />} type="email" placeholder="E-mail do parceiro" value={credentials.email} onChange={(email) => setCredentials((current) => ({ ...current, email }))} />
            <PartnerField icon={<LockKeyhole className="h-4 w-4" />} type="password" placeholder="Senha" value={credentials.senha} onChange={(senha) => setCredentials((current) => ({ ...current, senha }))} />
            {error && <p className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
            <button className="h-14 rounded-2xl bg-amber-400 font-black uppercase tracking-[0.18em] text-black">Entrar para validar</button>
          </form>
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

  useEffect(() => {
    loadRecent();
    return stopCamera;
  }, []);

  async function loadRecent() {
    try {
      const data = await api("/api/partner/auth/validations");
      setRecent(data.validations || []);
    } catch {
      setRecent([]);
    }
  }

  function extractToken(value) {
    const text = String(value || "").trim();
    if (!text) return "";

    try {
      const parsed = JSON.parse(text);
      return parsed.token || text;
    } catch {
      return text;
    }
  }

  async function validateCode(value = rawCode) {
    const token = extractToken(value);
    if (!token) return;

    setValidating(true);
    setError("");
    setResult(null);

    try {
      const data = await api("/api/partner/qr/validate", {
        method: "POST",
        body: JSON.stringify({ token })
      });
      setResult(data);
      setRawCode("");
      loadRecent();
    } catch (err) {
      setError(err.data?.reason || err.message);
      setResult({ valid: false });
      loadRecent();
    } finally {
      setValidating(false);
    }
  }

  async function startCamera() {
    setError("");

    if (!("BarcodeDetector" in window)) {
      setError("scanner_camera_indisponivel");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const detector = new window.BarcodeDetector({ formats: ["qr_code"] });

      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || validating) return;
        const codes = await detector.detect(videoRef.current);
        const value = codes?.[0]?.rawValue;
        if (value) {
          stopCamera();
          validateCode(value);
        }
      }, 450);
    } catch {
      setError("Não foi possível acessar a câmera. Use a leitura manual abaixo.");
    }
  }

  function stopCamera() {
    if (scanTimerRef.current) window.clearInterval(scanTimerRef.current);
    scanTimerRef.current = null;
    streamRef.current?.getTracks()?.forEach((track) => track.stop());
    streamRef.current = null;
  }

  return (
    <main className="page-shell min-h-screen px-4 py-5 text-zinc-100">
      <section className="mx-auto max-w-lg">
        <header className="mb-4 flex items-center justify-between rounded-[1.75rem] border border-amber-400/20 bg-black/70 p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300"><Store className="h-5 w-5" /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Parceiro autenticado</p>
              <h1 className="mt-1 text-lg font-black uppercase text-white">{partner.nome}</h1>
            </div>
          </div>
          <button onClick={onLogout} className="grid h-11 w-11 place-items-center rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-500"><LogOut className="h-4 w-4" /></button>
        </header>

        <section className="steel-card rounded-[2rem] p-5">
          <div className="text-center">
            <ScanLine className="mx-auto h-10 w-10 text-amber-300" />
            <p className="mt-3 text-[10px] font-black uppercase tracking-[0.34em] text-amber-400">Validação do escudo</p>
            <h2 className="mt-2 text-2xl font-black uppercase text-white">Leia o QR do associado</h2>
          </div>

          <video ref={videoRef} className="mt-5 aspect-square w-full rounded-[1.75rem] border border-zinc-800 bg-black object-cover" playsInline muted />

          <button onClick={startCamera} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 font-black uppercase tracking-[0.18em] text-black">
            <Camera className="h-4 w-4" /> Abrir câmera
          </button>

          <div className="my-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
            <span className="h-px flex-1 bg-zinc-800" /> ou <span className="h-px flex-1 bg-zinc-800" />
          </div>

          <textarea value={rawCode} onChange={(event) => setRawCode(event.target.value)} placeholder="Cole aqui o conteúdo lido do QR" className="min-h-28 w-full resize-none rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm outline-none focus:border-amber-400/30" />
          <button onClick={() => validateCode()} disabled={validating || !rawCode.trim()} className="mt-3 h-14 w-full rounded-2xl border border-amber-400/30 bg-amber-400/10 font-black uppercase tracking-[0.16em] text-amber-300 disabled:opacity-40">
            {validating ? "Validando..." : "Validar código"}
          </button>

          <ValidationResult result={result} error={error} />
        </section>

        <section className="steel-card mt-4 rounded-[2rem] p-5">
          <div className="flex items-center gap-3"><History className="h-5 w-5 text-amber-300" /><h2 className="text-lg font-black uppercase text-white">Validações recentes</h2></div>
          <div className="mt-4 grid gap-3">
            {recent.length === 0 ? (
              <p className="rounded-2xl border border-zinc-800 bg-black/20 p-4 text-sm text-zinc-600">Nenhuma validação registrada neste parceiro.</p>
            ) : recent.map((item) => (
              <div key={item._id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/5 bg-black/25 p-3">
                <div>
                  <p className="text-sm font-black uppercase text-white">{item.membro?.apelidoEstrada || "Código inválido"}</p>
                  <p className="mt-1 text-xs text-zinc-600">{item.membro?.patente || item.motivo}</p>
                </div>
                <span className={item.valido ? "text-xs font-black uppercase text-emerald-400" : "text-xs font-black uppercase text-red-400"}>{item.valido ? "Válido" : "Negado"}</span>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function ValidationResult({ result, error }) {
  if (!result && !error) return null;

  if (result?.valid) {
    return (
      <div className="mt-5 rounded-[1.75rem] border border-emerald-400/30 bg-emerald-400/10 p-5 text-center">
        <BadgeCheck className="mx-auto h-12 w-12 text-emerald-400" />
        <h3 className="mt-3 text-2xl font-black uppercase text-emerald-300">Escudo válido</h3>
        <p className="mt-2 text-lg font-black uppercase text-white">{result.member.apelidoEstrada}</p>
        <p className="mt-1 text-sm text-zinc-400">{result.member.patente} • {result.member.moto.modelo} • {result.member.moto.placa}</p>
        <p className="mt-4 rounded-2xl bg-emerald-400/10 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Benefício pode ser liberado</p>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-[1.75rem] border border-red-500/25 bg-red-500/10 p-5 text-center">
      <XCircle className="mx-auto h-12 w-12 text-red-400" />
      <h3 className="mt-3 text-xl font-black uppercase text-red-300">Escudo não validado</h3>
      <p className="mt-2 text-sm text-zinc-500">{friendlyReason(error)}</p>
    </div>
  );
}

function friendlyReason(reason) {
  const reasons = {
    expired: "O QR Code expirou. Peça ao associado para atualizar o escudo.",
    inactive_subscription: "A assinatura do associado está inativa.",
    invalid_signature: "A assinatura digital do QR não confere.",
    member_not_found: "O associado não foi encontrado.",
    invalid_token: "O conteúdo lido não é um QR válido do motoclube.",
    scanner_camera_indisponivel: "Este navegador não oferece leitura nativa de QR. Use a entrada manual."
  };
  return reasons[reason] || reason || "Não foi possível validar o escudo.";
}

function PartnerField({ icon, type, placeholder, value, onChange }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4">
      <span className="text-zinc-600">{icon}</span>
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="h-14 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-700" required />
    </div>
  );
}
