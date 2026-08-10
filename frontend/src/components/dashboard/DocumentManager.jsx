import { useEffect, useState } from "react";
import { FilePlus2, FileText, Pencil, ShieldCheck, Trash2, UsersRound } from "lucide-react";
import { api } from "../../services/api.js";
import { AdminInput } from "./DashboardUI.jsx";

const PATENTS = ["Candidato", "Próspero", "Meio-Escudo", "Escudado", "Diretoria"];
const EMPTY = {
  titulo: "",
  codigo: "",
  tipo: "regulamento",
  versao: "1.0",
  resumo: "",
  conteudo: "",
  obrigatorio: false,
  patentes: [],
  publishedAt: "",
  effectiveAt: "",
  ativo: true
};

export function DocumentManager() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [audit, setAudit] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await api("/api/admin/documents");
      setItems(data.documents || []);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function togglePatent(patent) {
    setForm((current) => ({
      ...current,
      patentes: current.patentes.includes(patent)
        ? current.patentes.filter((item) => item !== patent)
        : [...current.patentes, patent]
    }));
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        ...form,
        publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : new Date().toISOString(),
        effectiveAt: form.effectiveAt ? new Date(form.effectiveAt).toISOString() : new Date().toISOString()
      };
      await api(editingId ? `/api/admin/documents/${editingId}` : "/api/admin/documents", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify(payload)
      });
      setMessage(editingId ? "Documento atualizado." : "Documento publicado.");
      setEditingId("");
      setForm(EMPTY);
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
      codigo: item.codigo || "",
      tipo: item.tipo || "regulamento",
      versao: item.versao || "1.0",
      resumo: item.resumo || "",
      conteudo: item.conteudo || "",
      obrigatorio: Boolean(item.obrigatorio),
      patentes: item.patentes || [],
      publishedAt: toLocal(item.publishedAt),
      effectiveAt: toLocal(item.effectiveAt),
      ativo: item.ativo !== false
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id) {
    if (!window.confirm("Remover este documento? Se houver aceites registrados, o sistema impedirá a exclusão para preservar a auditoria.")) return;
    setLoading(true);
    setMessage("");
    try {
      await api(`/api/admin/documents/${id}`, { method: "DELETE" });
      setMessage("Documento removido.");
      await load();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function openAudit(id) {
    setLoading(true);
    setMessage("");
    try {
      const data = await api(`/api/admin/documents/${id}/acceptances`);
      setAudit(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mc-document-admin">
      <div className="mc-content-manager-heading">
        <div><p>DOCUMENTOS & REGULAMENTO</p><h3>Versões, obrigatoriedade e auditoria</h3></div>
        <span><ShieldCheck /> {items.filter((item) => item.ativo).length} vigentes</span>
      </div>

      {message && <div className="mc-content-message">{message}</div>}

      <details className="steel-card p-5" open>
        <summary className="mc-content-summary"><FilePlus2 /> {editingId ? "EDITAR DOCUMENTO" : "PUBLICAR NOVA VERSÃO"}</summary>
        <form onSubmit={submit} className="mt-5 grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Título" value={form.titulo} onChange={(value) => setForm((current) => ({ ...current, titulo: value }))} />
            <AdminInput label="Código permanente" value={form.codigo} onChange={(value) => setForm((current) => ({ ...current, codigo: slugify(value) }))} placeholder="ex.: regulamento-geral" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="mc-admin-field"><span>Tipo</span><select value={form.tipo} onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value }))}><option value="regulamento">Regulamento</option><option value="estatuto">Estatuto</option><option value="termo">Termo</option><option value="politica">Política</option><option value="codigo_conduta">Código de conduta</option><option value="outro">Outro</option></select></label>
            <AdminInput label="Versão" value={form.versao} onChange={(value) => setForm((current) => ({ ...current, versao: value }))} placeholder="1.0" />
            <label className="mc-admin-field"><span>Status</span><select value={form.ativo ? "ativo" : "inativo"} onChange={(event) => setForm((current) => ({ ...current, ativo: event.target.value === "ativo" }))}><option value="ativo">Vigente</option><option value="inativo">Arquivado</option></select></label>
          </div>
          <AdminInput label="Resumo" value={form.resumo} onChange={(value) => setForm((current) => ({ ...current, resumo: value }))} optional />
          <label className="mc-admin-field"><span>Conteúdo integral</span><textarea rows="14" value={form.conteudo} onChange={(event) => setForm((current) => ({ ...current, conteudo: event.target.value }))} placeholder="Cole ou escreva aqui o texto completo que será versionado e aceito pelos integrantes." required /></label>

          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Publicação" type="datetime-local" value={form.publishedAt} onChange={(value) => setForm((current) => ({ ...current, publishedAt: value }))} optional />
            <AdminInput label="Início da vigência" type="datetime-local" value={form.effectiveAt} onChange={(value) => setForm((current) => ({ ...current, effectiveAt: value }))} optional />
          </div>

          <label className="mc-content-toggle"><input type="checkbox" checked={form.obrigatorio} onChange={(event) => setForm((current) => ({ ...current, obrigatorio: event.target.checked }))} /><span>Exigir aceite para manter a situação documental regular</span></label>

          <div className="mc-document-audience">
            <p>PÚBLICO POR PATENTE <small>Sem seleção = todos</small></p>
            <div>{PATENTS.map((patent) => <label key={patent}><input type="checkbox" checked={form.patentes.includes(patent)} onChange={() => togglePatent(patent)} /><span>{patent}</span></label>)}</div>
          </div>

          <button disabled={loading} className="mc-content-submit"><FilePlus2 /> {editingId ? "Salvar documento" : "Publicar versão"}</button>
          {editingId && <button type="button" className="mc-content-cancel" onClick={() => { setEditingId(""); setForm(EMPTY); }}>Cancelar edição</button>}
        </form>
      </details>

      <div className="mc-admin-documents-list">
        {items.map((item) => (
          <article key={item._id} className={[item.ativo ? "is-active" : "is-archived", item.obrigatorio ? "is-required" : ""].join(" ")}>
            <div className="mc-admin-document-icon"><FileText /></div>
            <div className="mc-admin-document-copy">
              <p>{typeLabel(item.tipo)} • {item.codigo}</p>
              <h4>{item.titulo}</h4>
              <span>Versão {item.versao} • {item.obrigatorio ? "aceite obrigatório" : "informativo"} • {item.ativo ? "vigente" : "arquivado"}</span>
              <small>{item.acceptanceCount || 0} aceite(s) registrado(s) • hash {String(item.contentHash || "").slice(0, 12)}…</small>
            </div>
            <aside>
              <button type="button" onClick={() => openAudit(item._id)} title="Ver aceites"><UsersRound /></button>
              <button type="button" onClick={() => edit(item)} title="Editar"><Pencil /></button>
              <button type="button" onClick={() => remove(item._id)} title="Excluir"><Trash2 /></button>
            </aside>
          </article>
        ))}
      </div>

      {audit && (
        <div className="mc-document-audit">
          <div><p>AUDITORIA DE ACEITES</p><h4>{audit.document?.titulo} • versão {audit.document?.versao}</h4><button type="button" onClick={() => setAudit(null)}>Fechar</button></div>
          {audit.acceptances?.length === 0 && <span>Nenhum aceite registrado para esta versão.</span>}
          {audit.acceptances?.map((acceptance) => <article key={acceptance._id}><strong>{acceptance.user?.apelidoEstrada || acceptance.user?.nome || "Integrante"}</strong><span>{acceptance.user?.patente || ""}</span><small>{formatDateTime(acceptance.acceptedAt)} • hash {String(acceptance.contentHash || "").slice(0, 12)}…</small></article>)}
        </div>
      )}
    </section>
  );
}

function slugify(value) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function toLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

function typeLabel(type) {
  return ({ regulamento: "Regulamento", estatuto: "Estatuto", termo: "Termo", politica: "Política", codigo_conduta: "Código de conduta", outro: "Documento" })[type] || "Documento";
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
