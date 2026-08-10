import {
  ArrowRight,
  BadgeCheck,
  Bike,
  CalendarDays,
  Handshake,
  MapPinned,
  Route,
  ScanLine,
  ShieldCheck,
  Siren,
  Sparkles,
  UsersRound,
  Wrench
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandCrest } from "../components/BrandCrest.jsx";

const roadBenefits = [
  { icon: Wrench, title: "Oficinas e borracharias", text: "Desconto onde o motoboy realmente para: pneus, corrente, óleo, elétrica e reparos rápidos." },
  { icon: MapPinned, title: "Parceiros da estrada", text: "Postos, alimentação, lavagem, peças e serviços credenciados na sua rota." },
  { icon: Siren, title: "Rede de apoio", text: "SOS e canais de apoio pensados para quem depende da moto todos os dias." }
];

const clubLife = [
  { icon: Route, kicker: "Resenha de rotas", title: "Estradas que valem a jornada", text: "Roteiros, pontos de parada e experiências compartilhadas pela irmandade." },
  { icon: CalendarDays, kicker: "Agenda", title: "Bate e volta, encontros e ações", text: "Calendário do clube, encontros e ações solidárias em um só lugar." },
  { icon: UsersRound, kicker: "Irmãos de estrada", title: "Histórias por trás dos coletes", text: "Perfis de membros, suas motos, jornadas e histórias dentro do motoclube." },
  { icon: Sparkles, kicker: "Oficina", title: "Cuidado antes de pegar a pista", text: "Conteúdo rápido sobre manutenção, calibragem, chuva e preparação da moto." }
];

export function HomePage() {
  return (
    <main className="club-page min-h-screen text-[#f2e5cf]">
      <header className="club-header sticky top-0 z-30 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-14 w-14"><BrandCrest active compact /></div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.42em] text-[#d96b1f]">Motoclube</p>
              <p className="club-display text-sm uppercase text-[#f2e5cf]">Irmãos do Asfalto</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/parceiro" className="hidden rounded-sm border border-[#7d7a70]/35 bg-black/40 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#b8b1a3] sm:inline-flex">Área do parceiro</Link>
            <Link to="/login" className="club-cta px-5 py-3 text-[10px]">Entrar no clube</Link>
          </div>
        </div>
      </header>

      <section className="club-hero relative overflow-hidden border-b border-[#d96b1f]/20">
        <img src="/motoclube-hero.svg" alt="Motociclistas reunidos em uma estrada ao pôr do sol" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,3,3,.96)_0%,rgba(3,3,3,.78)_42%,rgba(3,3,3,.24)_72%,rgba(3,3,3,.62)_100%)]" />
        <div className="absolute inset-0 club-grain" />

        <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-10 px-4 py-20 md:grid-cols-[1.08fr_.92fr]">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-[#d96b1f]/40 bg-[#0b0908]/80 px-4 py-2 text-[10px] font-black uppercase tracking-[0.32em] text-[#e38a48] backdrop-blur-sm">
              <Bike className="h-4 w-4" /> liberdade • respeito • irmandade
            </div>
            <p className="mt-7 text-xs font-black uppercase tracking-[0.42em] text-[#8e887c]">O asfalto nos apresenta. A estrada nos une.</p>
            <h1 className="club-display mt-4 max-w-3xl text-5xl uppercase leading-[.87] text-[#f2e5cf] sm:text-6xl md:text-8xl">
              Irmandade além do <span className="club-flame-text">asfalto.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-[#b8b1a3] md:text-lg">
              Um clube de benefícios com alma de motoclube: escudo digital, parceiros de estrada, apoio para a rotina e uma comunidade construída sobre respeito, união e paixão por duas rodas.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastro" className="club-cta inline-flex h-14 items-center justify-center gap-3 px-7 text-xs">Vestir o escudo <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/login" className="club-secondary inline-flex h-14 items-center justify-center px-7 text-xs">Abrir meu escudo digital</Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-black uppercase tracking-[0.22em] text-[#8e887c]">
              <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#d96b1f]" /> Escudo verificado</span>
              <span className="inline-flex items-center gap-2"><Handshake className="h-4 w-4 text-[#d96b1f]" /> Parceiros credenciados</span>
              <span className="inline-flex items-center gap-2"><MapPinned className="h-4 w-4 text-[#d96b1f]" /> Benefícios de rota</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md md:justify-self-end">
            <div className="club-patch-showcase leather-panel relative overflow-hidden p-5">
              <div className="club-rivet left-4 top-4" /><div className="club-rivet right-4 top-4" /><div className="club-rivet bottom-4 left-4" /><div className="club-rivet bottom-4 right-4" />
              <div className="club-rocker mx-auto">IRMÃOS DO ASFALTO</div>
              <div className="mt-2 flex justify-center"><BrandCrest active size="large" /></div>
              <div className="text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#8e887c]">Escudo digital do associado</p>
                <p className="club-display mt-2 text-3xl uppercase text-[#f2e5cf]">Falcão</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.26em] text-[#e38a48]">Patente • Escudado</p>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2">
                <MiniBadge label="Moto" value="CG 160 Titan" />
                <MiniBadge label="Placa" value="ABC1D23" />
              </div>
              <div className="mt-3 border border-emerald-500/25 bg-emerald-500/10 p-3 text-center">
                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-300"><BadgeCheck className="h-4 w-4" /> Escudo liberado</div>
              </div>
              <div className="club-motto mt-5">HONRA <span /> RESPEITO <span /> IRMANDADE</div>
            </div>
          </div>
        </div>
      </section>

      <section className="club-manifesto border-b border-[#d96b1f]/15 px-4 py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[.7fr_1.3fr] md:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d96b1f]">Nosso manifesto</p>
            <h2 className="club-display mt-3 text-4xl uppercase leading-none text-[#f2e5cf] md:text-5xl">Respeito acima de tudo.</h2>
          </div>
          <blockquote className="border-l-2 border-[#d96b1f] pl-6 text-xl font-semibold leading-9 text-[#c9c1b2] md:text-2xl">
            “Não importa o destino, o que vale é a jornada.”
            <footer className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#7d776d]">Irmãos do Asfalto • lado a lado na estrada da vida</footer>
          </blockquote>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="max-w-3xl">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#d96b1f]">Benefícios da rota</p>
          <h2 className="club-display mt-3 text-4xl uppercase leading-none text-[#f2e5cf] md:text-6xl">Vantagem para quem vive sobre duas rodas.</h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-[#8e887c] md:text-base">Nada de catálogo genérico. O clube prioriza serviços que fazem diferença no bolso e na rotina do motociclista.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {roadBenefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="club-metal-card group p-6">
              <div className="club-icon-plate"><Icon className="h-6 w-6" /></div>
              <h3 className="club-display mt-6 text-2xl uppercase text-[#f2e5cf]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#8e887c]">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="club-life border-y border-[#d96b1f]/15 px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#a11b1b]">Vida de motoclube</p>
            <h2 className="club-display mt-3 text-4xl uppercase leading-none text-[#f2e5cf] md:text-6xl">O clube continua depois que a moto para.</h2>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {clubLife.map(({ icon: Icon, kicker, title, text }, index) => (
              <article key={title} className="club-story-card relative overflow-hidden p-6 md:p-7">
                <span className="club-story-number">0{index + 1}</span>
                <div className="relative z-10 flex items-start gap-4">
                  <div className="club-icon-plate shrink-0"><Icon className="h-6 w-6" /></div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-[0.32em] text-[#d96b1f]">{kicker}</p>
                    <h3 className="club-display mt-2 text-2xl uppercase text-[#f2e5cf]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-[#8e887c]">{text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 md:py-24">
        <div className="club-callout mx-auto max-w-7xl overflow-hidden">
          <div className="grid gap-8 p-7 md:grid-cols-[1fr_auto] md:items-center md:p-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#e38a48]">Seu lugar na irmandade</p>
              <h2 className="club-display mt-3 max-w-3xl text-4xl uppercase leading-none text-[#f2e5cf] md:text-6xl">O vento no rosto. A liberdade no peito. Um escudo ao seu lado.</h2>
            </div>
            <Link to="/cadastro" className="club-cta inline-flex h-14 items-center justify-center gap-3 px-7 text-xs">Quero fazer parte <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#d96b1f]/15 px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-3"><div className="h-12 w-12"><BrandCrest active compact /></div><div><p className="club-display text-lg uppercase text-[#f2e5cf]">Irmãos do Asfalto</p><p className="text-[9px] font-black uppercase tracking-[0.28em] text-[#706b62]">Honra • Respeito • Irmandade</p></div></div>
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#5e5a53]">Na estrada, lado a lado.</p>
        </div>
      </footer>
    </main>
  );
}

function MiniBadge({ label, value }) {
  return <div className="border border-white/5 bg-black/40 p-3"><p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#6f6a62]">{label}</p><p className="mt-1 text-xs font-black uppercase text-[#ded5c6]">{value}</p></div>;
}
