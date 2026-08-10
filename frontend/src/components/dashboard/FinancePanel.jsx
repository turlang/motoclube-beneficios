import { useEffect, useMemo, useState } from "react";
import { CalendarClock, CircleDollarSign, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";
import { api } from "../../services/api.js";

export function FinancePanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try { setData(await api("/api/finance/me")); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  const charges = data?.charges || [];
  const summary = data?.summary || {};
  const settings = data?.settings || {};
  const lastPaid = useMemo(() => charges.find((item) => item.status === "paid"), [charges]);

  return (
    <section className="mc-member-finance">
      <div className="mc-finance-heading">
        <div><p>FINANCEIRO DA IRMANDADE</p><h3>Mensalidade e histórico</h3><span>O caixa institucional fica separado dos benefícios comerciais e dos parceiros.</span></div>
        <button type="button" onClick={load} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Atualizar</button>
      </div>

      {error && <div className="mc-finance-message is-error">{error}</div>}
      {!data && loading && <div className="mc-finance-state">Consultando sua situação financeira...</div>}

      {data && <>
        <div className="mc-finance-summary">
          <div><CircleDollarSign /><span>MENSALIDADE</span><strong>{settings.enabled && settings.monthlyFeeCents > 0 ? money(settings.monthlyFeeCents) : "A definir"}</strong><small>{settings.enabled ? `Vencimento padrão: dia ${settings.dueDay}` : "Financeiro ainda não ativado pela Diretoria"}</small></div>
          <div className={summary.overdueCount > 0 ? "is-danger" : ""}><CalendarClock /><span>PENDÊNCIAS</span><strong>{summary.outstandingCount || 0}</strong><small>{summary.outstandingCents ? money(summary.outstandingCents) : "Nenhum valor em aberto"}</small></div>
          <div><ShieldCheck /><span>ÚLTIMO PAGAMENTO</span><strong>{lastPaid ? monthLabel(lastPaid.referenceMonth) : "—"}</strong><small>{lastPaid?.paidAt ? `Pago em ${date(lastPaid.paidAt)}` : "Sem pagamento registrado"}</small></div>
        </div>

        {summary.nextCharge && (
          <div className={summary.nextCharge.status === "overdue" ? "mc-next-charge is-overdue" : "mc-next-charge"}>
            <div><WalletCards /><span>{summary.nextCharge.status === "overdue" ? "MENSALIDADE VENCIDA" : "PRÓXIMA MENSALIDADE"}</span></div>
            <strong>{monthLabel(summary.nextCharge.referenceMonth)} • {money(summary.nextCharge.amountCents)}</strong>
            <small>Vencimento: {date(summary.nextCharge.dueDate)}</small>
          </div>
        )}

        <div className="mc-charge-history">
          <div><p>HISTÓRICO</p><h4>Últimas mensalidades</h4></div>
          {charges.length === 0 && <div className="mc-finance-state">Nenhuma mensalidade foi gerada para sua conta ainda.</div>}
          {charges.map((charge) => <article key={charge.id}>
            <div><strong>{monthLabel(charge.referenceMonth)}</strong><span>vence {date(charge.dueDate)}</span></div>
            <b>{money(charge.amountCents)}</b>
            <em className={`is-${charge.status}`}>{statusLabel(charge.status)}</em>
          </article>)}
        </div>
      </>}
    </section>
  );
}

function money(cents) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(cents || 0) / 100); }
function date(value) { const d = new Date(value); return Number.isNaN(d.getTime()) ? "—" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(d); }
function monthLabel(value) { const [year, month] = String(value || "").split("-").map(Number); if (!year || !month) return value || "—"; return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "numeric" }).format(new Date(year, month - 1, 1)).replace(" de ", "/"); }
function statusLabel(status) { return ({ paid: "PAGO", pending: "EM ABERTO", overdue: "VENCIDO", waived: "ISENTO" })[status] || status; }
