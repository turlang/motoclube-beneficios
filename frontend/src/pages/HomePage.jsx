import {
  ArrowRight,
  BadgeCheck,
  Bike,
  CalendarDays,
  ChevronRight,
  Crown,
  Handshake,
  HeartHandshake,
  Images,
  MapPinned,
  Route,
  ShieldCheck,
  Siren,
  UsersRound,
  Wrench
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandCrest } from "../components/BrandCrest.jsx";

const photos = {
  hero: "https://images.pexels.com/photos/9789339/pexels-photo-9789339.jpeg?auto=compress&cs=tinysrgb&w=2200",
  rain: "https://images.pexels.com/photos/5195487/pexels-photo-5195487.jpeg?auto=compress&cs=tinysrgb&w=1400",
  road: "https://images.pexels.com/photos/12202235/pexels-photo-12202235.jpeg?auto=compress&cs=tinysrgb&w=1400",
  urban: "https://images.pexels.com/photos/9789338/pexels-photo-9789338.jpeg?auto=compress&cs=tinysrgb&w=1400",
  ruins: "https://images.pexels.com/photos/5192889/pexels-photo-5192889.jpeg?auto=compress&cs=tinysrgb&w=1400"
};

const principles = [
  { number: "01", title: "Respeito", text: "O escudo começa na forma como cada irmão trata o outro, o parceiro e quem divide a estrada conosco." },
  { number: "02", title: "Irmandade", text: "Pertencer significa estar presente. O clube existe para fortalecer vínculos, apoio e convivência." },
  { number: "03", title: "Responsabilidade", text: "A estrada exige consciência. Organização, compromisso e segurança fazem parte da nossa identidade." },
  { number: "04", title: "Apoio", text: "Benefícios, parceiros e SOS são ferramentas para tornar a rotina sobre duas rodas menos solitária." }
];

const ranks = [
  { rank: "Próspero", text: "Entrada no clube, convivência e conhecimento da cultura da irmandade." },
  { rank: "Meio-Escudo", text: "Etapa de integração e participação ativa na vida do motoclube." },
  { rank: "Escudado", text: "Membro consolidado, com identidade e benefícios plenamente liberados." },
  { rank: "Diretoria", text: "Responsável por organização, regras, parceiros, associados e direção do clube." }
];

const roadBenefits = [
  { icon: Wrench, title: "Oficina & pneu", text: "Descontos em manutenção, pneus, óleo, elétrica e reparos que fazem diferença na rotina." },
  { icon: MapPinned, title: "Parceiros da estrada", text: "Postos, alimentação, peças, lavagem e pontos de apoio reunidos no mesmo ecossistema." },
  { icon: Siren, title: "Rede de apoio", text: "SOS e canais do clube acessíveis no mesmo ambiente do associado." }
];

const journal = [
  { icon: Route, kicker: "Rotas", title: "A estrada também conta histórias", text: "Roteiros, pontos de encontro e experiências compartilhadas pela irmandade." },
  { icon: CalendarDays, kicker: "Agenda", title: "Encontros e ações do clube", text: "Bate e volta, encontros e ações sociais organizados pela Diretoria." },
  { icon: UsersRound, kicker: "Irmãos", title: "Quem veste o escudo", text: "Perfis, histórias, motos e trajetórias de quem constrói a identidade do clube." },
  { icon: HeartHandshake, kicker: "Comunidade", title: "Ação que ultrapassa o asfalto", text: "O clube também é apoio, responsabilidade social e presença na comunidade." }
];

export function HomePage() {
  return (
    <main className="mc-site min-h-screen text-[#eee2ce]">
      <header className="mc-topbar sticky top-0 z-40">
        <div className="mx-auto flex h-[78px] max-w-[1480px] items-center justify-between gap-4 px-4 md:px-7">
          <a href="#inicio" className="flex items-center gap-3">
            <div className="mc-header-crest"><BrandCrest active compact /></div>
            <div className="leading-none">
              <p className="mc-brand-small">MOTOCLUBE</p>
              <p className="mc-brand-name">IRMÃOS DO ASFALTO</p>
            </div>
          </a>

          <nav className="mc-desktop-nav" aria-label="Navegação institucional">
            <a href="#clube">O Clube</a>
            <a href="#principios">Princípios</a>
            <a href="#comando">Patentes</a>
            <a href="#estrada">Estrada</a>
            <a href="#beneficios">Benefícios</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="mc-login-link">Área do associado</Link>
            <Link to="/cadastro" className="mc-header-cta">Fazer parte</Link>
            <details className="mc-mobile-menu md:hidden">
              <summary aria-label="Abrir menu">MENU</summary>
              <div>
                <a href="#clube">O Clube</a>
                <a href="#principios">Princípios</a>
                <a href="#comando">Patentes</a>
                <a href="#estrada">Estrada</a>
                <a href="#beneficios">Benefícios</a>
                <Link to="/parceiro">Portal do parceiro</Link>
              </div>
            </details>
          </div>
        </div>
      </header>

      <section id="inicio" className="mc-hero">
        <img
          src={photos.hero}
          alt="Grupo de motociclistas seguindo junto por uma estrada"
          className="mc-hero-photo"
          fetchPriority="high"
        />
        <div className="mc-hero-overlay" />
        <div className="mc-hero-grain" />
        <div className="mc-hero-ghost">MOTOCLUBE</div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-78px)] max-w-[1480px] items-center gap-8 px-4 py-14 md:grid-cols-[.72fr_1.28fr] md:px-7">
          <div className="order-2 md:order-1">
            <div className="mc-hero-emblem">
              <BrandCrest active size="large" />
              <div className="mc-emblem-rocker mc-emblem-rocker-top">IRMÃOS DO ASFALTO</div>
              <div className="mc-emblem-rocker mc-emblem-rocker-bottom">BRASIL • MC</div>
            </div>
          </div>

          <div className="order-1 max-w-4xl md:order-2 md:justify-self-end">
            <p className="mc-eyebrow"><Bike className="h-4 w-4" /> RESPEITO • IRMANDADE • ESTRADA</p>
            <h1 className="mc-hero-title">A ESTRADA NOS UNE.<br /><span>O ESCUDO NOS REPRESENTA.</span></h1>
            <p className="mc-hero-copy">Uma irmandade feita para quem vive sobre duas rodas. Aqui, o clube vem primeiro: identidade, convivência, hierarquia, estrada e apoio. O sistema digital existe para fortalecer tudo isso.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastro" className="mc-primary-button">QUERO FAZER PARTE <ArrowRight className="h-4 w-4" /></Link>
              <a href="#clube" className="mc-outline-button">CONHEÇA O MOTOCLUBE</a>
            </div>
          </div>
        </div>

        <div className="mc-hero-strip">
          <div><ShieldCheck /> Escudo e identidade</div>
          <div><Handshake /> Irmandade e parceiros</div>
          <div><Route /> Rotas e encontros</div>
          <div><Siren /> Rede de apoio</div>
        </div>
      </section>

      <ClubDivider label="NOSSA ESTRADA" />

      <section id="clube" className="mc-section mc-section-dark">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-4 md:grid-cols-[1.02fr_.98fr] md:items-center md:px-7">
          <div className="mc-photo-stack">
            <img src={photos.road} alt="Motociclistas rodando juntos em uma estrada" loading="lazy" />
            <div className="mc-photo-stamp">IRMÃOS<br />DO ASFALTO</div>
            <div className="mc-photo-caption">NA ESTRADA, LADO A LADO.</div>
          </div>

          <div>
            <SectionHeading eyebrow="O MOTOCLUBE" title="MAIS QUE UM BENEFÍCIO. UMA IDENTIDADE." />
            <p className="mc-lead">O Irmãos do Asfalto nasce para reunir motociclistas em torno de algo maior do que descontos: respeito, convivência, apoio e orgulho de pertencer.</p>
            <p className="mc-body-copy">O Escudo Digital, os parceiros e a área do associado são extensões da vida do clube. A proposta é que cada membro carregue no celular a mesma ideia que carregaria no colete: pertencimento, responsabilidade e reconhecimento dentro da irmandade.</p>
            <div className="mc-values-line">
              <span>HONRA</span><i /><span>RESPEITO</span><i /><span>IRMANDADE</span>
            </div>
            <Link to="/cadastro" className="mc-text-link">ENTRAR PARA A IRMANDADE <ChevronRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <section id="principios" className="mc-section mc-principles-section">
        <div className="mx-auto max-w-[1380px] px-4 md:px-7">
          <SectionHeading eyebrow="NOSSA BASE" title="QUATRO PRINCÍPIOS. UM SÓ ESCUDO." center />
          <div className="mc-principles-grid">
            {principles.map((item) => (
              <article key={item.number} className="mc-principle-card">
                <span className="mc-principle-number">{item.number}</span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ClubDivider label="HIERARQUIA & COMPROMISSO" />

      <section id="comando" className="mc-section mc-ranks-section">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-4 md:grid-cols-[.72fr_1.28fr] md:items-start md:px-7">
          <div className="mc-rank-intro">
            <Crown className="h-9 w-9" />
            <SectionHeading eyebrow="PATENTES" title="O ESCUDO É CONSTRUÍDO NA CAMINHADA." />
            <p className="mc-body-copy">A progressão dentro do clube não é tratada como gamificação. Ela representa integração, confiança, participação e responsabilidade na irmandade.</p>
          </div>
          <div className="mc-rank-list">
            {ranks.map((item, index) => (
              <div key={item.rank} className="mc-rank-row">
                <span className="mc-rank-index">0{index + 1}</span>
                <div>
                  <h3>{item.rank}</h3>
                  <p>{item.text}</p>
                </div>
                <BrandCrest active={index >= 2} compact />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="estrada" className="mc-gallery-section">
        <div className="mx-auto max-w-[1480px] px-4 py-16 md:px-7 md:py-24">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <SectionHeading eyebrow="VIDA NA ESTRADA" title="O MOTOCLUBE PRECISA SER VISTO, NÃO EXPLICADO." />
            <p className="max-w-md text-sm leading-7 text-[#938b7e]">Fotos, encontros, chuva, estrada, máquinas e pessoas. A identidade visual do clube passa a viver também pela imagem.</p>
          </div>

          <div className="mc-gallery-grid">
            <figure className="mc-gallery-wide"><img src={photos.rain} alt="Motociclistas rodando na chuva" loading="lazy" /><figcaption>FAÇA CHUVA OU FAÇA SOL</figcaption></figure>
            <figure><img src={photos.road} alt="Motociclistas viajando juntos" loading="lazy" /><figcaption>ESTRADA & IRMANDADE</figcaption></figure>
            <figure><img src={photos.urban} alt="Comboio de motociclistas em via urbana" loading="lazy" /><figcaption>JUNTOS NA ROTA</figcaption></figure>
            <figure className="mc-gallery-wide"><img src={photos.ruins} alt="Motociclistas em cenário urbano" loading="lazy" /><figcaption>DUAS RODAS. UMA IDENTIDADE.</figcaption></figure>
          </div>
        </div>
      </section>

      <section className="mc-section mc-journal-section">
        <div className="mx-auto max-w-[1380px] px-4 md:px-7">
          <div className="flex items-end justify-between gap-4">
            <SectionHeading eyebrow="DIÁRIO DE ESTRADA" title="O CLUBE CONTINUA DEPOIS QUE A MOTO PARA." />
            <Images className="hidden h-10 w-10 text-[#cb5a25] md:block" />
          </div>
          <div className="mc-journal-grid">
            {journal.map(({ icon: Icon, kicker, title, text }) => (
              <article key={title} className="mc-journal-card">
                <Icon className="h-7 w-7" />
                <p className="mc-card-kicker">{kicker}</p>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <ClubDivider label="A SEDE DIGITAL" />

      <section id="beneficios" className="mc-section mc-digital-section">
        <div className="mx-auto grid max-w-[1380px] gap-10 px-4 md:grid-cols-[.92fr_1.08fr] md:items-center md:px-7">
          <div className="mc-digital-crest-panel">
            <div className="mc-digital-patch">
              <div className="mc-patch-rocker">IRMÃOS DO ASFALTO</div>
              <BrandCrest active size="large" />
              <p className="mc-card-kicker">ESCUDO DIGITAL DO ASSOCIADO</p>
              <h3>FALCÃO</h3>
              <p className="mc-digital-rank">ESCUDADO</p>
              <div className="mc-digital-status"><BadgeCheck className="h-4 w-4" /> ESCUDO LIBERADO</div>
              <div className="mc-values-line"><span>HONRA</span><i /><span>RESPEITO</span><i /><span>IRMANDADE</span></div>
            </div>
          </div>

          <div>
            <SectionHeading eyebrow="CLUBE DE BENEFÍCIOS" title="TECNOLOGIA A SERVIÇO DO ESCUDO — NÃO O CONTRÁRIO." />
            <p className="mc-lead">A área digital existe para tornar o clube útil todos os dias: identidade verificável, benefícios de rota, parceiros, assinatura e acesso rápido aos canais de apoio.</p>
            <div className="mc-benefit-list">
              {roadBenefits.map(({ icon: Icon, title, text }) => (
                <div key={title} className="mc-benefit-row">
                  <div><Icon className="h-6 w-6" /></div>
                  <span><strong>{title}</strong><small>{text}</small></span>
                </div>
              ))}
            </div>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="mc-primary-button">ABRIR MEU ESCUDO <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/parceiro" className="mc-outline-button">PORTAL DO PARCEIRO</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mc-final-cta">
        <img src={photos.hero} alt="" aria-hidden="true" loading="lazy" />
        <div className="mc-final-overlay" />
        <div className="relative z-10 mx-auto flex min-h-[460px] max-w-[1380px] flex-col items-center justify-center px-4 py-16 text-center md:px-7">
          <BrandCrest active size="large" />
          <p className="mc-eyebrow mt-3">SEU LUGAR NA IRMANDADE</p>
          <h2>NÃO É SOBRE CHEGAR PRIMEIRO.<br /><span>É SOBRE NÃO RODAR SOZINHO.</span></h2>
          <Link to="/cadastro" className="mc-primary-button mt-7">FAZER PARTE DO CLUBE <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="mc-footer">
        <div className="mx-auto grid max-w-[1380px] gap-8 px-4 py-12 md:grid-cols-[1.2fr_.8fr_.8fr] md:px-7">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 shrink-0"><BrandCrest active compact /></div>
            <div><p className="mc-brand-small">MOTOCLUBE</p><p className="mc-brand-name text-xl">IRMÃOS DO ASFALTO</p><p className="mt-2 max-w-sm text-sm leading-6 text-[#716b62]">Respeito, irmandade, estrada e uma rede de apoio para quem vive sobre duas rodas.</p></div>
          </div>
          <div><p className="mc-footer-title">MOTOCLUBE</p><a href="#clube">O Clube</a><a href="#principios">Princípios</a><a href="#comando">Patentes</a><a href="#estrada">Estrada</a></div>
          <div><p className="mc-footer-title">PORTAIS</p><Link to="/login">Associado</Link><Link to="/cadastro">Cadastro</Link><Link to="/parceiro">Parceiro</Link></div>
        </div>
        <div className="mc-footer-bottom">IRMÃOS DO ASFALTO • HONRA • RESPEITO • IRMANDADE</div>
      </footer>
    </main>
  );
}

function SectionHeading({ eyebrow, title, center = false }) {
  return (
    <div className={center ? "text-center" : ""}>
      <p className="mc-section-eyebrow">{eyebrow}</p>
      <h2 className={`mc-section-title ${center ? "mx-auto" : ""}`}>{title}</h2>
    </div>
  );
}

function ClubDivider({ label }) {
  return (
    <div className="mc-divider" aria-hidden="true">
      <span />
      <b>{label}</b>
      <i><BrandCrest active compact /></i>
      <span />
    </div>
  );
}
