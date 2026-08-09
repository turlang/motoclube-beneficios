import { useState } from "react";
import { BadgeCheck, Crown, Sparkles, TicketPercent } from "lucide-react";
import { api } from "../../services/api.js";
import { AdminInput, SectionHeader, StatAdmin } from "./DashboardUI.jsx";

export function DiretoriaTab({ overview, members, partners, loading, onUpdateMember, onRefresh }) {
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [partnerForm, setPartnerForm] = useState({
    nome: "",
    email: "",
    senha: "",
    categoria: "oficina",
    telefone: "",
    endereco: { cidade: "", bairro: "", logradouro: "" }
  });
  const [benefitForm, setBenefitForm] = useState({
    parceiro: "",
    titulo: "",
    descricao: "",
    descontoLabel: "",
    categoria: "oficina",
    regras: [],
    destaque: true
  });

  const filteredMembers = members.filter((member) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return [member.nome, member.apelidoEstrada, member.email]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(term));
  });

  async function submitPartner(event) {
    event.preventDefault();
    setMessage("");
    try {
      const data = await api("/api/admin/partners", {
        method: "POST",
        body: JSON.stringify(partnerForm)
      });
      setBenefitForm((current) => ({ ...current, parceiro: data.partner.id, categoria: data.partner.categoria }));
      setPartnerForm({ nome: "", email: "", senha: "", categoria: "oficina", telefone: "", endereco: { cidade: "", bairro: "", logradouro: "" } });
      setMessage("Parceiro cadastrado. Agora você pode publicar o benefício.");
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitBenefit(event) {
    event.preventDefault();
    setMessage("");
    try {
      await api("/api/admin/benefits", {
        method: "POST",
        body: JSON.stringify(benefitForm)
      });
      setBenefitForm({ parceiro: "", titulo: "", descricao: "", descontoLabel: "", categoria: "oficina", regras: [], destaque: true });
      setMessage("Benefício publicado com sucesso.");
      await onRefresh();
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <>
      <SectionHeader eyebrow="Painel da diretoria" title="Controle rápido da irmandade" />

      <section className="grid grid-cols-2 gap-3">
        <StatAdmin title="Membros ativos" value={overview?.activeMembers ?? "—"} icon={<BadgeCheck className="h-5 w-5" />} />
        <StatAdmin title="Validações hoje" value={overview?.validationsToday ?? "—"} icon={<TicketPercent className="h-5 w-5" />} />
        <StatAdmin title="Parceiros" value={overview?.partners ?? "—"} icon={<Crown className="h-5 w-5" />} />
        <StatAdmin title="Benefícios" value={overview?.benefits ?? "—"} icon={<Sparkles className="h-5 w-5" />} />
      </section>

      {message && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-200">{message}</div>
      )}

      <details className="steel-card rounded-[2rem] p-5" open>
        <summary className="cursor-pointer list-none text-sm font-black uppercase tracking-[0.22em] text-amber-300">Cadastrar parceiro comercial</summary>
        <form onSubmit={submitPartner} className="mt-5 grid gap-3">
          <AdminInput label="Nome do parceiro" value={partnerForm.nome} onChange={(value) => setPartnerForm((current) => ({ ...current, nome: value }))} />
          <AdminInput label="E-mail de acesso" type="email" value={partnerForm.email} onChange={(value) => setPartnerForm((current) => ({ ...current, email: value }))} />
          <AdminInput label="Senha inicial" type="password" value={partnerForm.senha} onChange={(value) => setPartnerForm((current) => ({ ...current, senha: value }))} />
          <div className="grid grid-cols-2 gap-3">
            <label>
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">Categoria</span>
              <select value={partnerForm.categoria} onChange={(event) => setPartnerForm((current) => ({ ...current, categoria: event.target.value }))} className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none">
                <option value="oficina">Oficina</option><option value="posto">Posto</option><option value="lavagem">Lavagem</option><option value="pecas">Peças</option><option value="alimentacao">Alimentação</option><option value="saude">Saúde</option><option value="outros">Outros</option>
              </select>
            </label>
            <AdminInput label="Telefone" value={partnerForm.telefone} onChange={(value) => setPartnerForm((current) => ({ ...current, telefone: value }))} optional />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminInput label="Cidade" value={partnerForm.endereco.cidade} onChange={(value) => setPartnerForm((current) => ({ ...current, endereco: { ...current.endereco, cidade: value } }))} optional />
            <AdminInput label="Bairro" value={partnerForm.endereco.bairro} onChange={(value) => setPartnerForm((current) => ({ ...current, endereco: { ...current.endereco, bairro: value } }))} optional />
          </div>
          <button className="h-12 rounded-2xl bg-amber-400 font-black uppercase tracking-[0.16em] text-black">Cadastrar parceiro</button>
        </form>
      </details>

      <details className="steel-card rounded-[2rem] p-5">
        <summary className="cursor-pointer list-none text-sm font-black uppercase tracking-[0.22em] text-amber-300">Publicar novo benefício</summary>
        <form onSubmit={submitBenefit} className="mt-5 grid gap-3">
          <label>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">Parceiro</span>
            <select value={benefitForm.parceiro} onChange={(event) => {
              const selected = partners.find((partner) => partner._id === event.target.value);
              setBenefitForm((current) => ({ ...current, parceiro: event.target.value, categoria: selected?.categoria || current.categoria }));
            }} className="h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-sm text-zinc-300 outline-none" required>
              <option value="">Selecione</option>
              {partners.filter((partner) => partner.ativo).map((partner) => <option key={partner._id} value={partner._id}>{partner.nome}</option>)}
            </select>
          </label>
          <AdminInput label="Título do benefício" value={benefitForm.titulo} onChange={(value) => setBenefitForm((current) => ({ ...current, titulo: value }))} />
          <AdminInput label="Desconto" value={benefitForm.descontoLabel} onChange={(value) => setBenefitForm((current) => ({ ...current, descontoLabel: value }))} placeholder="Ex.: 15% OFF" />
          <label>
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.24em] text-zinc-600">Descrição</span>
            <textarea value={benefitForm.descricao} onChange={(event) => setBenefitForm((current) => ({ ...current, descricao: event.target.value }))} className="min-h-24 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300 outline-none" required />
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-400">
            <input type="checkbox" checked={benefitForm.destaque} onChange={(event) => setBenefitForm((current) => ({ ...current, destaque: event.target.checked }))} />
            Mostrar como benefício em destaque
          </label>
          <button className="h-12 rounded-2xl bg-amber-400 font-black uppercase tracking-[0.16em] text-black">Publicar benefício</button>
        </form>
      </details>

      <section className="steel-card rounded-[2rem] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Membros</p>
            <h3 className="mt-1 text-lg font-black uppercase text-white">Patentes e assinatura</h3>
          </div>
          {loading && <span className="text-xs text-zinc-600">Atualizando...</span>}
        </div>

        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar nome, apelido ou e-mail" className="mt-4 h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 text-sm text-zinc-300 outline-none focus:border-amber-400/30" />

        <div className="mt-4 grid gap-3">
          {filteredMembers.slice(0, 30).map((member) => (
            <div key={member.id} className="rounded-2xl border border-white/5 bg-black/25 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black uppercase text-white">{member.apelidoEstrada}</p>
                  <p className="mt-1 text-xs text-zinc-600">{member.nome}</p>
                </div>
                <span className={member.statusAssinatura === "ativo" ? "text-xs font-black uppercase text-emerald-400" : "text-xs font-black uppercase text-red-400"}>{member.statusAssinatura}</span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <select value={member.patente} onChange={(event) => onUpdateMember(member.id, "patente", event.target.value)} className="h-11 rounded-xl border border-zinc-800 bg-zinc-950 px-3 text-xs font-bold text-zinc-300 outline-none">
                  <option>Próspero</option><option>Meio-Escudo</option><option>Escudado</option><option>Diretoria</option>
                </select>
                <button type="button" onClick={() => onUpdateMember(member.id, "statusAssinatura", member.statusAssinatura === "ativo" ? "inativo" : "ativo")} className="h-11 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3 text-xs font-black uppercase tracking-[0.12em] text-amber-300">
                  {member.statusAssinatura === "ativo" ? "Suspender" : "Ativar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
