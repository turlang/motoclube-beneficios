import { MapPin, ShieldCheck } from "lucide-react";
import { BrandCrest } from "./BrandCrest.jsx";

const STATE_POINTS = {
  AC:[18,49], AL:[81,55], AP:[49,15], AM:[31,31], BA:[70,50], CE:[76,38], DF:[59,54], ES:[70,65], GO:[56,55],
  MA:[66,34], MT:[45,48], MS:[48,64], MG:[62,62], PA:[52,29], PB:[81,46], PR:[56,75], PE:[79,50], PI:[69,41],
  RJ:[67,70], RN:[81,42], RS:[52,88], RO:[30,49], RR:[33,14], SC:[57,81], SP:[60,69], SE:[78,57], TO:[59,42]
};

export function ClubPresenceSection({ chapters = [] }) {
  const visible = chapters.filter((item) => item.ativo !== false);
  const states = new Set(visible.map((item) => item.estado));

  return (
    <section id="presenca" className="mc-presence-section">
      <div className="mx-auto grid max-w-[1380px] gap-10 px-4 py-20 md:grid-cols-[.92fr_1.08fr] md:px-7 md:py-28">
        <div>
          <p className="mc-section-eyebrow">PRESENÇA TERRITORIAL</p>
          <h2 className="mc-presence-title">UM ESCUDO.<br />VÁRIAS ESTRADAS.</h2>
          <p className="mc-presence-copy">Cada núcleo representa presença, responsabilidade e referência local. A Diretoria controla esta rede pela sede digital e a Home reflete a expansão em tempo real.</p>

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

        <div className="mc-brazil-panel" aria-label="Mapa institucional dos núcleos do motoclube">
          <div className="mc-map-heading"><span>MAPA DA IRMANDADE</span><b>BRASIL</b></div>
          <svg viewBox="0 0 100 100" className="mc-brazil-map" role="img" aria-label="Representação visual do Brasil com presença por estado">
            <path className="mc-brazil-shape" d="M49 5 60 10 68 18 80 22 88 34 84 47 78 54 75 66 69 75 61 82 56 94 48 89 43 79 34 74 29 64 20 58 15 48 19 38 14 29 23 19 34 16 40 8Z" />
            {visible.map((chapter, index) => {
              const point = STATE_POINTS[chapter.estado] || [50,50];
              const offset = index % 3;
              return <g key={chapter._id || index} className="mc-map-pin" transform={`translate(${point[0] + offset * 1.4} ${point[1] + offset * 1.2})`}>
                <circle r="3.8" className="mc-map-pin-halo" /><circle r="1.5" className="mc-map-pin-core" />
              </g>;
            })}
          </svg>
          <div className="mc-map-legend"><span><i /> Núcleo ativo</span><small>Representação institucional por UF</small></div>
        </div>
      </div>
    </section>
  );
}
