import { useState } from "react";
import { Camera, MapPinned, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../../services/api.js";
import { AdminInput } from "./DashboardUI.jsx";

const emptyChapter = {
  nome: "", cidade: "", estado: "SP", regiao: "", responsavel: "", contato: "",
  descricao: "", destaque: false, ordem: 0, ativo: true
};

const emptyMedia = {
  titulo: "", legenda: "", imageUrl: "", categoria: "estrada", local: "", data: "",
  destaque: false, ordem: 0, ativo: true
};

export function TerritoryMediaManager({ content, onRefresh }) {
  const [chapterForm, setChapterForm] = useState(emptyChapter);
  const [mediaForm, setMediaForm] = useState(emptyMedia);
  const [editingChapter, setEditingChapter] = useState("");
  const [editingMedia, setEditingMedia] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const chapters = content?.chapters || [];
  const media = content?.media || [];

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

  function submitChapter(event) {
    event.preventDefault();
    const endpoint = editingChapter ? `/api/admin/club/chapters/${editingChapter}` : "/api/admin/club/chapters";
    const method = editingChapter ? "PATCH" : "POST";
    const payload = { ...chapterForm, estado: chapterForm.estado.toUpperCase(), ordem: Number(chapterForm.ordem) };
    run(async () => {
      await api(endpoint, { method, body: JSON.stringify(payload) });
      setChapterForm(emptyChapter);
      setEditingChapter("");
    }, editingChapter ? "Núcleo atualizado." : "Núcleo adicionado ao mapa do clube.");
  }

  function submitMedia(event) {
    event.preventDefault();
    const endpoint = editingMedia ? `/api/admin/club/media/${editingMedia}` : "/api/admin/club/media";
    const method = editingMedia ? "PATCH" : "POST";
    const payload = {
      ...mediaForm,
      ordem: Number(mediaForm.ordem),
      ...(mediaForm.data ? { data: new Date(mediaForm.data).toISOString() } : {})
    };
    run(async () => {
      await api(endpoint, { method, body: JSON.stringify(payload) });
      setMediaForm(emptyMedia);
      setEditingMedia("");
    }, editingMedia ? "Registro da galeria atualizado." : "Foto adicionada à memória do clube.");
  }

  function editChapter(item) {
    setEditingChapter(item._id);
    setChapterForm({
      nome: item.nome || "", cidade: item.cidade || "", estado: item.estado || "SP",
      regiao: item.regiao || "", responsavel: item.responsavel || "", contato: item.contato || "",
      descricao: item.descricao || "", destaque: Boolean(item.destaque), ordem: item.ordem || 0,
      ativo: item.ativo !== false
    });
  }

  function editMedia(item) {
    setEditingMedia(item._id);
    setMediaForm({
      titulo: item.titulo || "", legenda: item.legenda || "", imageUrl: item.imageUrl || "",
      categoria: item.categoria || "estrada", local: item.local || "",
      data: item.data ? new Date(item.data).toISOString().slice(0, 16) : "",
      destaque: Boolean(item.destaque), ordem: item.ordem || 0, ativo: item.ativo !== false
    });
  }

  async function remove(kind, id) {
    if (!window.confirm(kind === "chapter" ? "Remover este núcleo?" : "Remover esta foto da galeria?")) return;
    const path = kind === "chapter" ? "chapters" : "media";
    await run(() => api(`/api/admin/club/${path}/${id}`, { method: "DELETE" }), kind === "chapter" ? "Núcleo removido." : "Foto removida.");
  }

  return (
    <section className="mc-territory-admin">
      <div className="mc-content-manager-heading">
        <div><p>EXPANSÃO & MEMÓRIA</p><h3>Território do motoclube</h3></div>
        <span>{chapters.length} núcleos • {media.length} registros</span>
      </div>

      {message && <div className="mc-content-message">{message}</div>}

      <details className="steel-card p-5" open>
        <summary className="mc-content-summary"><MapPinned /> NÚCLEOS / CAPÍTULOS</summary>
        <form onSubmit={submitChapter} className="mt-5 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Nome do núcleo" value={chapterForm.nome} onChange={(value) => setChapterForm((c) => ({ ...c, nome: value }))} placeholder="Ex.: Sede São Paulo" />
            <AdminInput label="Região" value={chapterForm.regiao} onChange={(value) => setChapterForm((c) => ({ ...c, regiao: value }))} placeholder="Ex.: Capital" optional />
          </div>
          <div className="grid grid-cols-[1fr_90px] gap-3">
            <AdminInput label="Cidade" value={chapterForm.cidade} onChange={(value) => setChapterForm((c) => ({ ...c, cidade: value }))} />
            <AdminInput label="UF" value={chapterForm.estado} onChange={(value) => setChapterForm((c) => ({ ...c, estado: value.slice(0, 2).toUpperCase() }))} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Responsável" value={chapterForm.responsavel} onChange={(value) => setChapterForm((c) => ({ ...c, responsavel: value }))} optional />
            <AdminInput label="Contato" value={chapterForm.contato} onChange={(value) => setChapterForm((c) => ({ ...c, contato: value }))} optional />
          </div>
          <label className="mc-admin-field"><span>Descrição</span><textarea value={chapterForm.descricao} onChange={(event) => setChapterForm((c) => ({ ...c, descricao: event.target.value }))} /></label>
          <div className="grid grid-cols-[100px_1fr] gap-3">
            <AdminInput label="Ordem" type="number" value={chapterForm.ordem} onChange={(value) => setChapterForm((c) => ({ ...c, ordem: value }))} />
            <label className="mc-content-toggle"><input type="checkbox" checked={chapterForm.destaque} onChange={(event) => setChapterForm((c) => ({ ...c, destaque: event.target.checked }))} /><span>Núcleo em destaque</span></label>
          </div>
          <button disabled={saving} className="mc-content-submit"><Plus /> {editingChapter ? "Salvar núcleo" : "Adicionar núcleo"}</button>
          {editingChapter && <button type="button" className="mc-content-cancel" onClick={() => { setEditingChapter(""); setChapterForm(emptyChapter); }}>Cancelar edição</button>}
        </form>

        <div className="mc-admin-records">
          {chapters.map((item) => <article key={item._id} className="mc-admin-record">
            <div><p>{item.estado} • {item.regiao || "NÚCLEO"}</p><h4>{item.nome}</h4><span>{item.cidade}{item.responsavel ? ` • Resp. ${item.responsavel}` : ""}</span></div>
            <div><button onClick={() => editChapter(item)}><Pencil /></button><button onClick={() => remove("chapter", item._id)}><Trash2 /></button></div>
          </article>)}
        </div>
      </details>

      <details className="steel-card p-5">
        <summary className="mc-content-summary"><Camera /> GALERIA / MEMÓRIA</summary>
        <form onSubmit={submitMedia} className="mt-5 grid gap-3">
          <AdminInput label="Título" value={mediaForm.titulo} onChange={(value) => setMediaForm((c) => ({ ...c, titulo: value }))} />
          <AdminInput label="URL da imagem" value={mediaForm.imageUrl} onChange={(value) => setMediaForm((c) => ({ ...c, imageUrl: value }))} placeholder="https://..." />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="mc-admin-field"><span>Categoria</span><select value={mediaForm.categoria} onChange={(event) => setMediaForm((c) => ({ ...c, categoria: event.target.value }))}><option value="estrada">Estrada</option><option value="encontro">Encontro</option><option value="acao">Ação</option><option value="irmandade">Irmandade</option><option value="oficina">Oficina</option></select></label>
            <AdminInput label="Local" value={mediaForm.local} onChange={(value) => setMediaForm((c) => ({ ...c, local: value }))} optional />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <AdminInput label="Data" type="datetime-local" value={mediaForm.data} onChange={(value) => setMediaForm((c) => ({ ...c, data: value }))} optional />
            <AdminInput label="Ordem" type="number" value={mediaForm.ordem} onChange={(value) => setMediaForm((c) => ({ ...c, ordem: value }))} />
          </div>
          <label className="mc-admin-field"><span>Legenda</span><textarea value={mediaForm.legenda} onChange={(event) => setMediaForm((c) => ({ ...c, legenda: event.target.value }))} /></label>
          <label className="mc-content-toggle"><input type="checkbox" checked={mediaForm.destaque} onChange={(event) => setMediaForm((c) => ({ ...c, destaque: event.target.checked }))} /><span>Foto em destaque</span></label>
          <button disabled={saving} className="mc-content-submit"><Plus /> {editingMedia ? "Salvar mídia" : "Adicionar à galeria"}</button>
          {editingMedia && <button type="button" className="mc-content-cancel" onClick={() => { setEditingMedia(""); setMediaForm(emptyMedia); }}>Cancelar edição</button>}
        </form>

        <div className="mc-media-admin-grid">
          {media.map((item) => <article key={item._id} className="mc-media-admin-card">
            <img src={item.imageUrl} alt="" loading="lazy" />
            <div><p>{item.categoria}</p><h4>{item.titulo}</h4><span>{item.local || "Sem local informado"}</span></div>
            <aside><button onClick={() => editMedia(item)}><Pencil /></button><button onClick={() => remove("media", item._id)}><Trash2 /></button></aside>
          </article>)}
        </div>
      </details>
    </section>
  );
}
