import { useState } from "react";
import { Camera, MapPin, X } from "lucide-react";

const FALLBACK = [
  { titulo: "Faça chuva ou faça sol", categoria: "estrada", imageUrl: "https://images.pexels.com/photos/5195487/pexels-photo-5195487.jpeg?auto=compress&cs=tinysrgb&w=1400", legenda: "A estrada muda. A irmandade permanece.", destaque: true },
  { titulo: "Estrada & irmandade", categoria: "irmandade", imageUrl: "https://images.pexels.com/photos/12202235/pexels-photo-12202235.jpeg?auto=compress&cs=tinysrgb&w=1400", legenda: "Quilômetros compartilhados constroem memória." },
  { titulo: "Juntos na rota", categoria: "encontro", imageUrl: "https://images.pexels.com/photos/9789338/pexels-photo-9789338.jpeg?auto=compress&cs=tinysrgb&w=1400", legenda: "O clube acontece fora da tela." }
];

export function ClubMediaGallery({ media = [] }) {
  const [selected, setSelected] = useState(null);
  const items = (media.length ? media : FALLBACK).slice(0, 10);

  return (
    <section id="galeria" className="mc-live-gallery">
      <div className="mx-auto max-w-[1480px] px-4 py-20 md:px-7 md:py-28">
        <div className="mc-live-gallery-heading">
          <div><p className="mc-section-eyebrow">MEMÓRIA DO CLUBE</p><h2>ESTRADA, PESSOAS<br />E HISTÓRIAS REAIS.</h2></div>
          <p>A galeria deixa de ser decoração: cada registro pode ser publicado e organizado pela Diretoria, construindo a memória visual do motoclube.</p>
        </div>

        <div className="mc-live-gallery-grid">
          {items.map((item, index) => (
            <button key={item._id || `${item.titulo}-${index}`} type="button" onClick={() => setSelected(item)} className={["mc-live-photo", index === 0 || index === 5 ? "is-wide" : "", item.destaque ? "is-highlight" : ""].join(" ")}>
              <img src={item.imageUrl} alt={item.titulo} loading="lazy" />
              <div className="mc-live-photo-overlay" />
              <div className="mc-live-photo-copy"><p><Camera /> {item.categoria || "estrada"}</p><h3>{item.titulo}</h3>{item.local && <span><MapPin /> {item.local}</span>}</div>
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
