import { useEffect, useState } from "react";
import { AlertTriangle, Bike, CheckCircle2, RefreshCw, ShieldCheck } from "lucide-react";
import { api } from "../../services/api.js";

export function FleetHealthManager() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true); setMessage("");
    try {
      setData(await api("/api/admin/motorcycles/overview"));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const overview = data?.overview || {};
  const attention = data?.attentionList || [];

  return (
    <section className="mc-fleet-panel">
      <div className="mc-content-manager-heading">
        <div><p>SAÚDE DA FROTA</p><h3>Motos com ficha ativa na sede digital</h3></div>
        <button type="button" onClick={load} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Atualizar</button>
      </div>

      <p className="mc-fleet-note">Este painel mostra somente lembretes configurados pelos próprios integrantes. Ele não substitui inspeção mecânica nem cria intervalos de manutenção automaticamente.</p>
      {message && <div className="mc-content-message">{message}</div>}

      <div className="mc-fleet-stats">
        <div><Bike /><span>FICHAS ATIVAS</span><strong>{overview.motorcyclesTracked ?? "—"}</strong></div>
        <div className="is-danger"><AlertTriangle /><span>COM VENCIDOS</span><strong>{overview.overdue ?? "—"}</strong></div>
        <div className="is-warning"><ShieldCheck /><span>EM ATENÇÃO</span><strong>{overview.attention ?? "—"}</strong></div>
        <div className="is-good"><CheckCircle2 /><span>SEM ALERTAS</span><strong>{overview.healthy ?? "—"}</strong></div>
      </div>

      <div className="mc-fleet-list">
        <div className="mc-garage-section-title"><AlertTriangle /><div><p>ATENÇÃO OPERACIONAL</p><h4>Integrantes com lembretes próximos ou vencidos</h4></div></div>
        {loading && !data && <div className="mc-garage-state">Atualizando frota...</div>}
        {!loading && attention.length === 0 && <div className="mc-garage-state">Nenhuma moto com alerta configurado neste momento.</div>}
        {attention.map((entry) => <article key={entry.id}>
          <div><b>{entry.member.apelidoEstrada}</b><span>{entry.member.moto?.modelo || "Moto"} • {entry.member.moto?.placa || "—"}</span></div>
          <strong className={entry.summary.overdue > 0 ? "is-danger" : "is-warning"}>{entry.summary.overdue > 0 ? `${entry.summary.overdue} vencido(s)` : `${entry.summary.attention} em atenção`}</strong>
          <div className="mc-fleet-reminders">{entry.reminders.filter((item) => item.status === "vencido" || item.status === "atencao").map((item) => <span key={item.key}>{item.label}: {item.reason}</span>)}</div>
        </article>)}
      </div>
    </section>
  );
}
