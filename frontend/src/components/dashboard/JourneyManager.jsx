import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, CheckCircle2, Circle, Clock3, Route, Save, Shield, UserCheck } from "lucide-react";
import { api } from "../../services/api.js";

export function JourneyManager({ members = [], onRefresh }) {
  const [selectedId, setSelectedId] = useState("");
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ padrinho: "", dataEntrada: "", status: "em_analise", observacoes: "" });
  const [notes, setNotes] = useState({});

  const selectedMember = useMemo(() => members.find((item) => item.id === selectedId), [members, selectedId]);
  const sponsorOptions = useMemo(
    () => members.filter((item) => item.id !== selectedId && item.patente !== "Candidato"),
    [members, selectedId]
  );

  async function load(id = selectedId) {
    if (!id) { setJourney(null); return; }
    setLoading(true);
    setMessage("");
    try {
      const data = await api(`/api/admin/journey/${id}`);
      setJourney(data.journey);
      setForm({
        padrinho: data.journey?.padrinho?.id || "",
        dataEntrada: toDateInput(data.journey?.dataEntrada),
        status: data.journey?.status || "em_analise",
        observacoes: data.journey?.observacoes || ""
      });
      setNotes(Object.fromEntries((data.journey?.requisitos || []).map((item) => [item.key, item.notes || ""])));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (selectedId) load(selectedId); }, [selectedId]);

  async function saveJourney(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await api(`/api/admin/journey/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({
          padrinho: form.padrinho || null,
          dataEntrada: new Date(`${form.dataEntrada}T12:00:00`).toISOString(),
          status: form.status,
          observacoes: form.observacoes
        })
      });
      setJourney(data.journey);
      setMessage("Jornada atualizada.");
      await onRefresh?.();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateRequirement(item) {
    setLoading(true);
    setMessage("");
    try {
      const data = await api(`/api/admin/journey/${selectedId}/requirements/${encodeURIComponent(item.key)}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !item.completed, notes: notes[item.key] || "" })
      });
      setJourney(data.journey);
      setMessage(item.completed ? "Requisito reaberto." : "Requisito concluído.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function promote(force = false) {
    if (!journey?.nextPatent) return;
    if (force && !window.confirm(`Promover excepcionalmente para ${journey.nextPatent} mesmo com requisitos pendentes?`)) return;
    setLoading(true);
    setMessage("");
    try {
      const data = await api(`/api/admin/journey/${selectedId}/promote`, {
        method: "POST",
        body: JSON.stringify({
          force,
          notes: force ? "Promoção excepcional aprovada pela Diretoria." : "Requisitos cumpridos e promoção aprovada pela Diretoria."
        })
      });
      setJourney(data.journey);
      setMessage(data.message);
      await onRefresh?.();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mc-journey-admin">
      <div className="mc-content-manager-heading">
        <div><p>JORNADA DO INTEGRANTE</p><h3>Progressão, padrinho e histórico</h3></div>
        <span><Shield /> {members.length} integrantes</span>
      </div>

      <label className="mc-admin-field">
        <span>Selecionar integrante</span>
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          <option value="">Escolha um membro</option>
          {members.map((member) => <option key={member.id} value={member.id}>{member.apelidoEstrada} • {member.patente}</option>)}
        </select>
      </label>

      {message && <div className="mc-content-message">{message}</div>}
      {loading && !journey && <div className="mc-journey-state">Carregando jornada...</div>}

      {journey && selectedMember && (
        <div className="mc-journey-admin-body">
          <div className="mc-journey-admin-summary">
            <div><small>INTEGRANTE</small><strong>{selectedMember.apelidoEstrada}</strong><span>{selectedMember.nome}</span></div>
            <div><small>PATENTE ATUAL</small><strong>{journey.member.patente}</strong><span>{journey.nextPatent ? `Próxima: ${journey.nextPatent}` : "Etapa máxima da progressão"}</span></div>
            <div><small>PROGRESSO</small><strong>{journey.progress.percent}%</strong><span>{journey.progress.completed}/{journey.progress.total} requisitos</span></div>
          </div>

          <div className="mc-journey-admin-metrics">
            <div><Clock3 /><span>Tempo de jornada</span><strong>{journey.metrics.tenureDays} dias</strong></div>
            <div><Route /><span>Participações registradas</span><strong>{journey.metrics.participacoesRegistradas}</strong></div>
            <div><UserCheck /><span>Padrinho</span><strong>{journey.padrinho?.apelidoEstrada || "A definir"}</strong></div>
          </div>

          <form onSubmit={saveJourney} className="mc-journey-admin-form">
            <div className="grid gap-3 md:grid-cols-3">
              <label className="mc-admin-field"><span>Padrinho</span><select value={form.padrinho} onChange={(event) => setForm((current) => ({ ...current, padrinho: event.target.value }))}><option value="">A definir</option>{sponsorOptions.map((member) => <option key={member.id} value={member.id}>{member.apelidoEstrada} • {member.patente}</option>)}</select></label>
              <label className="mc-admin-field"><span>Data de entrada</span><input type="date" value={form.dataEntrada} onChange={(event) => setForm((current) => ({ ...current, dataEntrada: event.target.value }))} required /></label>
              <label className="mc-admin-field"><span>Status da jornada</span><select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><option value="em_analise">Em análise</option><option value="ativo">Ativo</option><option value="pausado">Pausado</option></select></label>
            </div>
            <label className="mc-admin-field"><span>Observações internas</span><textarea rows="4" value={form.observacoes} onChange={(event) => setForm((current) => ({ ...current, observacoes: event.target.value }))} placeholder="Registre avaliações, alinhamentos e observações da Diretoria." /></label>
            <button disabled={loading} className="mc-content-submit"><Save /> Salvar acompanhamento</button>
          </form>

          <div className="mc-journey-admin-requirements">
            <div className="mc-journey-section-title"><CheckCircle2 /><div><p>REQUISITOS DA ETAPA</p><h4>Acompanhamento pela Diretoria</h4></div></div>
            {journey.requisitos.length === 0 && <div className="mc-journey-state">Não há requisitos de progressão automática para esta patente.</div>}
            {journey.requisitos.map((item) => (
              <article key={item.key} className={item.completed ? "is-done" : ""}>
                <button type="button" onClick={() => updateRequirement(item)} disabled={loading} aria-label={item.completed ? "Reabrir requisito" : "Concluir requisito"}>{item.completed ? <BadgeCheck /> : <Circle />}</button>
                <div><strong>{item.label}</strong><input value={notes[item.key] || ""} onChange={(event) => setNotes((current) => ({ ...current, [item.key]: event.target.value }))} placeholder="Observação sobre este requisito" /></div>
                <span>{item.completed ? "CONCLUÍDO" : "PENDENTE"}</span>
              </article>
            ))}
          </div>

          {journey.nextPatent && (
            <div className="mc-journey-promotion-box">
              <div><p>PRÓXIMA PATENTE</p><h4>{journey.nextPatent}</h4><span>{journey.progress.ready ? "Todos os requisitos obrigatórios foram concluídos." : "Ainda existem requisitos obrigatórios pendentes."}</span></div>
              <div><button type="button" onClick={() => promote(false)} disabled={loading || !journey.progress.ready}>APROVAR PROMOÇÃO</button>{!journey.progress.ready && <button type="button" className="is-exception" onClick={() => promote(true)} disabled={loading}>PROMOÇÃO EXCEPCIONAL</button>}</div>
            </div>
          )}

          {journey.historico?.length > 0 && (
            <div className="mc-journey-admin-history">
              <p>HISTÓRICO DE PATENTES</p>
              {[...journey.historico].reverse().map((item) => <article key={item._id || `${item.fromPatent}-${item.toPatent}-${item.approvedAt}`}><strong>{item.fromPatent} → {item.toPatent}</strong><span>{formatDate(item.approvedAt)}</span><small>{item.notes || "Promoção registrada."}</small></article>)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function toDateInput(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}
