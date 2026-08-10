import { MapPin, Route, ShieldCheck } from "lucide-react";
import { BrandCrest } from "./BrandCrest.jsx";

export function ClubPresenceSection({ chapters = [] }) {
  const visible = chapters.filter((item) => item.ativo !== false);
  const states = new Set(visible.map((item) => item.estado));
  const routeStops = visible.slice(0, 7);

  return (
    <section id="presenca" className="mc-presence-section">
      <div className="mx-auto grid max-w-[1380px] gap-10 px-4 py-20 md:grid-cols-[.92fr_1.08fr] md:px-7 md:py-28">
        <div>
          <p className="mc-section-eyebrow">PRESENÇA TERRITORIAL</p>
          <h2 className="mc-presence-title">UM ESCUDO.<br />VÁRIAS ESTRADAS.</h2>
          <p className="mc-presence-copy">Cada núcleo é um ponto de referência da irmandade. Em vez de um mapa decorativo, esta área mostra a expansão como uma rede de estrada: sedes, cidades e responsáveis conectados pelo mesmo escudo.</p>

          <div className="mc-presence-counts">
            <div><strong>{visible.length}</strong><span>núcleos ativos</span></div>
            <div><strong>{states.size}</strong><span>estados</span></div>
          </div>

          <div className="mc-chapter-list">
            {visible.length === 0 ? (
              <div className="mc-chapter-empty"><ShieldCheck /><span>Cadastre o primeiro núcleo na área da Diretoria.</span></div>
            ) : visible.slice(0, 8).map((item) => (
              <article key={item._id || `${item.nome}-${item.cidade}`} className={item.destaque ? "mc-chapter-card is-featured" : "mc-chapter-card"}>
                <div className="mc-chapter-shield"><BrandCrest active compact /></div>
                <div><p>{item.estado} • {item.regiao || "NÚCLEO"}</p><h3>{item.nome}</h3><span><MapPin /> {item.cidade}</span>{item.descricao && <small>{item.descricao}</small>}</div>
                {item.destaque && <b>SEDE / DESTAQUE</b>}
              </article>
            ))}
          </div>
        </div>

        <div className="mc-road-network" aria-label="Rede institucional de núcleos do motoclube">
          <div className="mc-road-network-head"><div><span>REDE DA IRMANDADE</span><b>ROTAS & NÚCLEOS</b></div><Route /></div>
          <div className="mc-road-line" />
          <div className="mc-road-stops">
            {routeStops.length === 0 ? (
              <div className="mc-road-empty"><BrandCrest active compact /><strong>PRIMEIRO PONTO DE ESTRADA</strong><span>A rede territorial aparecerá aqui assim que a Diretoria cadastrar os núcleos.</span></div>
            ) : routeStops.map((chapter, index) => (
              <article key={chapter._id || index} className={chapter.destaque ? "is-headquarters" : ""}>
                <div className="mc-road-marker"><span>{String(index + 1).padStart(2, "0")}</span></div>
                <div className="mc-road-stop-copy">
                  <p>{chapter.estado} • {chapter.regiao || "ESTRADA"}</p>
                  <h3>{chapter.nome}</h3>
                  <span><MapPin /> {chapter.cidade}{chapter.responsavel ? ` • ${chapter.responsavel}` : ""}</span>
                </div>
                {chapter.destaque && <b>SEDE</b>}
              </article>
            ))}
          </div>
          <div className="mc-road-network-foot"><span><i /> Núcleo ativo</span><small>Rede institucional atualizada pela Diretoria</small></div>
        </div>
      </div>
    </section>
  );
}
