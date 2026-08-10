import { useState } from "react";
import { Camera, MapPin, X } from "lucide-react";

const HERO = "https://images.pexels.com/photos/9789339/pexels-photo-9789339.jpeg?auto=compress&cs=tinysrgb&w=1600";
const FALLBACK = [
  { titulo: "Faça chuva ou faça sol", categoria: "estrada", imageUrl: "https://images.pexels.com/photos/5195487/pexels-photo-5195487.jpeg?auto=compress&cs=tinysrgb&w=1400", legenda: "A estrada muda. A irmandade permanece.", destaque: true },
  { titulo: "Estrada & irmandade", categoria: "irmandade", imageUrl: "https://images.pexels.com/photos/12202235/pexels-photo-12202235.jpeg?auto=compress&cs=tinysrgb&w=1400", legenda: "Quilômetros compartilhados constroem memória." },
  { titulo: "Juntos na rota", categoria: "encontro", imageUrl: HERO, legenda: "O clube acontece fora da tela." }
];

export function ClubMediaGallery({ media = [] }) {
  const [selected, setSelected] = useState(null);
  const source = media.length ? media : FALLBACK;
  const items = source.slice(0, 8).map((item, index) => ({ ...item, imageUrl: resolveImage(item.imageUrl, index) }));

  return (
    <section id="galeria" className="mc-live-gallery">
      <div className="mx-auto max-w-[1480px] px-4 py-20 md:px-7 md:py-28">
        <div className="mc-live-gallery-heading">
          <div><p className="mc-section-eyebrow">MEMÓRIA DO CLUBE</p><h2>QUILÔMETROS QUE<br />VIRAM HISTÓRIA.</h2></div>
          <p>Encontros, comboios, ações e momentos da irmandade. A galeria é o álbum vivo de quem constrói o clube na rua, e não apenas na tela.</p>
        </div>

        <div className="mc-live-gallery-grid">
          {items.map((item, index) => (
            <button key={item._id || `${item.titulo}-${index}`} type="button" onClick={() => setSelected(item)} className={["mc-live-photo", index === 0 ? "is-wide is-lead" : "", item.destaque ? "is-highlight" : ""].join(" ")}>
              <img src={item.imageUrl} alt={item.titulo} loading="lazy" />
              <div className="mc-live-photo-overlay" />
              <div className="mc-live-photo-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="mc-live-photo-copy"><p><Camera /> {item.categoria || "estrada"}</p><h3>{item.titulo}</h3>{item.legenda && <small>{item.legenda}</small>}{item.local && <span><MapPin /> {item.local}</span>}</div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="mc-lightbox" role="dialog" aria-modal="true" aria-label={selected.titulo} onClick={() => setSelected(null)}>
          <button type="button" className="mc-lightbox-close" onClick={() => setSelected(null)} aria-label="Fechar"><X /></button>
          <div className="mc-lightbox-card" onClick={(event) => event.stopPropagation()}>
            <img src={selected.imageUrl} alt={selected.titulo} />
            <div><p>{selected.categoria || "estrada"}</p><h3>{selected.titulo}</h3>{selected.legenda && <span>{selected.legenda}</span>}{selected.local && <small><MapPin /> {selected.local}</small>}</div>
          </div>
        </div>
      )}
    </section>
  );
}

function resolveImage(url, index) {
  if (!url) return FALLBACK[index % FALLBACK.length].imageUrl;
  if (String(url).includes("9789338/pexels-photo-9789338")) return HERO;
  return url;
}
