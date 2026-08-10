import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, Pencil, Send, Trash2 } from "lucide-react";
import { api } from "../../services/api.js";
import { AdminInput } from "./DashboardUI.jsx";

const EMPTY = {
  titulo: "",
  mensagem: "",
  tipo: "comunicado",
  prioridade: "normal",
  targetAll: true,
  patentes: [],
  chapters: [],
  publishedAt: "",
  expiresAt: "",
  requiresAck: false,
  ativo: true
};

const PATENTS = ["Candidato", "Próspero", "Meio-Escudo", "Escudado", "Diretoria"];

export function CommunicationManager({ chapters = [] }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await api("/api/admin/communications");
      setItems(data.announcements || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function toggleArray(field, value) {
    setForm((current) => {
      const exists = current[field].includes(value);
      return { ...current, [field]: exists ? current[field].filter((item) => item !== value) : [...current[field], value] };
    });
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null
      };
      const endpoint = editingId ? `/api/admin/communications/${editingId}` : "/api/admin/communications";
      await api(endpoint, { method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload) });
      setForm(EMPTY);
      setEditingId("");
      setMessage(editingId ? "Comunicado atualizado." : "Comunicado publicado no mural.");
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function edit(item) {
    setEditingId(item._id);
    setForm({
      titulo: item.titulo || "",
      mensagem: item.mensagem || "",
      tipo: item.tipo || "comunicado",
      prioridade: item.prioridade || "normal",
      targetAll: Boolean(item.targetAll),
      patentes: item.patentes || [],
      chapters: (item.chapters || []).map((chapter) => chapter._id || chapter),
      publishedAt: toLocal(item.publishedAt),
      expiresAt: item.expiresAt ? toLocal(item.expiresAt) : "",
      requiresAck: Boolean(item.requiresAck),
      ativo: item.ativo !== false
    });
  }

  async function remove(id) {
    if (!window.confirm("Remover este comunicado do mural?")) return;
    setLoading(true);
    try {
      await api(`/api/admin/communications/${id}`, { method: "DELETE" });
      setMessage("Comunicado removido.");
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mc-communication-admin">
      <div className="mc-content-manager-heading">
        <div><p>COMUNICAÇÃO OFICIAL</p><h3>Mural da irmandade</h3></div>
        <span><BellRing /> {items.length} comunicados</span>
      </div>

      {message && <div className="mc-content-message">{message}</div>}

      <details className="steel-card p-5" open>
        <summary className="mc-content-summary"><Send /> PUBLICAR COMUNICADO</summary>
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <AdminInput label="Título" value={form.titulo} onChange={(value) => setForm((current) => ({ ...current, titulo: value }))} />
          <label className="mc-admin-field"><span>Mensagem</span><textarea rows="6" value={form.mensagem} onChange={(event) => setForm((current) => ({ ...current, mensagem: event.target.value }))} required /></label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="mc-admin-field"><span>Tipo</span><select value={form.tipo} onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value }))}><option value="comunicado">Comunicado</option><option value="aviso">Aviso</option><option value="convocacao">Convocação</option></select></label>
            <label className="mc-admin-field"><span>Prioridade</span><select value={form.prioridade} onChange={(event) => setForm((current) => ({ ...current, prioridade: event.target.value }))}><option value="normal">Normal</option><option value="importante">Importante</option><option value="urgente">Urgente</option></select></label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Publicar em" type="datetime-local" value={form.publishedAt} onChange={(value) => setForm((current) => ({ ...current, publishedAt: value }))} optional />
            <AdminInput label="Expira em" type="datetime-local" value={form.expiresAt} onChange={(value) => setForm((current) => ({ ...current, expiresAt: value }))} optional />
          </div>

          <label className="mc-content-toggle"><input type="checkbox" checked={form.targetAll} onChange={(event) => setForm((current) => ({ ...current, targetAll: event.target.checked }))} /><span>Enviar para todos os associados</span></label>

          {!form.targetAll && (
            <div className="mc-audience-builder">
              <div><p>PATENTES</p><div className="mc-audience-options">{PATENTS.map((patent) => <label key={patent}><input type="checkbox" checked={form.patentes.includes(patent)} onChange={() => toggleArray("patentes", patent)} /><span>{patent}</span></label>)}</div></div>
              <div><p>NÚCLEOS</p><div className="mc-audience-options">{chapters.filter((chapter) => chapter.ativo !== false).map((chapter) => <label key={chapter._id}><input type="checkbox" checked={form.chapters.includes(chapter._id)} onChange={() => toggleArray("chapters", chapter._id)} /><span>{chapter.nome} • {chapter.estado}</span></label>)}</div></div>
            </div>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <label className="mc-content-toggle"><input type="checkbox" checked={form.requiresAck} onChange={(event) => setForm((current) => ({ ...current, requiresAck: event.target.checked }))} /><span>Exigir confirmação de ciência</span></label>
            <label className="mc-content-toggle"><input type="checkbox" checked={form.ativo} onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.checked }))} /><span>Comunicado ativo</span></label>
          </div>

          <button disabled={loading} className="mc-content-submit"><Send /> {editingId ? "Salvar comunicado" : "Publicar no mural"}</button>
          {editingId && <button type="button" className="mc-content-cancel" onClick={() => { setEditingId(""); setForm(EMPTY); }}>Cancelar edição</button>}
        </form>
      </details>

      <div className="mc-admin-announcements">
        {items.map((item) => (
          <article key={item._id} className={`mc-admin-announcement priority-${item.prioridade}`}>
            <div>
              <p>{item.tipo} • {item.prioridade}</p>
              <h4>{item.titulo}</h4>
              <span>{item.targetAll ? "Todos os associados" : audienceLabel(item)}</span>
              <small><CheckCircle2 /> {item.readCount || 0} leituras • {item.ackCount || 0} ciências</small>
            </div>
            <aside><button type="button" onClick={() => edit(item)}><Pencil /></button><button type="button" onClick={() => remove(item._id)}><Trash2 /></button></aside>
          </article>
        ))}
      </div>
    </section>
  );
}

function toLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function audienceLabel(item) {
  const labels = [];
  if (item.patentes?.length) labels.push(item.patentes.join(", "));
  if (item.chapters?.length) labels.push(item.chapters.map((chapter) => chapter.nome || chapter).join(", "));
  return labels.join(" • ") || "Público segmentado";
}
