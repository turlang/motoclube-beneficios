import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bike,
  CalendarClock,
  CheckCircle2,
  Gauge,
  Plus,
  RefreshCw,
  Save,
  Wrench
} from "lucide-react";
import { api } from "../../services/api.js";

const SERVICE_TYPES = [
  ["oleo", "Óleo"],
  ["pneus", "Pneus"],
  ["freios", "Freios"],
  ["corrente", "Corrente / transmissão"],
  ["revisao", "Revisão"],
  ["eletrica", "Elétrica"],
  ["motor", "Motor"],
  ["outro", "Outro"]
];

export function MotorcycleHealthPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [profileForm, setProfileForm] = useState({ apelidoMoto: "", ano: "", cor: "", odometroKm: "", observacoes: "" });
  const [reminderForms, setReminderForms] = useState({});
  const [serviceForm, setServiceForm] = useState({
    category: "revisao",
    date: new Date().toISOString().slice(0, 10),
    odometerKm: "",
    providerName: "",
    description: "",
    cost: "",
    nextDate: "",
    nextKm: ""
  });

  const profile = data?.profile;
  const services = data?.services || [];

  async function load() {
    setLoading(true);
    setMessage("");
    try {
      const response = await api("/api/motorcycle/me");
      setData(response);
      syncForms(response.profile);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  function syncForms(nextProfile) {
    if (!nextProfile) return;
    setProfileForm({
      apelidoMoto: nextProfile.motorcycle?.apelidoMoto || "",
      ano: nextProfile.motorcycle?.ano || "",
      cor: nextProfile.motorcycle?.cor || "",
      odometroKm: nextProfile.odometroKm ?? "",
      observacoes: nextProfile.observacoes || ""
    });
    setReminderForms(Object.fromEntries((nextProfile.reminders || []).map((item) => [item.key, {
      label: item.label || "",
      nextDate: toDateInput(item.nextDate),
      nextKm: item.nextKm ?? "",
      notes: item.notes || "",
      active: Boolean(item.active)
    }])));
  }

  useEffect(() => { load(); }, []);

  const statusLabel = useMemo(() => {
    if (!profile) return "—";
    if (profile.summary.overdue > 0) return `${profile.summary.overdue} vencido(s)`;
    if (profile.summary.attention > 0) return `${profile.summary.attention} em atenção`;
    if (profile.summary.active === 0) return "Configure seus lembretes";
    return "Em dia";
  }, [profile]);

  async function saveProfile(event) {
    event.preventDefault();
    setLoading(true); setMessage("");
    try {
      const response = await api("/api/motorcycle/me", {
        method: "PATCH",
        body: JSON.stringify({
          apelidoMoto: profileForm.apelidoMoto,
          ano: profileForm.ano ? Number(profileForm.ano) : null,
          cor: profileForm.cor,
          odometroKm: Number(profileForm.odometroKm || 0),
          observacoes: profileForm.observacoes
        })
      });
      setData((current) => ({ ...current, profile: response.profile }));
      syncForms(response.profile);
      setMessage("Ficha da moto atualizada.");
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }

  async function saveReminder(key) {
    const form = reminderForms[key];
    if (!form) return;
    setLoading(true); setMessage("");
    try {
      const response = await api(`/api/motorcycle/me/reminders/${key}`, {
        method: "PATCH",
        body: JSON.stringify({
          label: form.label,
          nextDate: form.nextDate ? new Date(`${form.nextDate}T12:00:00`).toISOString() : null,
          nextKm: form.nextKm === "" ? null : Number(form.nextKm),
          notes: form.notes,
          active: form.active
        })
      });
      setData((current) => ({ ...current, profile: response.profile }));
      syncForms(response.profile);
      setMessage("Lembrete atualizado.");
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }

  async function addService(event) {
    event.preventDefault();
    setLoading(true); setMessage("");
    try {
      await api("/api/motorcycle/me/services", {
        method: "POST",
        body: JSON.stringify({
          category: serviceForm.category,
          date: new Date(`${serviceForm.date}T12:00:00`).toISOString(),
          odometerKm: serviceForm.odometerKm === "" ? null : Number(serviceForm.odometerKm),
          providerName: serviceForm.providerName,
          description: serviceForm.description,
          cost: serviceForm.cost === "" ? null : Number(serviceForm.cost),
          nextDate: serviceForm.nextDate ? new Date(`${serviceForm.nextDate}T12:00:00`).toISOString() : null,
          nextKm: serviceForm.nextKm === "" ? null : Number(serviceForm.nextKm)
        })
      });
      setServiceForm({
        category: "revisao",
        date: new Date().toISOString().slice(0, 10),
        odometerKm: "",
        providerName: "",
        description: "",
        cost: "",
        nextDate: "",
        nextKm: ""
      });
      setMessage("Serviço registrado no histórico.");
      await load();
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }

  return (
    <section className="mc-garage-panel">
      <div className="mc-garage-heading">
        <div>
          <p>GARAGEM DA IRMANDADE</p>
          <h3>Segurança & saúde da moto</h3>
          <span>Organize manutenção e vencimentos usando as referências do manual da sua moto e da oficina de confiança.</span>
        </div>
        <button type="button" onClick={load} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Atualizar</button>
      </div>

      {message && <div className="mc-garage-message">{message}</div>}
      {!profile && loading && <div className="mc-garage-state">Abrindo sua garagem...</div>}

      {profile && <>
        <div className="mc-garage-summary">
          <div><Bike /><span>MOTO</span><strong>{profile.motorcycle.modelo}</strong><small>{profile.motorcycle.placa}</small></div>
          <div><Gauge /><span>HODÔMETRO</span><strong>{formatKm(profile.odometroKm)}</strong><small>{profile.odometroAtualizadoEm ? `Atualizado ${formatDate(profile.odometroAtualizadoEm)}` : "Ainda não atualizado"}</small></div>
          <div className={profile.summary.overdue ? "is-danger" : profile.summary.attention ? "is-warning" : "is-good"}>{profile.summary.overdue ? <AlertTriangle /> : <CheckCircle2 />}<span>ESTADO DOS LEMBRETES</span><strong>{statusLabel}</strong><small>{profile.summary.active} lembrete(s) ativo(s)</small></div>
        </div>

        <form onSubmit={saveProfile} className="mc-garage-form">
          <div className="mc-garage-section-title"><Bike /><div><p>FICHA DA MOTO</p><h4>Identidade e quilometragem</h4></div></div>
          <div className="grid gap-3 md:grid-cols-4">
            <GarageField label="Apelido da moto" value={profileForm.apelidoMoto} onChange={(value) => setProfileForm((current) => ({ ...current, apelidoMoto: value }))} placeholder="Ex.: Fera" />
            <GarageField label="Ano" type="number" value={profileForm.ano} onChange={(value) => setProfileForm((current) => ({ ...current, ano: value }))} placeholder="2024" />
            <GarageField label="Cor" value={profileForm.cor} onChange={(value) => setProfileForm((current) => ({ ...current, cor: value }))} placeholder="Preta" />
            <GarageField label="Hodômetro atual (km)" type="number" value={profileForm.odometroKm} onChange={(value) => setProfileForm((current) => ({ ...current, odometroKm: value }))} placeholder="0" />
          </div>
          <label className="mc-garage-field"><span>Observações da moto</span><textarea rows="3" value={profileForm.observacoes} onChange={(event) => setProfileForm((current) => ({ ...current, observacoes: event.target.value }))} placeholder="Informações que você quer manter registradas na sede digital." /></label>
          <button className="mc-garage-primary" disabled={loading}><Save /> Salvar ficha</button>
        </form>

        <div className="mc-garage-reminders">
          <div className="mc-garage-section-title"><CalendarClock /><div><p>LEMBRETES</p><h4>Datas e quilometragens configuradas por você</h4></div></div>
          <p className="mc-garage-caution">O sistema apenas acompanha os limites informados. Não use os alertas como diagnóstico ou substituto de inspeção, manual do fabricante ou avaliação de um profissional.</p>
          <div className="mc-garage-reminder-grid">
            {profile.reminders.map((item) => {
              const form = reminderForms[item.key] || {};
              return <article key={item.key} className={`mc-garage-reminder is-${item.status}`}>
                <div className="mc-garage-reminder-head"><div><Wrench /><span>{item.label}</span></div><b>{statusText(item.status)}</b></div>
                <label className="mc-garage-toggle"><input type="checkbox" checked={Boolean(form.active)} onChange={(event) => setReminderForms((current) => ({ ...current, [item.key]: { ...current[item.key], active: event.target.checked } }))} /><span>Acompanhar este item</span></label>
                <div className="grid grid-cols-2 gap-2">
                  <GarageField label="Próxima data" type="date" value={form.nextDate || ""} onChange={(value) => setReminderForms((current) => ({ ...current, [item.key]: { ...current[item.key], nextDate: value } }))} />
                  <GarageField label="Próximo km" type="number" value={form.nextKm ?? ""} onChange={(value) => setReminderForms((current) => ({ ...current, [item.key]: { ...current[item.key], nextKm: value } }))} />
                </div>
                <GarageField label="Observação" value={form.notes || ""} onChange={(value) => setReminderForms((current) => ({ ...current, [item.key]: { ...current[item.key], notes: value } }))} placeholder="Ex.: seguir orientação da oficina" />
                <small>{item.reason}</small>
                <button type="button" onClick={() => saveReminder(item.key)} disabled={loading}><Save /> Salvar lembrete</button>
              </article>;
            })}
          </div>
        </div>

        <form onSubmit={addService} className="mc-garage-service-form">
          <div className="mc-garage-section-title"><Plus /><div><p>HISTÓRICO DE OFICINA</p><h4>Registrar serviço realizado</h4></div></div>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="mc-garage-field"><span>Tipo</span><select value={serviceForm.category} onChange={(event) => setServiceForm((current) => ({ ...current, category: event.target.value }))}>{SERVICE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <GarageField label="Data" type="date" value={serviceForm.date} onChange={(value) => setServiceForm((current) => ({ ...current, date: value }))} />
            <GarageField label="Hodômetro no serviço" type="number" value={serviceForm.odometerKm} onChange={(value) => setServiceForm((current) => ({ ...current, odometerKm: value }))} />
            <GarageField label="Oficina / profissional" value={serviceForm.providerName} onChange={(value) => setServiceForm((current) => ({ ...current, providerName: value }))} placeholder="Nome do local" />
            <GarageField label="Custo (opcional)" type="number" value={serviceForm.cost} onChange={(value) => setServiceForm((current) => ({ ...current, cost: value }))} placeholder="0,00" />
            <GarageField label="Próxima data (opcional)" type="date" value={serviceForm.nextDate} onChange={(value) => setServiceForm((current) => ({ ...current, nextDate: value }))} />
            <GarageField label="Próximo km (opcional)" type="number" value={serviceForm.nextKm} onChange={(value) => setServiceForm((current) => ({ ...current, nextKm: value }))} />
          </div>
          <label className="mc-garage-field"><span>Serviço realizado</span><textarea rows="3" value={serviceForm.description} onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))} placeholder="Descreva o que foi feito, sem incluir dados sensíveis." required /></label>
          <button className="mc-garage-primary" disabled={loading}><Plus /> Registrar serviço</button>
        </form>

        <div className="mc-garage-history">
          <div className="mc-garage-section-title"><Wrench /><div><p>MEMÓRIA DA MOTO</p><h4>Últimos serviços registrados</h4></div></div>
          {services.length === 0 && <div className="mc-garage-state">Nenhum serviço registrado ainda.</div>}
          {services.map((service) => <article key={service.id}>
            <div><b>{serviceTypeLabel(service.category)}</b><span>{formatDate(service.date)}{service.odometerKm !== null ? ` • ${formatKm(service.odometerKm)}` : ""}</span></div>
            <p>{service.description}</p>
            <small>{service.providerName || service.partner?.nome || "Prestador não informado"}{service.cost !== null ? ` • ${formatMoney(service.cost)}` : ""}</small>
          </article>)}
        </div>
      </>}
    </section>
  );
}

function GarageField({ label, type = "text", value, onChange, placeholder = "" }) {
  return <label className="mc-garage-field"><span>{label}</span><input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} min={type === "number" ? "0" : undefined} /></label>;
}

function toDateInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
}
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date); }
function formatKm(value) { return `${new Intl.NumberFormat("pt-BR").format(Number(value || 0))} km`; }
function formatMoney(value) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0)); }
function serviceTypeLabel(value) { return SERVICE_TYPES.find(([key]) => key === value)?.[1] || "Serviço"; }
function statusText(value) { return ({ vencido: "VENCIDO", atencao: "ATENÇÃO", em_dia: "EM DIA", configurar: "CONFIGURAR", inativo: "INATIVO" })[value] || value; }
