import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  ChevronRight,
  Clock3,
  Crown,
  Handshake,
  MapPin,
  MapPinned,
  Route,
  ShieldCheck,
  Siren,
  Wrench
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandCrest } from "../components/BrandCrest.jsx";
import { ClubMediaGallery } from "../components/ClubMediaGallery.jsx";
import { ClubPresenceSection } from "../components/ClubPresenceSection.jsx";
import { api } from "../services/api.js";

const PHOTOS = {
  hero: "https://images.pexels.com/photos/9789339/pexels-photo-9789339.jpeg?auto=compress&cs=tinysrgb&w=2200",
  rain: "https://images.pexels.com/photos/5195487/pexels-photo-5195487.jpeg?auto=compress&cs=tinysrgb&w=1400",
  road: "https://images.pexels.com/photos/12202235/pexels-photo-12202235.jpeg?auto=compress&cs=tinysrgb&w=1400"
};

const FALLBACK = {
  profile: {
    nome: "Irmãos do Asfalto",
    sigla: "MC",
    foundedYear: 2026,
    cidade: "São Paulo",
    estado: "SP",
    headline: "A estrada nos une. O escudo nos representa.",
    historia: "O Irmãos do Asfalto nasce para reunir motociclistas em torno de respeito, convivência, responsabilidade e apoio. Mais do que um clube de benefícios, a proposta é construir uma irmandade com presença real na estrada e uma sede digital capaz de organizar membros, parceiros, encontros e a memória do clube.",
    manifesto: "Honra para representar o escudo. Respeito por quem divide a estrada. Responsabilidade em cada decisão. Irmandade para que ninguém caminhe sozinho.",
    heroImageUrl: PHOTOS.hero
  },
  officers: [],
  events: [],
  posts: [],
  chapters: [],
  media: []
};

const principles = [
  ["01", "RESPEITO", "Cumprimentar quem chega, ouvir quem conhece a estrada e não usar o escudo para passar por cima de ninguém."],
  ["02", "IRMANDADE", "Rodar junto também é esperar no acostamento, voltar para buscar e não deixar ninguém para trás."],
  ["03", "RESPONSABILIDADE", "Moto em ordem, palavra cumprida e cabeça no lugar. Quem representa o clube responde pelo que faz."],
  ["04", "APOIO", "Quando aperta, a primeira pergunta não é ‘de quem é o problema?’. É ‘como a gente resolve?’."]
];

const roadBenefits = [
  { icon: Wrench, title: "Oficina & pneu", text: "Manutenção, pneus, óleo, elétrica e reparos em parceiros credenciados." },
  { icon: MapPinned, title: "Parceiros da estrada", text: "Postos, alimentação, peças, lavagem e pontos de apoio reunidos no mesmo ecossistema." },
  { icon: Siren, title: "Rede de apoio", text: "SOS e canais do clube acessíveis dentro da sede digital do associado." }
];

export function HomePage() {
  const [club, setClub] = useState(FALLBACK);

  useEffect(() => {
    api("/api/club/home")
      .then((data) => setClub({
        profile: data.profile || FALLBACK.profile,
        officers: data.officers || [],
        events: data.events || [],
        posts: data.posts || [],
        chapters: data.chapters || [],
        media: data.media || []
      }))
      .catch(() => setClub(FALLBACK));
  }, []);

  const profile = club.profile || FALLBACK.profile;
  const heroImage = profile.heroImageUrl || PHOTOS.hero;

  return (
    <main className="mc-site min-h-screen text-[#eee2ce]">
      <header className="mc-topbar sticky top-0 z-40">
        <div className="mc-header-inner mx-auto flex max-w-[1380px] items-center justify-between gap-4 px-4 md:px-7">
          <a href="#inicio" className="mc-brand-lockup">
            <div className="mc-header-crest"><BrandCrest active compact /></div>
            <div className="mc-brand-copy"><p className="mc-brand-small">MOTOCLUBE</p><p className="mc-brand-name">{profile.nome}</p><small>{profile.cidade}{profile.estado ? ` • ${profile.estado}` : ""}</small></div>
          </a>
          <nav className="mc-desktop-nav" aria-label="Navegação institucional">
            <a href="#historia">História</a>
            <a href="#comando">Comando</a>
            <a href="#agenda">Agenda</a>
            <a href="#presenca">Núcleos</a>
            <a href="#galeria">Galeria</a>
            <a href="#diario">Notícias</a>
          </nav>
          <div className="flex items-center gap-2"><Link to="/login" className="mc-login-link">Área do associado</Link><Link to="/cadastro" className="mc-header-cta">Chegar junto</Link></div>
        </div>
      </header>

      <section id="inicio" className="mc-hero">
        <img src={heroImage} alt="Motociclistas reunidos na estrada" className="mc-hero-photo" fetchPriority="high" />
        <div className="mc-hero-overlay" /><div className="mc-hero-grain" /><div className="mc-hero-ghost">MOTOCLUBE</div>
        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-82px)] max-w-[1380px] items-center gap-8 px-4 py-12 md:grid-cols-[.68fr_1.32fr] md:px-7">
          <div className="order-2 md:order-1">
            <div className="mc-hero-emblem"><BrandCrest active size="large" /><div className="mc-emblem-rocker mc-emblem-rocker-top">{profile.nome.toUpperCase()}</div><div className="mc-emblem-rocker mc-emblem-rocker-bottom">{profile.estado || "BRASIL"} • {profile.sigla || "MC"}</div></div>
          </div>
          <div className="order-1 max-w-4xl md:order-2 md:justify-self-end">
            <p className="mc-eyebrow"><Bike className="h-4 w-4" /> RESPEITO • IRMANDADE • ESTRADA</p>
            <h1 className="mc-hero-title">{profile.headline.split(".")[0] || "A ESTRADA NOS UNE"}.<br /><span>O RESTO A GENTE CONSTRÓI JUNTO.</span></h1>
            <p className="mc-hero-copy">A gente se encontra na estrada, se reconhece pelo escudo e usa a sede digital só para facilitar o que já acontece fora da tela.</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/cadastro" className="mc-primary-button">QUERO CONHECER O CLUBE <ArrowRight className="h-4 w-4" /></Link><a href="#historia" className="mc-outline-button">VER NOSSA HISTÓRIA</a></div>
            <div className="mc-hero-note"><span>{profile.cidade}{profile.estado ? ` • ${profile.estado}` : ""}</span><p>Sem pose. Sem pressa. Primeiro a convivência, depois o colete.</p></div>
          </div>
        </div>
        <div className="mc-hero-strip"><div><ShieldCheck /> Escudo e identidade</div><div><Handshake /> Irmandade</div><div><Route /> Núcleos e encontros</div><div><Siren /> Rede de apoio</div></div>
      </section>

      <ClubDivider label="NOSSA HISTÓRIA" />

      <section id="historia" className="mc-section mc-section-dark mc-history-section">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 md:grid-cols-[1.08fr_.92fr] md:items-center md:px-7">
          <div className="mc-history-photo"><img src={PHOTOS.road} alt="Grupo de motociclistas na estrada" loading="lazy" /><div className="mc-history-stamp">DESDE<br />{profile.foundedYear || "—"}</div><span className="mc-photo-caption-human">registro de estrada • arquivo do clube</span></div>
          <div>
            <SectionHeading eyebrow="O MOTOCLUBE" title="A GENTE NÃO INVENTA HISTÓRIA. A GENTE ACUMULA QUILÔMETROS." />
            <p className="mc-lead">{profile.historia}</p>
            <blockquote className="mc-history-manifesto">{profile.manifesto}</blockquote>
            <div className="mc-history-meta"><span><MapPin /> {profile.cidade}{profile.estado ? ` • ${profile.estado}` : ""}</span><span><Crown /> {profile.sigla || "MC"}</span></div>
          </div>
        </div>
      </section>

      <section id="principios" className="mc-section mc-principles-section mc-principles-human">
        <div className="mx-auto max-w-[1320px] px-4 md:px-7">
          <div className="mc-principles-editorial">
            <div className="mc-principles-intro">
              <p className="mc-section-eyebrow">NOSSA BASE</p>
              <h2>O QUE A GENTE LEVA<br /><span>ANTES DE LIGAR A MOTO.</span></h2>
              <p>Não é slogan para preencher página. É o combinado que precisa funcionar quando ninguém está olhando.</p>
              <div className="mc-margin-note"><b>NOTA DE ESTRADA</b><span>“O escudo só faz sentido quando quem veste faz por merecer.”</span><small>— regra simples da casa</small></div>
            </div>
            <div className="mc-principles-rail">
              {principles.map(([number, title, text], index) => <article key={number} className={`mc-principle-card mc-principle-human p-${index + 1}`}><span className="mc-principle-number">{number}</span><div><h3>{title}</h3><p>{text}</p></div></article>)}
            </div>
          </div>
        </div>
      </section>

      <ClubDivider label="COMANDO & RESPONSABILIDADE" />

      <section id="comando" className="mc-section mc-command-section">
        <div className="mx-auto max-w-[1320px] px-4 md:px-7">
          <div className="mc-command-heading"><SectionHeading eyebrow="QUEM CONDUZ" title="QUEM PUXA A FILA TAMBÉM RESPONDE POR ELA." /><p>Nome, função e presença. Sem cargo decorativo: quem está no comando precisa ser encontrado quando o clube precisa.</p></div>
          <div className="mc-command-grid">
            {(club.officers.length ? club.officers : fallbackOfficers()).map((officer) => <article key={officer._id || officer.cargo} className="mc-officer-card">
              <div className="mc-officer-photo">{officer.photoUrl ? <img src={officer.photoUrl} alt={officer.apelidoEstrada || officer.nome} loading="lazy" /> : <BrandCrest active compact />}</div>
              <div className="mc-officer-copy"><p>{officer.cargo}</p><h3>{officer.apelidoEstrada || officer.nome}</h3><span>{officer.patente || "Diretoria"}</span><small>{officer.bio || "Responsável por representar a Diretoria e manter o clube organizado."}</small></div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="agenda" className="mc-section mc-agenda-section">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 md:grid-cols-[.72fr_1.28fr] md:px-7">
          <div><SectionHeading eyebrow="AGENDA DE ESTRADA" title="PRÓXIMA SAÍDA TEM HORA, PONTO E ROTA." /><p className="mc-body-copy">Nada de agenda só para enfeitar site. Aqui entram os encontros que realmente precisam de presença, briefing e ponto de encontro.</p></div>
          <div className="mc-event-list">{(club.events.length ? club.events : fallbackEvents()).slice(0, 5).map((event) => <article key={event._id || event.titulo} className="mc-event-row"><div className="mc-event-date"><strong>{datePart(event.data, "day")}</strong><span>{datePart(event.data, "month")}</span></div><div className="mc-event-copy"><p>{event.tipo || "encontro"}</p><h3>{event.titulo}</h3><span><Clock3 /> {formatDateTime(event.data)}</span><span><MapPin /> {[event.local, event.cidade].filter(Boolean).join(" • ") || "Local a definir"}</span><small>{event.descricao}</small></div>{event.destaque && <b>NA AGENDA</b>}</article>)}</div>
        </div>
      </section>

      <ClubDivider label="PRESENÇA NA ESTRADA" />
      <ClubPresenceSection chapters={club.chapters} />

      <ClubMediaGallery media={club.media} />

      <section id="diario" className="mc-section mc-news-section">
        <div className="mx-auto max-w-[1320px] px-4 md:px-7">
          <div className="mc-news-heading"><SectionHeading eyebrow="DIÁRIO DE ESTRADA" title="O QUE FICOU DA ÚLTIMA ROTA. O QUE VEM AGORA." /><p>Relatos, avisos, fotos e histórias publicadas pela própria Diretoria. Menos texto institucional; mais memória do que realmente aconteceu.</p></div>
          <div className="mc-news-grid">{(club.posts.length ? club.posts : fallbackPosts()).slice(0, 6).map((post, index) => <article key={post._id || post.titulo} className={index === 0 ? "mc-news-card is-featured" : "mc-news-card"}>{post.imageUrl && <img src={post.imageUrl} alt="" loading="lazy" />}<div><p>{post.categoria || "notícia"} • {formatDate(post.publishedAt)}</p><h3>{post.titulo}</h3><span>{post.resumo}</span>{post.destaque && <b>EM DESTAQUE</b>}</div></article>)}</div>
        </div>
      </section>

      <ClubDivider label="A SEDE DIGITAL" />

      <section id="beneficios" className="mc-section mc-digital-section">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-4 md:grid-cols-[.9fr_1.1fr] md:items-center md:px-7">
          <div className="mc-digital-crest-panel"><div className="mc-digital-patch"><div className="mc-patch-rocker">{profile.nome.toUpperCase()}</div><BrandCrest active size="large" /><p className="mc-card-kicker">ESCUDO DIGITAL DO ASSOCIADO</p><h3>FALCÃO</h3><p className="mc-digital-rank">ESCUDADO</p><div className="mc-digital-status"><BadgeCheck className="h-4 w-4" /> ESCUDO LIBERADO</div></div></div>
          <div><SectionHeading eyebrow="CLUBE DE BENEFÍCIOS" title="O CLUBE CABE NO CELULAR. MAS NÃO NASCEU LÁ." /><p className="mc-body-copy">QR, benefícios, agenda, documentos, garagem e avisos ficam no bolso. O vínculo continua sendo construído no encontro, na rota e na convivência.</p><div className="mt-7 grid gap-3">{roadBenefits.map(({ icon: Icon, title, text }) => <div key={title} className="mc-benefit-line"><Icon /><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><Link to="/login" className="mc-text-link mt-7">ABRIR MINHA SEDE DIGITAL <ChevronRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="mc-closing-section"><div /><div className="relative z-10 mx-auto max-w-[960px] px-4 py-20 md:py-24"><div className="mc-closing-lockup"><div className="w-32"><BrandCrest active compact /></div><div><p className="mc-section-eyebrow">IRMÃOS DO ASFALTO</p><h2>SE A IDEIA É RODAR JUNTO, A CONVERSA COMEÇA AQUI.</h2><p>Conheça o clube, apareça nos encontros e entenda o que o escudo representa antes de pedir para vestir.</p><Link to="/cadastro" className="mc-primary-button mt-6">QUERO CONHECER O CLUBE <ArrowRight className="h-4 w-4" /></Link></div></div></div></section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, center = false }) {
  return <div className={center ? "text-center" : ""}><p className="mc-section-eyebrow">{eyebrow}</p><h2 className="mc-section-title">{title}</h2></div>;
}

function ClubDivider({ label }) {
  return <div className="mc-divider"><span /><strong>{label}</strong><span /></div>;
}

function datePart(value, part) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return part === "day" ? "--" : "---";
  return part === "day" ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit" }).format(date) : new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "").toUpperCase();
}

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data a definir";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

function fallbackOfficers() {
  return [
    { cargo: "Presidência", apelidoEstrada: "Comandante", patente: "Diretoria", bio: "Direção institucional do motoclube." },
    { cargo: "Direção de Estrada", apelidoEstrada: "Estradeiro", patente: "Diretoria", bio: "Organização de rotas e encontros." },
    { cargo: "Relações e Apoio", apelidoEstrada: "Guardião", patente: "Diretoria", bio: "Integração de associados e parceiros." }
  ];
}

function fallbackEvents() {
  return [
    { titulo: "Encontro da Irmandade", tipo: "encontro", data: new Date(Date.now() + 14 * 86400000).toISOString(), cidade: "São Paulo", descricao: "Integração dos membros e alinhamento da agenda do clube.", destaque: true },
    { titulo: "Bate e volta da serra", tipo: "rota", data: new Date(Date.now() + 28 * 86400000).toISOString(), cidade: "São Paulo", descricao: "Rota organizada com briefing e pontos de parada." }
  ];
}

function fallbackPosts() {
  return [
    { titulo: "O escudo vem antes do benefício", categoria: "comunidade", resumo: "Antes do desconto, vem a convivência. Antes do QR, vem o compromisso com quem roda ao lado.", imageUrl: PHOTOS.hero, publishedAt: new Date().toISOString(), destaque: true },
    { titulo: "Antes de sair: cinco minutos na moto", categoria: "manutencao", resumo: "Pneu, corrente, luz e combustível. O básico que evita parar a turma inteira no acostamento.", imageUrl: PHOTOS.rain, publishedAt: new Date().toISOString() },
    { titulo: "O que ficou da última estrada", categoria: "rota", resumo: "Fotos, histórias e pequenos detalhes que só quem estava lá lembra.", imageUrl: PHOTOS.road, publishedAt: new Date().toISOString() }
  ];
}