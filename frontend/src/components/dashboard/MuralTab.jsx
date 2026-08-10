import { BellRing, CheckCircle2, Clock3, Megaphone, ShieldAlert } from "lucide-react";
import { SectionHeader } from "./DashboardUI.jsx";

export function MuralTab({ announcements, loading, error, unreadCount, pendingAckCount, onRead, onAck }) {
  return (
    <>
      <SectionHeader eyebrow="Comunicação oficial" title="Mural da irmandade" />

      <section className="mc-mural-summary">
        <div><BellRing /><span>NÃO LIDOS</span><strong>{unreadCount}</strong></div>
        <div><CheckCircle2 /><span>CIÊNCIA PENDENTE</span><strong>{pendingAckCount}</strong></div>
      </section>

      {loading && <div className="mc-event-state">Buscando comunicados da Diretoria...</div>}
      {error && <div className="mc-event-message is-error">{error}</div>}
      {!loading && !error && announcements.length === 0 && (
        <div className="mc-event-state">Nenhum comunicado publicado para você no momento.</div>
      )}

      <section className="mc-mural-grid">
        {announcements.map((item) => {
          const unread = !item.readAt;
          const pendingAck = item.requiresAck && !item.acknowledgedAt;
          return (
            <details
              key={item._id}
              className={["mc-mural-card", `priority-${item.prioridade}`, unread ? "is-unread" : ""].join(" ")}
              onToggle={(event) => {
                if (event.currentTarget.open && unread) onRead(item._id);
              }}
            >
              <summary>
                <div className="mc-mural-icon">{item.prioridade === "urgente" ? <ShieldAlert /> : <Megaphone />}</div>
                <div className="mc-mural-headcopy">
                  <p>{item.tipo} • {item.prioridade}</p>
                  <h3>{item.titulo}</h3>
                  <span><Clock3 /> {formatDateTime(item.publishedAt)}</span>
                </div>
                {unread && <b>NOVO</b>}
              </summary>

              <div className="mc-mural-content">
                <p>{item.mensagem}</p>
                {item.expiresAt && <small>Válido até {formatDateTime(item.expiresAt)}</small>}
                {item.requiresAck && (
                  <button
                    type="button"
                    className={pendingAck ? "mc-mural-ack" : "mc-mural-ack is-done"}
                    disabled={!pendingAck}
                    onClick={() => onAck(item._id)}
                  >
                    <CheckCircle2 /> {pendingAck ? "Confirmar ciência" : "Ciência registrada"}
                  </button>
                )}
              </div>
            </details>
          );
        })}
      </section>
    </>
  );
}

function formatDateTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}
