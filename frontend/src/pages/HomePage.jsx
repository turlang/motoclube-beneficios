import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bike,
  Clock3,
  Crown,
  MapPin,
  Route,
  ShieldCheck,
  Siren,
  Wrench
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandCrest } from "../components/BrandCrest.jsx";
import { api } from "../services/api.js";

const PHOTOS = {
  hero: "https://images.pexels.com/photos/9789339/pexels-photo-9789339.jpeg?auto=compress&cs=tinysrgb&w=2200",
  rain: "https://images.pexels.com/photos/5195487/pexels-photo-5195487.jpeg?auto=compress&cs=tinysrgb&w=1500",
  road: "https://images.pexels.com/photos/12202235/pexels-photo-12202235.jpeg?auto=compress&cs=tinysrgb&w=1500"
};

const FALLBACK = {
  profile: {
    nome: "Irmãos do Asfalto",
    sigla: "MC",
    foundedYear: 2026,
    cidade: "São Paulo",
    estado: "SP",
    headline: "A estrada nos une. O escudo nos representa.",
    historia: "O Irmãos do Asfalto nasce da vontade de rodar junto, criar vínculos e construir uma irmandade que exista de verdade fora da tela.",
    manifesto: "A palavra vale. Ninguém fica para trás. O escudo vem depois da convivência.",
    heroImageUrl: PHOTOS.hero
  },
  officers: [], events: [], posts: [], chapters: [], media: []
};

const SCREENS = [
  ["inicio", "Início"], ["historia", "História"], ["base", "Nossa base"],
  ["comando", "Comando"], ["agenda", "Agenda"], ["nucleos", "Núcleos"],
  ["memoria", "Memória"], ["diario", "Diário"], ["sede", "Sede digital"]
];

const PRINCIPLES = [
  ["01", "Respeito", "Na estrada, a gente espera. Na sede, a gente escuta. Respeito vem antes do colete."],
  ["02", "Palavra", "Combinou, cumpre. Se não der, avisa. Confiança se constrói no detalhe."],
  ["03", "Responsa", "Moto em ordem, cabeça no lugar e consciência de quem está rodando ao lado."],
  ["04", "Irmandade", "Quando um para, ninguém simplesmente segue viagem. Esse é o ponto."]
];

const BENEFITS = [
  [Wrench, "Oficina & pneu", "Parceiros para manutenção e reparos."],
  [Route, "Estrada", "Agenda, briefing e confirmação de presença."],
  [Siren, "Apoio", "SOS e canais da irmandade no mesmo lugar."]
];

export function HomePage() {
  const [club, setClub] = useState(FALLBACK);
  const [active, setActive] = useState(0);
  const touchStart = useRef(null);

  useEffect(() => {
    api("/api/club/home")
      .then((data) => setClub({
        profile: data.profile || FALLBACK.profile,
        officers: data.officers || [], events: data.events || [], posts: data.posts || [],
        chapters: data.chapters || [], media: data.media || []
      }))
      .catch(() => setClub(FALLBACK));
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (["ArrowRight", "PageDown"].includes(event.key)) setActive((value) => Math.min(SCREENS.length - 1, value + 1));
      if (["ArrowLeft", "PageUp"].includes(event.key)) setActive((value) => Math.max(0, value - 1));
      if (event.key === "Home") setActive(0);
      if (event.key === "End") setActive(SCREENS.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const profile = club.profile || FALLBACK.profile;
  const heroImage = profile.heroImageUrl || PHOTOS.hero;
  const officers = useMemo(() => (club.officers.length ? club.officers : fallbackOfficers()).slice(0, 3), [club.officers]);
  const events = useMemo(() => (club.events.length ? club.events : fallbackEvents()).slice(0, 3), [club.events]);
  const posts = useMemo(() => (club.posts.length ? club.posts : fallbackPosts()).slice(0, 3), [club.posts]);
  const chapters = club.chapters.filter((item) => item.ativo !== false).slice(0, 5);
  const media = (club.media.length ? club.media : fallbackMedia()).slice(0, 5);

  const go = (index) => setActive(Math.max(0, Math.min(SCREENS.length - 1, index)));

  function onTouchStart(event) { touchStart.current = event.touches[0]?.clientX ?? null; }
  function onTouchEnd(event) {
    if (touchStart.current == null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchStart.current) - touchStart.current;
    if (Math.abs(delta) > 55) go(active + (delta < 0 ? 1 : -1));
    touchStart.current = null;
  }

  return (
    <main className="mc-stage" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <header className="mc-stage-header">
        <button type="button" className="mc-stage-brand" onClick={() => go(0)}>
          <span><BrandCrest active compact /></span>
          <div><b>{profile.nome}</b><small>{profile.cidade} {profile.estado ? `• ${profile.estado}` : ""}</small></div>
        </button>

        <nav className="mc-stage-menu" aria-label="Capítulos do site">
          {SCREENS.map(([id, label], index) => (
            <button key={id} type="button" className={active === index ? "is-active" : ""} onClick={() => go(index)}>{label}</button>
          ))}
        </nav>

        <div className="mc-stage-account"><Link to="/login">Associado</Link><Link to="/cadastro">Fazer parte</Link></div>
      </header>

      <div className="mc-stage-body" aria-live="polite">
        {active === 0 && (
          <Screen className="mc-screen-hero" image={heroImage}>
            <div className="mc-stage-hero-crest"><BrandCrest active size="large" /></div>
            <div className="mc-stage-hero-copy">
              <p className="mc-stage-kicker"><Bike /> RESPEITO • PALAVRA • ESTRADA</p>
              <h1>{firstSentence(profile.headline)}<span>O resto a gente constrói junto.</span></h1>
              <p>Um motoclube para quem entende que rodar junto é mais do que aparecer na mesma foto.</p>
              <div className="mc-stage-actions"><button onClick={() => go(1)}>Conheça o clube <ArrowRight /></button><Link to="/cadastro">Quero fazer parte</Link></div>
              <aside>“Sem pose. Sem pressa. Primeiro a convivência, depois o colete.”</aside>
            </div>
          </Screen>
        )}

        {active === 1 && (
          <Screen className="mc-screen-history">
            <figure className="mc-stage-photo"><img src={PHOTOS.road} alt="Motociclistas na estrada" /><figcaption>Arquivo de estrada • {profile.cidade || "sede"}</figcaption><b>{profile.foundedYear || "—"}</b></figure>
            <div className="mc-stage-editorial">
              <p className="mc-stage-kicker">NOSSA HISTÓRIA</p>
              <h2>A gente não inventa história.<br /><em>A gente acumula quilômetros.</em></h2>
              <p className="mc-stage-lead">{profile.historia}</p>
              <blockquote>{profile.manifesto}</blockquote>
              <div className="mc-stage-signature"><Crown /> {profile.sigla || "MC"} • {profile.cidade} {profile.estado || ""}</div>
            </div>
          </Screen>
        )}

        {active === 2 && (
          <Screen className="mc-screen-principles">
            <div className="mc-principles-intro"><p className="mc-stage-kicker">NOSSA BASE</p><h2>Quatro coisas que<br />a gente leva a sério.</h2><p>Não são palavras para preencher parede. São coisas simples que aparecem quando a estrada aperta.</p><aside>Nota de estrada<br /><b>Ninguém ganha respeito só porque veste um patch.</b></aside></div>
            <div className="mc-principles-human">{PRINCIPLES.map(([n, title, text], index) => <article key={n} className={index % 2 ? "is-offset" : ""}><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
          </Screen>
        )}

        {active === 3 && (
          <Screen className="mc-screen-command">
            <div className="mc-stage-topline"><div><p className="mc-stage-kicker">QUEM PUXA A FILA</p><h2>Comando também é responsabilidade.</h2></div><p>Quem representa o escudo responde pelas decisões e pela forma como o clube é conduzido.</p></div>
            <div className="mc-command-compact">{officers.map((officer, index) => <article key={officer._id || index}><div className="mc-command-photo">{officer.photoUrl ? <img src={officer.photoUrl} alt={officer.apelidoEstrada || officer.nome} /> : <BrandCrest active compact />}</div><span>0{index + 1} • {officer.cargo}</span><h3>{officer.apelidoEstrada || officer.nome}</h3><p>{officer.bio || "Diretoria do motoclube."}</p></article>)}</div>
          </Screen>
        )}

        {active === 4 && (
          <Screen className="mc-screen-agenda">
            <div className="mc-agenda-intro"><p className="mc-stage-kicker">AGENDA DE ESTRADA</p><h2>Próxima saída tem hora, ponto e rota.</h2><p>A sede digital organiza. O encontro acontece do lado de fora.</p></div>
            <div className="mc-agenda-compact">{events.map((event, index) => <article key={event._id || index}><div className="mc-date-block"><b>{datePart(event.data, "day")}</b><span>{datePart(event.data, "month")}</span></div><div><small>{event.tipo || "encontro"}</small><h3>{event.titulo}</h3><p><Clock3 /> {formatDateTime(event.data)}</p><p><MapPin /> {[event.local, event.cidade].filter(Boolean).join(" • ") || "Ponto a definir"}</p><em>{event.descricao}</em></div></article>)}</div>
          </Screen>
        )}

        {active === 5 && (
          <Screen className="mc-screen-chapters">
            <div className="mc-chapters-copy"><p className="mc-stage-kicker">NÚCLEOS</p><h2>Um escudo.<br />Várias estradas.</h2><p>{chapters.length || 0} núcleo(s) ativo(s). Presença local, responsabilidade local.</p><div className="mc-route-line" /></div>
            <div className="mc-chapter-compact">{chapters.length ? chapters.map((chapter, index) => <article key={chapter._id || index}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{chapter.estado} • {chapter.regiao || "NÚCLEO"}</small><h3>{chapter.nome}</h3><p><MapPin /> {chapter.cidade}{chapter.responsavel ? ` • ${chapter.responsavel}` : ""}</p></div>{chapter.destaque && <b>SEDE</b>}</article>) : <div className="mc-stage-empty"><BrandCrest active compact /><p>O primeiro núcleo aparecerá aqui quando a Diretoria cadastrá-lo.</p></div>}</div>
          </Screen>
        )}

        {active === 6 && (
          <Screen className="mc-screen-memory">
            <div className="mc-stage-topline"><div><p className="mc-stage-kicker">MEMÓRIA</p><h2>Quilômetros que viram história.</h2></div><p>Menos banco de imagem. Mais registro de quem realmente estava lá.</p></div>
            <div className="mc-memory-compact">{media.map((item, index) => <figure key={item._id || index} className={index === 0 ? "is-main" : ""}><img src={item.imageUrl || PHOTOS.hero} alt={item.titulo || "Registro do clube"} /><figcaption><span>{String(index + 1).padStart(2, "0")} • {item.categoria || "estrada"}</span><b>{item.titulo || "Registro de estrada"}</b>{item.local && <small>{item.local}</small>}</figcaption></figure>)}</div>
          </Screen>
        )}

        {active === 7 && (
          <Screen className="mc-screen-journal">
            <div className="mc-journal-intro"><p className="mc-stage-kicker">DIÁRIO DE ESTRADA</p><h2>O que aconteceu.<br />O que vem pela frente.</h2><p>Notícia de clube precisa ter data, lugar e gente envolvida — não texto para preencher seção.</p></div>
            <div className="mc-journal-compact">{posts.map((post, index) => <article key={post._id || index}>{post.imageUrl && <img src={post.imageUrl} alt="" />}<div><small>{post.categoria || "notícia"} • {formatDate(post.publishedAt)}</small><h3>{post.titulo}</h3><p>{post.resumo}</p></div></article>)}</div>
          </Screen>
        )}

        {active === 8 && (
          <Screen className="mc-screen-digital">
            <div className="mc-digital-compact"><div className="mc-digital-patch"><BrandCrest active size="large" /><small>ESCUDO DIGITAL</small><h3>FALCÃO</h3><p>ESCUDADO</p><span><BadgeCheck /> ESCUDO LIBERADO</span></div></div>
            <div className="mc-digital-copy"><p className="mc-stage-kicker">SEDE DIGITAL</p><h2>A tecnologia fica no bolso.<br /><em>O clube continua na estrada.</em></h2><p>Escudo, agenda, parceiros, comunicação, garagem e financeiro sem transformar a irmandade num aplicativo genérico.</p><div className="mc-benefits-compact">{BENEFITS.map(([Icon, title, text]) => <div key={title}><Icon /><span><b>{title}</b><small>{text}</small></span></div>)}</div><Link to="/login" className="mc-stage-login">Abrir minha sede <ArrowRight /></Link></div>
          </Screen>
        )}
      </div>

      <footer className="mc-stage-controls">
        <button type="button" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Tela anterior"><ArrowLeft /></button>
        <div><b>{String(active + 1).padStart(2, "0")}</b><span>/ {String(SCREENS.length).padStart(2, "0")}</span><em>{SCREENS[active][1]}</em></div>
        <div className="mc-stage-dots">{SCREENS.map(([id], index) => <button key={id} aria-label={`Ir para ${SCREENS[index][1]}`} className={active === index ? "is-active" : ""} onClick={() => go(index)} />)}</div>
        <button type="button" onClick={() => go(active + 1)} disabled={active === SCREENS.length - 1} aria-label="Próxima tela"><ArrowRight /></button>
      </footer>
    </main>
  );
}

function Screen({ className = "", image, children }) {
  return <section className={`mc-stage-screen ${className}`} style={image ? { "--screen-image": `url(${image})` } : undefined}>{children}</section>;
}
function firstSentence(value) { return String(value || "A estrada nos une.").split(".")[0] + "."; }
function datePart(value, part) { const date = new Date(value); if (Number.isNaN(date.getTime())) return part === "day" ? "--" : "---"; return part === "day" ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date) : new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "").toUpperCase(); }
function formatDateTime(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "Data a definir" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date); }
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date); }
function fallbackOfficers() { return [{ cargo: "Presidência", apelidoEstrada: "Comandante", bio: "Direção institucional e responsabilidade pelo escudo." }, { cargo: "Estrada", apelidoEstrada: "Estradeiro", bio: "Organiza rotas, briefings e segurança dos encontros." }, { cargo: "Apoio", apelidoEstrada: "Guardião", bio: "Cuida da integração entre irmãos, núcleos e parceiros." }]; }
function fallbackEvents() { return [{ titulo: "Encontro da Irmandade", tipo: "encontro", data: new Date(Date.now() + 14 * 86400000).toISOString(), cidade: "São Paulo", descricao: "Conversa, alinhamento e estrada." }, { titulo: "Bate e volta da serra", tipo: "rota", data: new Date(Date.now() + 28 * 86400000).toISOString(), cidade: "São Paulo", descricao: "Saída com briefing e pontos de parada." }]; }
function fallbackPosts() { return [{ titulo: "O escudo vem depois da convivência", categoria: "clube", resumo: "Pertencimento não começa no cadastro. Começa na presença.", imageUrl: PHOTOS.hero, publishedAt: new Date().toISOString() }, { titulo: "Antes da rota", categoria: "garagem", resumo: "Moto revisada, horário combinado e cabeça no lugar.", imageUrl: PHOTOS.rain, publishedAt: new Date().toISOString() }, { titulo: "Estrada também vira memória", categoria: "rota", resumo: "Cada encontro deixa histórias que merecem ser guardadas.", imageUrl: PHOTOS.road, publishedAt: new Date().toISOString() }]; }
function fallbackMedia() { return [{ titulo: "Na estrada", categoria: "irmandade", imageUrl: PHOTOS.hero }, { titulo: "Faça chuva", categoria: "estrada", imageUrl: PHOTOS.rain }, { titulo: "Quilômetros juntos", categoria: "rota", imageUrl: PHOTOS.road }]; }
