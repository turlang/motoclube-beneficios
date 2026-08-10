import { useEffect, useMemo, useState } from "react";
import { Bike, CalendarCheck2, MapPin, RefreshCw, Route, Save, UsersRound } from "lucide-react";
import { api } from "../../services/api.js";
import { AdminInput } from "./DashboardUI.jsx";

const emptyForm = {
  pontoEncontro: "",
  briefing: "",
  rotaResumo: "",
  distanciaKm: 0,
  nivelRota: "livre",
  capacidade: 0,
  confirmacaoAte: "",
  status: "agendado",
  resumoPosEvento: "",
  albumUrl: ""
};

export function EventRouteManager({ onEventsRefresh }) {
  const [events, setEvents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const selected = useMemo(() => events.find((item) => item._id === selectedId), [events, selectedId]);

  async function load() {
    setLoading(true);
    try {
      const data = await api("/api/admin/events");
      const next = data.events || [];
      setEvents(next);
      if (!selectedId && next.length) setSelectedId(next[0]._id);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!selected) return;
    setForm({
      pontoEncontro: selected.pontoEncontro || selected.local || "",
      briefing: selected.briefing || "",
      rotaResumo: selected.rotaResumo || "",
      distanciaKm: selected.distanciaKm || 0,
      nivelRota: selected.nivelRota || "livre",
      capacidade: selected.capacidade || 0,
      confirmacaoAte: toLocalDateTime(selected.confirmacaoAte),
      status: selected.status || "agendado",
      resumoPosEvento: selected.resumoPosEvento || "",
      albumUrl: selected.albumUrl || ""
    });
    api(`/api/admin/events/${selected._id}/participants`)
      .then((data) => setParticipants(data.participants || []))
      .catch(() => setParticipants([]));
  }, [selected?._id]);

  async function save(event) {
    event.preventDefault();
    if (!selectedId) return;
    setLoading(true);
    setMessage("");
    try {
      await api(`/api/admin/events/${selectedId}/operation`, {
        method: "PATCH",
        body: JSON.stringify({
          ...form,
          distanciaKm: Number(form.distanciaKm || 0),
          capacidade: Number(form.capacidade || 0),
          confirmacaoAte: form.confirmacaoAte ? new Date(form.confirmacaoAte).toISOString() : null
        })
      });
      setMessage("Briefing, confirmação e operação da rota atualizados.");
      await load();
      await onEventsRefresh?.();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mc-route-admin">
      <div className="mc-route-admin-head">
        <div><p>OPERAÇÃO DE ESTRADA</p><h3>Briefing, vagas e presença</h3></div>
        <button type="button" onClick={load} aria-label="Atualizar"><RefreshCw /></button>
      </div>

      {message && <div className="mc-event-message">{message}</div>}

      <label className="mc-admin-field">
        <span>Evento / rota</span>
        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
          <option value="">Selecione</option>
          {events.map((item) => <option key={item._id} value={item._id}>{formatDate(item.data)} — {item.titulo}</option>)}
        </select>
      </label>

      {selected && (
        <>
          <div className="mc-route-admin-stats">
            <div><CalendarCheck2 /><strong>{formatDateTime(selected.data)}</strong><span>data de saída</span></div>
            <div><UsersRound /><strong>{selected.confirmedCount || 0}{selected.capacidade ? ` / ${selected.capacidade}` : ""}</strong><span>confirmados</span></div>
            <div><Route /><strong>{selected.distanciaKm ? `${selected.distanciaKm} km` : "—"}</strong><span>distância</span></div>
          </div>

          <form onSubmit={save} className="mc-route-admin-form">
            <AdminInput label="Ponto de encontro" value={form.pontoEncontro} onChange={(value) => setForm((c) => ({ ...c, pontoEncontro: value }))} optional />
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminInput label="Distância (km)" type="number" value={form.distanciaKm} onChange={(value) => setForm((c) => ({ ...c, distanciaKm: value }))} optional />
              <AdminInput label="Capacidade (0 = livre)" type="number" value={form.capacidade} onChange={(value) => setForm((c) => ({ ...c, capacidade: value }))} optional />
              <label className="mc-admin-field"><span>Nível da rota</span><select value={form.nivelRota} onChange={(event) => setForm((c) => ({ ...c, nivelRota: event.target.value }))}><option value="livre">Livre</option><option value="leve">Leve</option><option value="moderado">Moderado</option><option value="experiente">Experiente</option></select></label>
              <label className="mc-admin-field"><span>Status</span><select value={form.status} onChange={(event) => setForm((c) => ({ ...c, status: event.target.value }))}><option value="agendado">Agendado</option><option value="realizado">Realizado</option><option value="cancelado">Cancelado</option></select></label>
            </div>
            <AdminInput label="Confirmação até" type="datetime-local" value={form.confirmacaoAte} onChange={(value) => setForm((c) => ({ ...c, confirmacaoAte: value }))} optional />
            <TextArea label="Resumo da rota" value={form.rotaResumo} onChange={(value) => setForm((c) => ({ ...c, rotaResumo: value }))} rows={3} />
            <TextArea label="Briefing para os participantes" value={form.briefing} onChange={(value) => setForm((c) => ({ ...c, briefing: value }))} rows={5} />
            <TextArea label="Registro pós-evento" value={form.resumoPosEvento} onChange={(value) => setForm((c) => ({ ...c, resumoPosEvento: value }))} rows={4} />
            <AdminInput label="Álbum pós-evento (URL)" value={form.albumUrl} onChange={(value) => setForm((c) => ({ ...c, albumUrl: value }))} optional />
            <button className="mc-route-save" disabled={loading}><Save /> Salvar operação</button>
          </form>

          <div className="mc-participant-board">
            <div className="mc-participant-head"><UsersRound /><div><p>LISTA DE PRESENÇA</p><h4>{participants.length} irmãos confirmados</h4></div></div>
            {participants.length === 0 ? <p className="mc-participant-empty">Ainda não há confirmações para este evento.</p> : (
              <div className="mc-participant-list">{participants.map((person) => <article key={person.id}><div className="mc-participant-avatar"><Bike /></div><div><strong>{person.apelidoEstrada || person.nome}</strong><span>{person.patente} • {person.moto?.modelo || "Moto não informada"}</span></div><MapPin /></article>)}</div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

function TextArea({ label, value, onChange, rows = 4 }) {
  return <label className="mc-admin-field"><span>{label}</span><textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sem data" : new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Sem data" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
}
