import { useMemo, useState } from "react";
import { BadgeCheck, Bike, CalendarDays, CheckCircle2, Clock3, MapPin, Route, ShieldCheck, UsersRound, XCircle } from "lucide-react";
import { SectionHeader } from "./DashboardUI.jsx";
import { EventRouteManager } from "./EventRouteManager.jsx";

export function ClubeTab({ isActive, events, loading, error, onRsvp, isDiretoria, onEventsRefresh }) {
  const [busyId, setBusyId] = useState("");
  const now = Date.now();
  const upcoming = useMemo(() => events.filter((item) => item.status !== "realizado" && new Date(item.data).getTime() >= now), [events, now]);
  const completed = useMemo(() => events.filter((item) => item.status === "realizado" || new Date(item.data).getTime() < now).slice(-3).reverse(), [events, now]);

  async function rsvp(item, status) {
    setBusyId(item._id);
    try { await onRsvp(item._id, status); }
    finally { setBusyId(""); }
  }

  return (
    <>
      <SectionHeader eyebrow="Agenda da irmandade" title="Confirme presença. Leia o briefing. Pegue a estrada." />

      <section className="mc-membership-strip">
        <div><ShieldCheck /><span>ESCUDO</span><strong>{isActive ? "LIBERADO" : "SUSPENSO"}</strong></div>
        <div><CalendarDays /><span>PRÓXIMOS</span><strong>{upcoming.length}</strong></div>
        <div><UsersRound /><span>PRESENÇA</span><strong>{upcoming.filter((item) => item.myStatus === "confirmada").length}</strong></div>
      </section>

      {loading && <div className="mc-event-state">Carregando agenda da estrada...</div>}
      {error && <div className="mc-event-message is-error">{error}</div>}
      {!loading && !error && upcoming.length === 0 && <div className="mc-event-state">Nenhum encontro ou rota agendada no momento.</div>}

      <div className="mc-member-events">
        {upcoming.map((item) => {
          const confirmed = item.myStatus === "confirmada";
          const full = item.availableSpots === 0 && !confirmed;
          const closed = !item.confirmationOpen;
          return (
            <article key={item._id} className={["mc-member-event", item.destaque ? "is-highlight" : "", item.status === "cancelado" ? "is-cancelled" : ""].join(" ")}>
              {item.imageUrl && <img src={item.imageUrl} alt="" className="mc-member-event-photo" loading="lazy" />}
              <div className="mc-member-event-shade" />
              <div className="mc-member-event-body">
                <div className="mc-member-event-top"><span>{item.tipo || "encontro"}</span>{item.destaque && <b>DESTAQUE</b>}{confirmed && <b className="is-confirmed"><BadgeCheck /> CONFIRMADO</b>}</div>
                <h3>{item.titulo}</h3>
                <p>{item.rotaResumo || item.descricao}</p>

                <div className="mc-event-facts">
                  <span><CalendarDays /> {formatDateTime(item.data)}</span>
                  <span><MapPin /> {item.pontoEncontro || item.local || item.cidade || "Ponto a definir"}</span>
                  {item.distanciaKm > 0 && <span><Route /> {item.distanciaKm} km • nível {item.nivelRota || "livre"}</span>}
                  <span><UsersRound /> {item.confirmedCount || 0}{item.capacidade ? ` / ${item.capacidade}` : ""} confirmados</span>
                </div>

                {item.briefing && <details className="mc-event-briefing"><summary>LER BRIEFING DA ROTA</summary><p>{item.briefing}</p></details>}

                <div className="mc-event-actions">
                  {confirmed ? (
                    <button type="button" onClick={() => rsvp(item, "cancelada")} disabled={busyId === item._id}><XCircle /> Cancelar presença</button>
                  ) : (
                    <button type="button" className="is-primary" onClick={() => rsvp(item, "confirmada")} disabled={busyId === item._id || full || closed || item.status === "cancelado"}><CheckCircle2 /> {full ? "Vagas encerradas" : closed ? "Confirmação encerrada" : "Confirmar presença"}</button>
                  )}
                  {item.confirmacaoAte && <small><Clock3 /> confirmar até {formatDateTime(item.confirmacaoAte)}</small>}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {completed.length > 0 && (
        <section className="mc-event-memory">
          <div><p>MEMÓRIA DE ESTRADA</p><h3>Últimos encontros</h3></div>
          {completed.map((item) => <article key={item._id}><div><span>{formatDate(item.data)}</span><strong>{item.titulo}</strong><p>{item.resumoPosEvento || "Evento encerrado. A memória da irmandade continua na estrada."}</p></div>{item.albumUrl && <a href={item.albumUrl} target="_blank" rel="noreferrer">VER ÁLBUM</a>}</article>)}
        </section>
      )}

      {isDiretoria && <EventRouteManager onEventsRefresh={onEventsRefresh} />}

      <section className="mc-club-membership-card">
        <div><Bike /><p>VIDA NO CLUBE</p></div>
        <h3>Seu escudo mantém você conectado à irmandade.</h3>
        <ul><li><CheckCircle2 /> Parceiros e benefícios</li><li><CheckCircle2 /> Eventos e rotas</li><li><CheckCircle2 /> Rede de apoio</li><li><CheckCircle2 /> Identidade digital</li></ul>
        <span className={isActive ? "is-active" : "is-inactive"}>{isActive ? "ASSINATURA ATIVA" : "ASSINATURA INATIVA"}</span>
      </section>
    </>
  );
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Data a definir" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}
