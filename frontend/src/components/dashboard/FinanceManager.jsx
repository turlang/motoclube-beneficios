import { useEffect, useMemo, useState } from "react";
import { Banknote, CalendarPlus, CircleDollarSign, RefreshCw, Save, TrendingDown, TrendingUp, WalletCards } from "lucide-react";
import { api } from "../../services/api.js";

const currentMonth = () => new Date().toISOString().slice(0, 7);

export function FinanceManager({ members = [] }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState({ enabled: false, monthlyFee: "", dueDay: 10 });
  const [generation, setGeneration] = useState({ referenceMonth: currentMonth(), amount: "", dueDay: "" });
  const [transaction, setTransaction] = useState({ type: "expense", category: "administrativo", description: "", amount: "", occurredAt: new Date().toISOString().slice(0, 10), paymentMethod: "pix", member: "", notes: "" });

  async function load() {
    setLoading(true); setMessage("");
    try {
      const response = await api("/api/admin/finance/overview");
      setData(response);
      setSettings({ enabled: Boolean(response.settings?.enabled), monthlyFee: centsToInput(response.settings?.monthlyFeeCents), dueDay: response.settings?.dueDay || 10 });
    } catch (error) { setMessage(error.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const openCharges = useMemo(() => (data?.charges || []).filter((item) => item.status === "pending" || item.status === "overdue").slice(0, 25), [data]);

  async function saveSettings(event) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      await api("/api/admin/finance/settings", { method: "PATCH", body: JSON.stringify({ enabled: settings.enabled, monthlyFeeCents: inputToCents(settings.monthlyFee), dueDay: Number(settings.dueDay) }) });
      setMessage("Configuração financeira atualizada.");
      await load();
    } catch (error) { setMessage(error.message); setLoading(false); }
  }

  async function generateCharges(event) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const payload = { referenceMonth: generation.referenceMonth };
      if (generation.amount) payload.amountCents = inputToCents(generation.amount);
      if (generation.dueDay) payload.dueDay = Number(generation.dueDay);
      const response = await api("/api/admin/finance/charges/generate", { method: "POST", body: JSON.stringify(payload) });
      setMessage(`${response.message} ${response.created || 0} nova(s) cobrança(s).`);
      await load();
    } catch (error) { setMessage(error.message); setLoading(false); }
  }

  async function updateCharge(id, status) {
    setLoading(true); setMessage("");
    try {
      await api(`/api/admin/finance/charges/${id}`, { method: "PATCH", body: JSON.stringify({ status, paymentMethod: status === "paid" ? "other" : null, notes: status === "waived" ? "Isenção registrada pela Diretoria." : "" }) });
      setMessage(status === "paid" ? "Pagamento registrado." : "Isenção registrada.");
      await load();
    } catch (error) { setMessage(error.message); setLoading(false); }
  }

  async function addTransaction(event) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      await api("/api/admin/finance/transactions", { method: "POST", body: JSON.stringify({
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        amountCents: inputToCents(transaction.amount),
        occurredAt: new Date(`${transaction.occurredAt}T12:00:00`).toISOString(),
        paymentMethod: transaction.paymentMethod,
        member: transaction.member || null,
        notes: transaction.notes
      }) });
      setTransaction({ type: "expense", category: "administrativo", description: "", amount: "", occurredAt: new Date().toISOString().slice(0, 10), paymentMethod: "pix", member: "", notes: "" });
      setMessage("Lançamento registrado no caixa.");
      await load();
    } catch (error) { setMessage(error.message); setLoading(false); }
  }

  const overview = data?.overview || {};

  return (
    <section className="mc-finance-admin">
      <div className="mc-content-manager-heading">
        <div><p>FINANCEIRO DA IRMANDADE</p><h3>Mensalidades e caixa institucional</h3></div>
        <button type="button" onClick={load} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Atualizar</button>
      </div>

      {message && <div className="mc-finance-message">{message}</div>}

      <div className="mc-finance-admin-summary">
        <div><TrendingUp /><span>RECEITA DE MENSALIDADES</span><strong>{money(overview.membershipRevenueCents)}</strong></div>
        <div><Banknote /><span>OUTRAS ENTRADAS</span><strong>{money(overview.otherIncomeCents)}</strong></div>
        <div><TrendingDown /><span>DESPESAS</span><strong>{money(overview.expensesCents)}</strong></div>
        <div className={Number(overview.balanceCents || 0) < 0 ? "is-danger" : ""}><WalletCards /><span>SALDO REGISTRADO</span><strong>{money(overview.balanceCents)}</strong></div>
      </div>

      <div className="mc-finance-admin-grid">
        <form onSubmit={saveSettings} className="mc-finance-box">
          <div><p>CONFIGURAÇÃO</p><h4>Regra da mensalidade</h4></div>
          <label className="mc-finance-toggle"><input type="checkbox" checked={settings.enabled} onChange={(event) => setSettings((current) => ({ ...current, enabled: event.target.checked }))} /><span>Financeiro ativo</span></label>
          <label><span>Valor mensal (R$)</span><input inputMode="decimal" value={settings.monthlyFee} onChange={(event) => setSettings((current) => ({ ...current, monthlyFee: event.target.value }))} placeholder="0,00" /></label>
          <label><span>Dia padrão do vencimento</span><input type="number" min="1" max="28" value={settings.dueDay} onChange={(event) => setSettings((current) => ({ ...current, dueDay: event.target.value }))} /></label>
          <button disabled={loading}><Save /> Salvar configuração</button>
        </form>

        <form onSubmit={generateCharges} className="mc-finance-box">
          <div><p>GERAR MENSALIDADES</p><h4>Cobrança por competência</h4></div>
          <label><span>Mês de referência</span><input type="month" value={generation.referenceMonth} onChange={(event) => setGeneration((current) => ({ ...current, referenceMonth: event.target.value }))} required /></label>
          <label><span>Valor alternativo (opcional)</span><input inputMode="decimal" value={generation.amount} onChange={(event) => setGeneration((current) => ({ ...current, amount: event.target.value }))} placeholder="Usar valor padrão" /></label>
          <label><span>Dia alternativo (opcional)</span><input type="number" min="1" max="28" value={generation.dueDay} onChange={(event) => setGeneration((current) => ({ ...current, dueDay: event.target.value }))} placeholder="Padrão" /></label>
          <button disabled={loading}><CalendarPlus /> Gerar cobranças</button>
        </form>
      </div>

      <div className="mc-finance-open-list">
        <div className="mc-finance-list-heading"><div><p>PENDÊNCIAS</p><h4>Cobranças em aberto</h4></div><span>{overview.overdueCharges || 0} vencida(s) • {money(overview.outstandingCents)} em aberto</span></div>
        {openCharges.length === 0 && <div className="mc-finance-state">Nenhuma cobrança em aberto.</div>}
        {openCharges.map((charge) => <article key={charge.id} className={charge.status === "overdue" ? "is-overdue" : ""}>
          <div><strong>{charge.member?.apelidoEstrada || charge.member?.nome || "Integrante"}</strong><span>{charge.referenceMonth} • vence {date(charge.dueDate)}</span></div>
          <b>{money(charge.amountCents)}</b>
          <em>{charge.status === "overdue" ? "VENCIDA" : "EM ABERTO"}</em>
          <div><button type="button" onClick={() => updateCharge(charge.id, "paid")} disabled={loading}>Marcar pago</button><button type="button" className="is-secondary" onClick={() => updateCharge(charge.id, "waived")} disabled={loading}>Isentar</button></div>
        </article>)}
      </div>

      <form onSubmit={addTransaction} className="mc-finance-box mc-finance-transaction-form">
        <div><p>CAIXA INSTITUCIONAL</p><h4>Registrar entrada ou despesa</h4></div>
        <div className="grid gap-3 md:grid-cols-3">
          <label><span>Tipo</span><select value={transaction.type} onChange={(event) => setTransaction((current) => ({ ...current, type: event.target.value }))}><option value="income">Entrada</option><option value="expense">Despesa</option></select></label>
          <label><span>Categoria</span><select value={transaction.category} onChange={(event) => setTransaction((current) => ({ ...current, category: event.target.value }))}><option value="evento">Evento</option><option value="doacao">Doação</option><option value="sede">Sede</option><option value="material">Material</option><option value="apoio">Apoio</option><option value="administrativo">Administrativo</option><option value="outro">Outro</option></select></label>
          <label><span>Valor (R$)</span><input inputMode="decimal" value={transaction.amount} onChange={(event) => setTransaction((current) => ({ ...current, amount: event.target.value }))} required /></label>
          <label><span>Data</span><input type="date" value={transaction.occurredAt} onChange={(event) => setTransaction((current) => ({ ...current, occurredAt: event.target.value }))} required /></label>
          <label><span>Forma</span><select value={transaction.paymentMethod} onChange={(event) => setTransaction((current) => ({ ...current, paymentMethod: event.target.value }))}><option value="pix">PIX</option><option value="card">Cartão</option><option value="cash">Dinheiro</option><option value="transfer">Transferência</option><option value="other">Outro</option></select></label>
          <label><span>Integrante vinculado (opcional)</span><select value={transaction.member} onChange={(event) => setTransaction((current) => ({ ...current, member: event.target.value }))}><option value="">Nenhum</option>{members.map((member) => <option key={member.id} value={member.id}>{member.apelidoEstrada} • {member.patente}</option>)}</select></label>
        </div>
        <label><span>Descrição</span><input value={transaction.description} onChange={(event) => setTransaction((current) => ({ ...current, description: event.target.value }))} placeholder="Ex.: manutenção da sede, contribuição para evento" required /></label>
        <label><span>Observações</span><textarea rows="3" value={transaction.notes} onChange={(event) => setTransaction((current) => ({ ...current, notes: event.target.value }))} /></label>
        <button disabled={loading}><CircleDollarSign /> Registrar lançamento</button>
      </form>

      {(data?.transactions || []).length > 0 && <div className="mc-finance-ledger"><div><p>ÚLTIMOS LANÇAMENTOS</p><h4>Movimentação institucional</h4></div>{data.transactions.slice(0, 12).map((item) => <article key={item.id}><span>{date(item.occurredAt)}</span><strong>{item.description}</strong><b className={item.type === "income" ? "is-income" : "is-expense"}>{item.type === "income" ? "+" : "−"}{money(item.amountCents)}</b></article>)}</div>}
    </section>
  );
}

function money(cents) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(cents || 0) / 100); }
function date(value) { const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d); }
function inputToCents(value) { const normalized = String(value || "0").trim().replace(/\./g, "").replace(",", "."); return Math.round(Number(normalized || 0) * 100); }
function centsToInput(cents) { return (Number(cents || 0) / 100).toFixed(2).replace(".", ","); }
