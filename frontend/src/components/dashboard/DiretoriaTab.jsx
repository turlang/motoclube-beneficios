import { useState } from "react";
import { BadgeCheck, Crown, Sparkles, TicketPercent, UserPlus } from "lucide-react";
import { api } from "../../services/api.js";
import { AdminInput, SectionHeader, StatAdmin } from "./DashboardUI.jsx";
import { ClubContentManager } from "./ClubContentManager.jsx";
import { TerritoryMediaManager } from "./TerritoryMediaManager.jsx";
import { CommunicationManager } from "./CommunicationManager.jsx";
import { JourneyManager } from "./JourneyManager.jsx";
import { DocumentManager } from "./DocumentManager.jsx";

export function DiretoriaTab({ overview, members, partners, clubContent, loading, onUpdateMember, onRefresh }) {
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [partnerForm, setPartnerForm] = useState({
    nome: "", email: "", senha: "", categoria: "oficina", telefone: "",
    endereco: { cidade: "", bairro: "", logradouro: "" }
  });
  const [benefitForm, setBenefitForm] = useState({
    parceiro: "", titulo: "", descricao: "", descontoLabel: "", categoria: "oficina",
    regras: [], destaque: true
  });

  const chapters = clubContent?.chapters || [];
  const filteredMembers = members.filter((member) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [member.nome, member.apelidoEstrada, member.email, member.nucleo?.nome].filter(Boolean).some((value) => value.toLowerCase().includes(term));
  });

  async function submitPartner(event) {
    event.preventDefault();
    setMessage("");
    try {
      const data = await api("/api/admin/partners", { method: "POST", body: JSON.stringify(partnerForm) });
      setBenefitForm((current) => ({ ...current, parceiro: data.partner.id, categoria: data.partner.categoria }));
      setPartnerForm({ nome: "", email: "", senha: "", categoria: "oficina", telefone: "", endereco: { cidade: "", bairro: "", logradouro: "" } });
      setMessage("Parceiro cadastrado. Agora você pode publicar o benefício.");
      await onRefresh();
    } catch (error) { setMessage(error.message); }
  }

  async function submitBenefit(event) {
    event.preventDefault();
    setMessage("");
    try {
      await api("/api/admin/benefits", { method: "POST", body: JSON.stringify(benefitForm) });
      setBenefitForm({ parceiro: "", titulo: "", descricao: "", descontoLabel: "", categoria: "oficina", regras: [], destaque: true });
      setMessage("Benefício publicado com sucesso.");
      await onRefresh();
    } catch (error) { setMessage(error.message); }
  }

  return (
    <>
      <SectionHeader eyebrow="Painel da diretoria" title="Comando da sede digital" />

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatAdmin title="Membros ativos" value={overview?.activeMembers ?? "—"} icon={<BadgeCheck className="h-5 w-5" />} />
        <StatAdmin title="Candidatos" value={overview?.candidates ?? "—"} icon={<UserPlus className="h-5 w-5" />} />
        <StatAdmin title="Validações hoje" value={overview?.validationsToday ?? "—"} icon={<TicketPercent className="h-5 w-5" />} />
        <StatAdmin title="Parceiros" value={overview?.partners ?? "—"} icon={<Crown className="h-5 w-5" />} />
        <StatAdmin title="Benefícios" value={overview?.benefits ?? "—"} icon={<Sparkles className="h-5 w-5" />} />
        <StatAdmin title="Total na base" value={overview?.totalMembers ?? "—"} icon={<Crown className="h-5 w-5" />} />
      </section>

      <JourneyManager members={members} onRefresh={onRefresh} />
      <DocumentManager />
      <CommunicationManager chapters={chapters} />
      <ClubContentManager content={clubContent} onRefresh={onRefresh} />
      <TerritoryMediaManager content={clubContent} onRefresh={onRefresh} />

      {message && <div className="mc-content-message">{message}</div>}

      <details className="steel-card rounded-[2rem] p-5">
        <summary className="cursor-pointer list-none text-sm font-black uppercase tracking-[0.22em] text-amber-300">Cadastrar parceiro comercial</summary>
        <form onSubmit={submitPartner} className="mt-5 grid gap-3">
          <AdminInput label="Nome do parceiro" value={partnerForm.nome} onChange={(value) => setPartnerForm((current) => ({ ...current, nome: value }))} />
          <AdminInput label="E-mail de acesso" type="email" value={partnerForm.email} onChange={(value) => setPartnerForm((current) => ({ ...current, email: value }))} />
          <AdminInput label="Senha inicial" type="password" value={partnerForm.senha} onChange={(value) => setPartnerForm((current) => ({ ...current, senha: value }))} />
          <div className="grid grid-cols-2 gap-3">
            <label className="mc-admin-field"><span>Categoria</span><select value={partnerForm.categoria} onChange={(event) => setPartnerForm((current) => ({ ...current, categoria: event.target.value }))}><option value="oficina">Oficina</option><option value="posto">Posto</option><option value="lavagem">Lavagem</option><option value="pecas">Peças</option><option value="alimentacao">Alimentação</option><option value="saude">Saúde</option><option value="outros">Outros</option></select></label>
            <AdminInput label="Telefone" value={partnerForm.telefone} onChange={(value) => setPartnerForm((current) => ({ ...current, telefone: value }))} optional />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Cidade" value={partnerForm.endereco.cidade} onChange={(value) => setPartnerForm((current) => ({ ...current, endereco: { ...current.endereco, cidade: value } }))} optional />
            <AdminInput label="Bairro" value={partnerForm.endereco.bairro} onChange={(value) => setPartnerForm((current) => ({ ...current, endereco: { ...current.endereco, bairro: value } }))} optional />
          </div>
          <button className="mc-content-submit">Cadastrar parceiro</button>
        </form>
      </details>

      <details className="steel-card rounded-[2rem] p-5">
        <summary className="cursor-pointer list-none text-sm font-black uppercase tracking-[0.22em] text-amber-300">Publicar novo benefício</summary>
        <form onSubmit={submitBenefit} className="mt-5 grid gap-3">
          <label className="mc-admin-field"><span>Parceiro</span><select value={benefitForm.parceiro} onChange={(event) => {
            const selected = partners.find((partner) => partner._id === event.target.value);
            setBenefitForm((current) => ({ ...current, parceiro: event.target.value, categoria: selected?.categoria || current.categoria }));
          }} required><option value="">Selecione</option>{partners.filter((partner) => partner.ativo).map((partner) => <option key={partner._id} value={partner._id}>{partner.nome}</option>)}</select></label>
          <AdminInput label="Título do benefício" value={benefitForm.titulo} onChange={(value) => setBenefitForm((current) => ({ ...current, titulo: value }))} />
          <AdminInput label="Desconto" value={benefitForm.descontoLabel} onChange={(value) => setBenefitForm((current) => ({ ...current, descontoLabel: value }))} placeholder="Ex.: 15% OFF" />
          <label className="mc-admin-field"><span>Descrição</span><textarea value={benefitForm.descricao} onChange={(event) => setBenefitForm((current) => ({ ...current, descricao: event.target.value }))} required /></label>
          <label className="mc-content-toggle"><input type="checkbox" checked={benefitForm.destaque} onChange={(event) => setBenefitForm((current) => ({ ...current, destaque: event.target.checked }))} /><span>Mostrar como benefício em destaque</span></label>
          <button className="mc-content-submit">Publicar benefício</button>
        </form>
      </details>

      <section className="steel-card rounded-[2rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div><p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Membros</p><h3 className="mt-1 text-lg font-black uppercase text-white">Patentes, núcleo e assinatura</h3></div>
          {loading && <span className="text-xs text-zinc-600">Atualizando...</span>}
        </div>

        <p className="mt-2 text-xs leading-5 text-zinc-600">Use a Jornada do Integrante para promoções normais. O seletor de patente abaixo permanece como ajuste administrativo e também gera histórico.</p>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome, apelido, e-mail ou núcleo" className="mt-4 h-12 w-full border border-zinc-800 bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-400/30" />

        <div className="mt-4 grid gap-3">
          {filteredMembers.slice(0, 30).map((member) => (
            <div key={member.id} className="border border-white/5 bg-black/25 p-4">
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black uppercase text-white">{member.apelidoEstrada}</p><p className="mt-1 text-xs text-zinc-600">{member.nome}{member.nucleo?.nome ? ` • ${member.nucleo.nome}` : ""}</p></div><span className={member.statusAssinatura === "ativo" ? "text-xs font-black uppercase text-emerald-400" : "text-xs font-black uppercase text-red-400"}>{member.statusAssinatura}</span></div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <select value={member.patente} onChange={(event) => onUpdateMember(member.id, "patente", event.target.value)} className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-xs font-bold text-zinc-300 outline-none"><option>Candidato</option><option>Próspero</option><option>Meio-Escudo</option><option>Escudado</option><option>Diretoria</option></select>
                <select value={member.nucleo?.id || ""} onChange={(event) => onUpdateMember(member.id, "nucleo", event.target.value || null)} className="h-11 border border-zinc-800 bg-zinc-950 px-3 text-xs font-bold text-zinc-300 outline-none"><option value="">Sem núcleo</option>{chapters.filter((chapter) => chapter.ativo !== false).map((chapter) => <option key={chapter._id} value={chapter._id}>{chapter.nome} • {chapter.estado}</option>)}</select>
                <button type="button" onClick={() => onUpdateMember(member.id, "statusAssinatura", member.statusAssinatura === "ativo" ? "inativo" : "ativo")} className="h-11 border border-amber-400/20 bg-amber-400/10 px-3 text-xs font-black uppercase tracking-[0.12em] text-amber-300">{member.statusAssinatura === "ativo" ? "Suspender" : "Ativar"}</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
