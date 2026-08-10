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
  road: "https://images.pexels.com/photos/12202235/pexels-photo-12202235.jpeg?auto=compress&cs=tinysrgb&w=1400",
  urban: "https://images.pexels.com/photos/9789338/pexels-photo-9789338.jpeg?auto=compress&cs=tinysrgb&w=1400"
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
  ["01", "RESPEITO", "O escudo começa na forma como cada irmão trata o outro, o parceiro e quem divide a estrada conosco."],
  ["02", "IRMANDADE", "Pertencer significa estar presente. O clube existe para fortalecer vínculos, apoio e convivência."],
  ["03", "RESPONSABILIDADE", "Organização, consciência e compromisso fazem parte da identidade de quem representa o clube."],
  ["04", "APOIO", "Benefícios, parceiros e a sede digital existem para fortalecer a vida real da irmandade."]
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
        <div className="mx-auto flex h-[78px] max-w-[1480px] items-center justify-between gap-4 px-4 md:px-7">
          <a href="#inicio" className="flex items-center gap-3">
            <div className="mc-header-crest"><BrandCrest active compact /></div>
            <div className="leading-none"><p className="mc-brand-small">MOTOCLUBE</p><p className="mc-brand-name">{profile.nome}</p></div>
          </a>
          <nav className="mc-desktop-nav" aria-label="Navegação institucional">
            <a href="#historia">História</a>
            <a href="#comando">Comando</a>
            <a href="#agenda">Agenda</a>
            <a href="#presenca">Núcleos</a>
            <a href="#galeria">Galeria</a>
            <a href="#diario">Notícias</a>
          </nav>
          <div className="flex items-center gap-2"><Link to="/login" className="mc-login-link">Área do associado</Link><Link to="/cadastro" className="mc-header-cta">Fazer parte</Link></div>
        </div>
      </header>

      <section id="inicio" className="mc-hero">
        <img src={heroImage} alt="Motociclistas reunidos na estrada" className="mc-hero-photo" fetchPriority="high" />
        <div className="mc-hero-overlay" /><div className="mc-hero-grain" /><div className="mc-hero-ghost">MOTOCLUBE</div>
        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-78px)] max-w-[1480px] items-center gap-8 px-4 py-14 md:grid-cols-[.72fr_1.28fr] md:px-7">
          <div className="order-2 md:order-1">
            <div className="mc-hero-emblem"><BrandCrest active size="large" /><div className="mc-emblem-rocker mc-emblem-rocker-top">{profile.nome.toUpperCase()}</div><div className="mc-emblem-rocker mc-emblem-rocker-bottom">{profile.estado || "BRASIL"} • {profile.sigla || "MC"}</div></div>
          </div>
          <div className="order-1 max-w-4xl md:order-2 md:justify-self-end">
            <p className="mc-eyebrow"><Bike className="h-4 w-4" /> RESPEITO • IRMANDADE • ESTRADA</p>
            <h1 className="mc-hero-title">{profile.headline.split(".")[0] || "A ESTRADA NOS UNE"}.<br /><span>O CLUBE VIVE ALÉM DO ASFALTO.</span></h1>
            <p className="mc-hero-copy">Um motoclube com identidade, história, comando, encontros, presença territorial, memória visual e uma sede digital construída para fortalecer quem veste o mesmo escudo.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><Link to="/cadastro" className="mc-primary-button">QUERO FAZER PARTE <ArrowRight className="h-4 w-4" /></Link><a href="#historia" className="mc-outline-button">CONHEÇA NOSSA HISTÓRIA</a></div>
          </div>
        </div>
        <div className="mc-hero-strip"><div><ShieldCheck /> Escudo e identidade</div><div><Handshake /> Irmandade</div><div><Route /> Núcleos e encontros</div><div><Siren /> Rede de apoio</div></div>
      </section>

      <ClubDivider label="NOSSA HISTÓRIA" />

      <section id="historia" className="mc-section mc-section-dark mc-history-section">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-4 md:grid-cols-[1.05fr_.95fr] md:items-center md:px-7">
          <div className="mc-history-photo"><img src={PHOTOS.road} alt="Grupo de motociclistas na estrada" loading="lazy" /><div className="mc-history-stamp">DESDE<br />{profile.foundedYear || "—"}</div></div>
          <div>
            <SectionHeading eyebrow="O MOTOCLUBE" title="UMA HISTÓRIA QUE PRECISA SER VIVIDA, NÃO INVENTADA." />
            <p className="mc-lead">{profile.historia}</p>
            <blockquote className="mc-history-manifesto">{profile.manifesto}</blockquote>
            <div className="mc-history-meta"><span><MapPin /> {profile.cidade}{profile.estado ? ` • ${profile.estado}` : ""}</span><span><Crown /> {profile.sigla || "MC"}</span></div>
          </div>
        </div>
      </section>

      <section id="principios" className="mc-section mc-principles-section">
        <div className="mx-auto max-w-[1380px] px-4 md:px-7">
          <SectionHeading eyebrow="NOSSA BASE" title="QUATRO PRINCÍPIOS. UM SÓ ESCUDO." center />
          <div className="mc-principles-grid">{principles.map(([number, title, text]) => <article key={number} className="mc-principle-card"><span className="mc-principle-number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>

      <ClubDivider label="COMANDO & RESPONSABILIDADE" />

      <section id="comando" className="mc-section mc-command-section">
        <div className="mx-auto max-w-[1380px] px-4 md:px-7">
          <div className="mc-command-heading"><SectionHeading eyebrow="QUEM CONDUZ" title="O COMANDO REPRESENTA O ESCUDO." /><p>Uma estrutura clara dá rosto, responsabilidade e referência à irmandade.</p></div>
          <div className="mc-command-grid">
            {(club.officers.length ? club.officers : fallbackOfficers()).map((officer) => <article key={officer._id || officer.cargo} className="mc-officer-card">
              <div className="mc-officer-photo">{officer.photoUrl ? <img src={officer.photoUrl} alt={officer.apelidoEstrada || officer.nome} loading="lazy" /> : <BrandCrest active compact />}</div>
              <div className="mc-officer-copy"><p>{officer.cargo}</p><h3>{officer.apelidoEstrada || officer.nome}</h3><span>{officer.patente || "Diretoria"}</span><small>{officer.bio || "Representa a organização e o compromisso da Diretoria com a irmandade."}</small></div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="agenda" className="mc-section mc-agenda-section">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-4 md:grid-cols-[.78fr_1.22fr] md:px-7">
          <div><SectionHeading eyebrow="AGENDA DE ESTRADA" title="O CLUBE ACONTECE FORA DA TELA." /><p className="mc-body-copy">Encontros, rotas, reuniões e ações aparecem aqui a partir do painel da Diretoria. A sede digital organiza; a irmandade acontece no mundo real.</p></div>
          <div className="mc-event-list">{(club.events.length ? club.events : fallbackEvents()).slice(0, 5).map((event) => <article key={event._id || event.titulo} className="mc-event-row"><div className="mc-event-date"><strong>{datePart(event.data, "day")}</strong><span>{datePart(event.data, "month")}</span></div><div className="mc-event-copy"><p>{event.tipo || "encontro"}</p><h3>{event.titulo}</h3><span><Clock3 /> {formatDateTime(event.data)}</span><span><MapPin /> {[event.local, event.cidade].filter(Boolean).join(" • ") || "Local a definir"}</span><small>{event.descricao}</small></div>{event.destaque && <b>DESTAQUE</b>}</article>)}</div>
        </div>
      </section>

      <ClubDivider label="PRESENÇA NA ESTRADA" />
      <ClubPresenceSection chapters={club.chapters} />

      <ClubMediaGallery media={club.media} />

      <section id="diario" className="mc-section mc-news-section">
        <div className="mx-auto max-w-[1380px] px-4 md:px-7">
          <div className="mc-news-heading"><SectionHeading eyebrow="DIÁRIO DE ESTRADA" title="NOTÍCIAS, ROTAS E MEMÓRIA DO CLUBE." /><p>Conteúdo publicado pela Diretoria passa a alimentar esta área automaticamente.</p></div>
          <div className="mc-news-grid">{(club.posts.length ? club.posts : fallbackPosts()).slice(0, 6).map((post, index) => <article key={post._id || post.titulo} className={index === 0 ? "mc-news-card is-featured" : "mc-news-card"}>{post.imageUrl && <img src={post.imageUrl} alt="" loading="lazy" />}<div><p>{post.categoria || "notícia"} • {formatDate(post.publishedAt)}</p><h3>{post.titulo}</h3><span>{post.resumo}</span>{post.destaque && <b>EM DESTAQUE</b>}</div></article>)}</div>
        </div>
      </section>

      <ClubDivider label="A SEDE DIGITAL" />

      <section id="beneficios" className="mc-section mc-digital-section">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-4 md:grid-cols-[.92fr_1.08fr] md:items-center md:px-7">
          <div className="mc-digital-crest-panel"><div className="mc-digital-patch"><div className="mc-patch-rocker">{profile.nome.toUpperCase()}</div><BrandCrest active size="large" /><p className="mc-card-kicker">ESCUDO DIGITAL DO ASSOCIADO</p><h3>FALCÃO</h3><p className="mc-digital-rank">ESCUDADO</p><div className="mc-digital-status"><BadgeCheck className="h-4 w-4" /> ESCUDO LIBERADO</div></div></div>
          <div><SectionHeading eyebrow="CLUBE DE BENEFÍCIOS" title="A TECNOLOGIA SERVE AO MOTOCLUBE. NÃO O CONTRÁRIO." /><p className="mc-body-copy">O associado leva no celular sua identidade, QR rotativo, situação da assinatura, parceiros e acesso à rede de apoio. Tudo dentro da mesma cultura institucional.</p><div className="mt-7 grid gap-3">{roadBenefits.map(({ icon: Icon, title, text }) => <div key={title} className="mc-benefit-line"><Icon /><div><h3>{title}</h3><p>{text}</p></div></div>)}</div><Link to="/login" className="mc-text-link mt-7">ABRIR MINHA SEDE DIGITAL <ChevronRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="mc-closing-section"><img src={PHOTOS.urban} alt="Motociclistas reunidos" loading="lazy" /><div /><div className="relative z-10 mx-auto max-w-[1100px] px-4 py-24 text-center md:py-32"><div className="mx-auto w-40"><BrandCrest active compact /></div><p className="mc-section-eyebrow mt-2">IRMÃOS DO ASFALTO</p><h2>NA ESTRADA, LADO A LADO.</h2><p>Faça parte de um clube que coloca identidade, organização e apoio antes de qualquer vantagem comercial.</p><Link to="/cadastro" className="mc-primary-button mt-7">QUERO FAZER PARTE <ArrowRight className="h-4 w-4" /></Link></div></section>
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
    { titulo: "Por que o escudo vem antes do benefício", categoria: "comunidade", resumo: "Identidade, convivência e responsabilidade são a base da sede digital.", imageUrl: PHOTOS.hero, publishedAt: new Date().toISOString(), destaque: true },
    { titulo: "Checklist antes de sair para a rota", categoria: "manutencao", resumo: "Uma rotina preventiva simples ajuda a reduzir imprevistos.", imageUrl: PHOTOS.rain, publishedAt: new Date().toISOString() },
    { titulo: "Estrada, encontro e memória", categoria: "rota", resumo: "Cada encontro ajuda a construir a história do motoclube.", imageUrl: PHOTOS.road, publishedAt: new Date().toISOString() }
  ];
}
