import { useEffect, useMemo, useState } from "react";
import { CalendarDays, FileText, Pencil, Plus, Save, Trash2, UsersRound } from "lucide-react";
import { api } from "../../services/api.js";
import { AdminInput, SectionHeader } from "./DashboardUI.jsx";

const emptyOfficer = { nome: "", apelidoEstrada: "", cargo: "", patente: "Diretoria", photoUrl: "", bio: "", ordem: 0, ativo: true };
const emptyEvent = { titulo: "", descricao: "", data: "", cidade: "", local: "", tipo: "encontro", imageUrl: "", destaque: false, ativo: true };
const emptyPost = { titulo: "", categoria: "noticia", resumo: "", conteudo: "", imageUrl: "", publishedAt: "", destaque: false, ativo: true };

export function ClubContentManager({ content, onRefresh }) {
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(() => profileFrom(content?.profile));
  const [officerForm, setOfficerForm] = useState(emptyOfficer);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [postForm, setPostForm] = useState(emptyPost);
  const [editingOfficer, setEditingOfficer] = useState("");
  const [editingEvent, setEditingEvent] = useState("");
  const [editingPost, setEditingPost] = useState("");

  useEffect(() => {
    setProfile(profileFrom(content?.profile));
  }, [content?.profile]);

  const counts = useMemo(() => ({
    officers: content?.officers?.length || 0,
    events: content?.events?.length || 0,
    posts: content?.posts?.length || 0
  }), [content]);

  async function run(action, successMessage) {
    setSaving(true);
    setMessage("");
    try {
      await action();
      setMessage(successMessage);
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  function submitProfile(event) {
    event.preventDefault();
    run(() => api("/api/admin/club/profile", {
      method: "PATCH",
      body: JSON.stringify({ ...profile, foundedYear: Number(profile.foundedYear) })
    }), "História e identidade institucional atualizadas.");
  }

  function submitOfficer(event) {
    event.preventDefault();
    const endpoint = editingOfficer ? `/api/admin/club/officers/${editingOfficer}` : "/api/admin/club/officers";
    const method = editingOfficer ? "PATCH" : "POST";
    run(async () => {
      await api(endpoint, { method, body: JSON.stringify({ ...officerForm, ordem: Number(officerForm.ordem) }) });
      setOfficerForm(emptyOfficer);
      setEditingOfficer("");
    }, editingOfficer ? "Integrante do comando atualizado." : "Integrante do comando adicionado.");
  }

  function submitEvent(event) {
    event.preventDefault();
    const endpoint = editingEvent ? `/api/admin/club/events/${editingEvent}` : "/api/admin/club/events";
    const method = editingEvent ? "PATCH" : "POST";
    const payload = { ...eventForm, data: new Date(eventForm.data).toISOString() };
    run(async () => {
      await api(endpoint, { method, body: JSON.stringify(payload) });
      setEventForm(emptyEvent);
      setEditingEvent("");
    }, editingEvent ? "Evento atualizado." : "Evento publicado na agenda.");
  }

  function submitPost(event) {
    event.preventDefault();
    const endpoint = editingPost ? `/api/admin/club/posts/${editingPost}` : "/api/admin/club/posts";
    const method = editingPost ? "PATCH" : "POST";
    const payload = {
      ...postForm,
      ...(postForm.publishedAt ? { publishedAt: new Date(postForm.publishedAt).toISOString() } : {})
    };
    run(async () => {
      await api(endpoint, { method, body: JSON.stringify(payload) });
      setPostForm(emptyPost);
      setEditingPost("");
    }, editingPost ? "Publicação atualizada." : "Publicação adicionada ao Diário de Estrada.");
  }

  function editOfficer(item) {
    setEditingOfficer(item._id);
    setOfficerForm({
      nome: item.nome || "", apelidoEstrada: item.apelidoEstrada || "", cargo: item.cargo || "",
      patente: item.patente || "Diretoria", photoUrl: item.photoUrl || "", bio: item.bio || "",
      ordem: item.ordem ?? 0, ativo: item.ativo !== false
    });
  }

  function editEvent(item) {
    setEditingEvent(item._id);
    setEventForm({
      titulo: item.titulo || "", descricao: item.descricao || "", data: toLocalDateTime(item.data),
      cidade: item.cidade || "", local: item.local || "", tipo: item.tipo || "encontro",
      imageUrl: item.imageUrl || "", destaque: Boolean(item.destaque), ativo: item.ativo !== false
    });
  }

  function editPost(item) {
    setEditingPost(item._id);
    setPostForm({
      titulo: item.titulo || "", categoria: item.categoria || "noticia", resumo: item.resumo || "",
      conteudo: item.conteudo || "", imageUrl: item.imageUrl || "", publishedAt: toLocalDateTime(item.publishedAt),
      destaque: Boolean(item.destaque), ativo: item.ativo !== false
    });
  }

  function remove(kind, id) {
    if (!window.confirm("Remover este conteúdo do portal do motoclube?")) return;
    run(() => api(`/api/admin/club/${kind}/${id}`, { method: "DELETE" }), "Conteúdo removido.");
  }

  return (
    <section className="mc-content-admin">
      <div className="mc-content-admin-head">
        <SectionHeader eyebrow="Portal institucional" title="Conteúdo oficial do motoclube" />
        <div className="mc-content-counters">
          <span><UsersRound /> {counts.officers} comando</span>
          <span><CalendarDays /> {counts.events} eventos</span>
          <span><FileText /> {counts.posts} publicações</span>
        </div>
      </div>

      {message && <div className="mc-content-message">{message}</div>}

      <details className="mc-content-editor" open>
        <summary>História e identidade</summary>
        <form onSubmit={submitProfile} className="mc-content-form">
          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Nome do motoclube" value={profile.nome} onChange={(value) => setProfile((current) => ({ ...current, nome: value }))} />
            <AdminInput label="Sigla" value={profile.sigla} onChange={(value) => setProfile((current) => ({ ...current, sigla: value }))} />
            <AdminInput label="Ano de fundação" type="number" value={profile.foundedYear} onChange={(value) => setProfile((current) => ({ ...current, foundedYear: value }))} />
            <AdminInput label="Cidade" value={profile.cidade} onChange={(value) => setProfile((current) => ({ ...current, cidade: value }))} />
            <AdminInput label="Estado" value={profile.estado} onChange={(value) => setProfile((current) => ({ ...current, estado: value }))} />
            <AdminInput label="Imagem principal (URL)" value={profile.heroImageUrl} onChange={(value) => setProfile((current) => ({ ...current, heroImageUrl: value }))} optional />
          </div>
          <AdminInput label="Frase principal" value={profile.headline} onChange={(value) => setProfile((current) => ({ ...current, headline: value }))} />
          <TextArea label="História do clube" value={profile.historia} onChange={(value) => setProfile((current) => ({ ...current, historia: value }))} rows={7} />
          <TextArea label="Manifesto" value={profile.manifesto} onChange={(value) => setProfile((current) => ({ ...current, manifesto: value }))} rows={4} />
          <SubmitButton saving={saving} label="Salvar identidade institucional" />
        </form>
      </details>

      <details className="mc-content-editor">
        <summary>Comando e Diretoria</summary>
        <form onSubmit={submitOfficer} className="mc-content-form">
          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Nome" value={officerForm.nome} onChange={(value) => setOfficerForm((current) => ({ ...current, nome: value }))} />
            <AdminInput label="Apelido de estrada" value={officerForm.apelidoEstrada} onChange={(value) => setOfficerForm((current) => ({ ...current, apelidoEstrada: value }))} optional />
            <AdminInput label="Cargo" value={officerForm.cargo} onChange={(value) => setOfficerForm((current) => ({ ...current, cargo: value }))} />
            <AdminInput label="Foto (URL)" value={officerForm.photoUrl} onChange={(value) => setOfficerForm((current) => ({ ...current, photoUrl: value }))} optional />
            <SelectField label="Patente" value={officerForm.patente} onChange={(value) => setOfficerForm((current) => ({ ...current, patente: value }))} options={["Próspero", "Meio-Escudo", "Escudado", "Diretoria"]} />
            <AdminInput label="Ordem" type="number" value={officerForm.ordem} onChange={(value) => setOfficerForm((current) => ({ ...current, ordem: value }))} />
          </div>
          <TextArea label="Apresentação" value={officerForm.bio} onChange={(value) => setOfficerForm((current) => ({ ...current, bio: value }))} rows={3} optional />
          <Toggle label="Visível no site" checked={officerForm.ativo} onChange={(ativo) => setOfficerForm((current) => ({ ...current, ativo }))} />
          <div className="flex gap-2"><SubmitButton saving={saving} label={editingOfficer ? "Salvar integrante" : "Adicionar ao comando"} />{editingOfficer && <CancelButton onClick={() => { setEditingOfficer(""); setOfficerForm(emptyOfficer); }} />}</div>
        </form>
        <ContentList items={content?.officers || []} renderTitle={(item) => item.apelidoEstrada || item.nome} renderMeta={(item) => `${item.cargo} • ${item.patente}`} onEdit={editOfficer} onDelete={(id) => remove("officers", id)} />
      </details>

      <details className="mc-content-editor">
        <summary>Agenda de estrada</summary>
        <form onSubmit={submitEvent} className="mc-content-form">
          <AdminInput label="Título" value={eventForm.titulo} onChange={(value) => setEventForm((current) => ({ ...current, titulo: value }))} />
          <div className="grid gap-3 md:grid-cols-2">
            <AdminInput label="Data e hora" type="datetime-local" value={eventForm.data} onChange={(value) => setEventForm((current) => ({ ...current, data: value }))} />
            <SelectField label="Tipo" value={eventForm.tipo} onChange={(value) => setEventForm((current) => ({ ...current, tipo: value }))} options={["encontro", "rota", "acao", "reuniao"]} />
            <AdminInput label="Cidade" value={eventForm.cidade} onChange={(value) => setEventForm((current) => ({ ...current, cidade: value }))} optional />
            <AdminInput label="Local" value={eventForm.local} onChange={(value) => setEventForm((current) => ({ ...current, local: value }))} optional />
          </div>
          <AdminInput label="Imagem (URL)" value={eventForm.imageUrl} onChange={(value) => setEventForm((current) => ({ ...current, imageUrl: value }))} optional />
          <TextArea label="Descrição" value={eventForm.descricao} onChange={(value) => setEventForm((current) => ({ ...current, descricao: value }))} rows={4} />
          <div className="grid gap-2 md:grid-cols-2"><Toggle label="Evento em destaque" checked={eventForm.destaque} onChange={(destaque) => setEventForm((current) => ({ ...current, destaque }))} /><Toggle label="Visível no site" checked={eventForm.ativo} onChange={(ativo) => setEventForm((current) => ({ ...current, ativo }))} /></div>
          <div className="flex gap-2"><SubmitButton saving={saving} label={editingEvent ? "Salvar evento" : "Publicar evento"} />{editingEvent && <CancelButton onClick={() => { setEditingEvent(""); setEventForm(emptyEvent); }} />}</div>
        </form>
        <ContentList items={content?.events || []} renderTitle={(item) => item.titulo} renderMeta={(item) => `${formatDate(item.data)} • ${item.tipo}`} onEdit={editEvent} onDelete={(id) => remove("events", id)} />
      </details>

      <details className="mc-content-editor">
        <summary>Notícias e Diário de Estrada</summary>
        <form onSubmit={submitPost} className="mc-content-form">
          <AdminInput label="Título" value={postForm.titulo} onChange={(value) => setPostForm((current) => ({ ...current, titulo: value }))} />
          <div className="grid gap-3 md:grid-cols-2">
            <SelectField label="Categoria" value={postForm.categoria} onChange={(value) => setPostForm((current) => ({ ...current, categoria: value }))} options={["noticia", "rota", "manutencao", "comunidade"]} />
            <AdminInput label="Data de publicação" type="datetime-local" value={postForm.publishedAt} onChange={(value) => setPostForm((current) => ({ ...current, publishedAt: value }))} optional />
          </div>
          <AdminInput label="Imagem (URL)" value={postForm.imageUrl} onChange={(value) => setPostForm((current) => ({ ...current, imageUrl: value }))} optional />
          <TextArea label="Resumo" value={postForm.resumo} onChange={(value) => setPostForm((current) => ({ ...current, resumo: value }))} rows={3} />
          <TextArea label="Conteúdo" value={postForm.conteudo} onChange={(value) => setPostForm((current) => ({ ...current, conteudo: value }))} rows={6} optional />
          <div className="grid gap-2 md:grid-cols-2"><Toggle label="Publicação em destaque" checked={postForm.destaque} onChange={(destaque) => setPostForm((current) => ({ ...current, destaque }))} /><Toggle label="Visível no site" checked={postForm.ativo} onChange={(ativo) => setPostForm((current) => ({ ...current, ativo }))} /></div>
          <div className="flex gap-2"><SubmitButton saving={saving} label={editingPost ? "Salvar publicação" : "Publicar no diário"} />{editingPost && <CancelButton onClick={() => { setEditingPost(""); setPostForm(emptyPost); }} />}</div>
        </form>
        <ContentList items={content?.posts || []} renderTitle={(item) => item.titulo} renderMeta={(item) => `${item.categoria} • ${formatDate(item.publishedAt)}`} onEdit={editPost} onDelete={(id) => remove("posts", id)} />
      </details>
    </section>
  );
}

function profileFrom(value) {
  return {
    nome: value?.nome || "Irmãos do Asfalto",
    sigla: value?.sigla || "MC",
    foundedYear: value?.foundedYear || 2026,
    cidade: value?.cidade || "São Paulo",
    estado: value?.estado || "SP",
    headline: value?.headline || "A estrada nos une. O escudo nos representa.",
    historia: value?.historia || "Conte a história do motoclube aqui.",
    manifesto: value?.manifesto || "Honra, respeito, responsabilidade e irmandade.",
    heroImageUrl: value?.heroImageUrl || ""
  };
}

function TextArea({ label, value, onChange, rows = 4, optional = false }) {
  return <label className="mc-admin-field"><span>{label}</span><textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} required={!optional} /></label>;
}

function SelectField({ label, value, onChange, options }) {
  return <label className="mc-admin-field"><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>;
}

function Toggle({ label, checked, onChange }) {
  return <label className="mc-content-toggle"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}

function SubmitButton({ saving, label }) {
  return <button disabled={saving} className="mc-content-submit">{saving ? <Save className="animate-pulse" /> : <Plus />}{saving ? "Salvando..." : label}</button>;
}

function CancelButton({ onClick }) {
  return <button type="button" onClick={onClick} className="mc-content-cancel">Cancelar edição</button>;
}

function ContentList({ items, renderTitle, renderMeta, onEdit, onDelete }) {
  if (!items.length) return <p className="mc-content-empty">Nenhum conteúdo cadastrado nesta seção.</p>;
  return <div className="mc-content-list">{items.map((item) => <div key={item._id}><div><strong>{renderTitle(item)}</strong><small>{renderMeta(item)}{item.ativo === false ? " • oculto" : ""}</small></div><div><button type="button" onClick={() => onEdit(item)} aria-label="Editar"><Pencil /></button><button type="button" onClick={() => onDelete(item._id)} aria-label="Remover"><Trash2 /></button></div></div>)}</div>;
}

function toLocalDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
}

function formatDate(value) {
  if (!value) return "Sem data";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}
