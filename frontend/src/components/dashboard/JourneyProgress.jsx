import { BadgeCheck, CheckCircle2, Circle, Clock3, Flag, Route, Shield, UsersRound } from "lucide-react";

const STAGES = ["Candidato", "Próspero", "Meio-Escudo", "Escudado"];

export function JourneyProgress({ journey, loading, error }) {
  if (loading) return <div className="mc-journey-state">Carregando sua jornada...</div>;
  if (error) return <div className="mc-event-message is-error">{error}</div>;
  if (!journey) return <div className="mc-journey-state">Sua jornada ainda não foi inicializada.</div>;

  const currentPatent = journey.member?.patente || "Candidato";
  const currentIndex = currentPatent === "Diretoria" ? STAGES.length - 1 : Math.max(0, STAGES.indexOf(currentPatent));
  const progress = journey.progress || { percent: 0, completed: 0, total: 0, ready: false };

  return (
    <section className="mc-journey-shell">
      <div className="mc-journey-head">
        <div>
          <p>CAMINHADA DENTRO DA IRMANDADE</p>
          <h3>{currentPatent === "Diretoria" ? "Escudado • serviço à Diretoria" : `${currentPatent}${journey.nextPatent ? ` → ${journey.nextPatent}` : ""}`}</h3>
          <span>As etapas e requisitos são acompanhados pela Diretoria e podem ser ajustados conforme as regras internas do clube.</span>
        </div>
        <div className="mc-journey-percent"><strong>{progress.percent}%</strong><small>ETAPA ATUAL</small></div>
      </div>

      <div className="mc-journey-track" aria-label="Progressão de patente">
        {STAGES.map((stage, index) => {
          const done = index < currentIndex || currentPatent === "Diretoria";
          const current = index === currentIndex && currentPatent !== "Diretoria";
          return (
            <div key={stage} className={["mc-journey-stage", done ? "is-done" : "", current ? "is-current" : ""].join(" ")}>
              <span>{done ? <CheckCircle2 /> : current ? <Shield /> : <Circle />}</span>
              <b>{stage}</b>
            </div>
          );
        })}
      </div>

      <div className="mc-journey-progressbar"><span style={{ width: `${progress.percent}%` }} /></div>

      <div className="mc-journey-metrics">
        <Metric icon={<Clock3 />} label="Tempo de jornada" value={`${journey.metrics?.tenureDays || 0} dias`} />
        <Metric icon={<Route />} label="Participações registradas" value={journey.metrics?.participacoesRegistradas || 0} />
        <Metric icon={<UsersRound />} label="Padrinho" value={journey.padrinho?.apelidoEstrada || "A definir"} />
      </div>

      {journey.requisitos?.length > 0 ? (
        <div className="mc-journey-requirements">
          <div className="mc-journey-section-title"><Flag /><div><p>REQUISITOS DA ETAPA</p><h4>{progress.completed} de {progress.total} concluídos</h4></div></div>
          {journey.requisitos.map((item) => (
            <article key={item.key} className={item.completed ? "is-done" : ""}>
              <span>{item.completed ? <BadgeCheck /> : <Circle />}</span>
              <div><strong>{item.label}</strong>{item.notes && <small>{item.notes}</small>}</div>
              <b>{item.completed ? "CONCLUÍDO" : "PENDENTE"}</b>
            </article>
          ))}
        </div>
      ) : (
        <div className="mc-journey-complete"><BadgeCheck /><div><p>ESCUDO COMPLETO</p><h4>Não há nova patente automática após esta etapa.</h4></div></div>
      )}

      {journey.historico?.length > 0 && (
        <div className="mc-journey-history">
          <div className="mc-journey-section-title"><Shield /><div><p>HISTÓRICO DO ESCUDO</p><h4>Promoções registradas</h4></div></div>
          {[...journey.historico].reverse().map((item) => (
            <article key={item._id || `${item.fromPatent}-${item.toPatent}-${item.approvedAt}`}>
              <div><strong>{item.fromPatent} → {item.toPatent}</strong><span>{formatDate(item.approvedAt)}</span></div>
              <p>{item.notes || "Promoção registrada pela Diretoria."}</p>
              {item.approvedBy?.apelidoEstrada && <small>Aprovado por {item.approvedBy.apelidoEstrada}</small>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ icon, label, value }) {
  return <div><span>{icon}</span><p>{label}</p><strong>{value}</strong></div>;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}
