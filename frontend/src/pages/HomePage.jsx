import {
  ArrowRight,
  BadgeCheck,
  Bike,
  Handshake,
  MapPinned,
  ScanLine,
  ShieldCheck,
  Siren,
  TicketPercent
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandCrest } from "../components/BrandCrest.jsx";
import { RoadBackdrop } from "../components/RoadBackdrop.jsx";

const benefits = [
  { icon: TicketPercent, title: "Benefícios de pista", text: "Postos, oficinas, pneus, lavagem, peças e serviços úteis no dia a dia." },
  { icon: ScanLine, title: "Escudo antifraude", text: "QR rotativo com validação rápida pelo parceiro comercial." },
  { icon: Siren, title: "Rede de apoio", text: "Área SOS preparada para conectar o associado à irmandade quando mais precisa." }
];

export function HomePage() {
  return (
    <main className="page-shell min-h-screen text-zinc-100">
      <header className="border-b border-amber-400/10 bg-black/75 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3">
            <div className="scale-[0.42] origin-left -mr-14 -my-9"><BrandCrest active compact /></div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.34em] text-amber-400">Motoclube</p>
              <p className="text-sm font-black uppercase text-white">Irmãos do Asfalto</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/parceiro" className="hidden rounded-xl border border-zinc-800 px-3 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 sm:inline-flex">Parceiro</Link>
            <Link to="/login" className="rounded-xl bg-amber-400 px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.18em] text-black">Entrar</Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-amber-400/10">
        <div className="absolute inset-0 opacity-80"><RoadBackdrop /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/55 to-[#070707]" />
        <div className="relative mx-auto grid min-h-[680px] max-w-6xl items-end gap-8 px-4 pb-12 pt-16 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pb-20 md:pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-black/55 px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-amber-300 backdrop-blur">
              <Bike className="h-4 w-4" /> Feito para quem vive sobre duas rodas
            </div>
            <p className="mt-6 text-xs font-black uppercase tracking-[0.4em] text-zinc-500">Na rua, um ajuda o outro</p>
            <h1 className="mt-3 max-w-xl text-5xl font-black uppercase leading-[0.9] text-white sm:text-6xl md:text-7xl">
              Irmandade que <span className="text-amber-400 neon-text">vira benefício.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 md:text-lg">
              Um clube de benefícios desenhado para motoboys: identidade digital, parceiros úteis, validação rápida e apoio para a rotina de quem mantém a cidade em movimento.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastro" className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-amber-400 px-6 text-xs font-black uppercase tracking-[0.2em] text-black shadow-[0_0_35px_rgba(251,191,36,0.16)]">
                Fazer parte <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex h-14 items-center justify-center rounded-2xl border border-zinc-700 bg-black/55 px-6 text-xs font-black uppercase tracking-[0.2em] text-zinc-200 backdrop-blur">
                Abrir meu escudo
              </Link>
            </div>
          </div>

          <div className="mx-auto w-full max-w-sm">
            <div className="hero-member-card relative overflow-hidden rounded-[2.4rem] p-5">
              <div className="warning-stripes absolute inset-x-0 top-0 h-2" />
              <div className="flex items-start justify-between pt-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Escudo digital</p>
                  <p className="mt-1 text-2xl font-black uppercase text-white">Falcão</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-amber-300">Escudado</p>
                </div>
                <span className="rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300">Ativo</span>
              </div>
              <div className="mt-1 flex justify-center"><BrandCrest active size="large" /></div>
              <div className="grid grid-cols-2 gap-2">
                <MiniBadge label="Moto" value="CG 160 Titan" />
                <MiniBadge label="Placa" value="ABC1D23" />
              </div>
              <div className="mt-3 rounded-2xl border border-amber-400/15 bg-black/45 p-3 text-center">
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-600">Escudo verificado em tempo real</p>
                <div className="mt-2 flex items-center justify-center gap-2 text-xs font-black uppercase text-emerald-300"><BadgeCheck className="h-4 w-4" /> Benefícios liberados</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:py-20">
        <div className="max-w-2xl">
          <p className="text-[10px] font-black uppercase tracking-[0.36em] text-amber-400">Estrutura de rua</p>
          <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-white md:text-4xl">Não é um cartão de desconto genérico.</h2>
          <p className="mt-4 text-sm leading-7 text-zinc-500 md:text-base">O sistema foi pensado ao redor da rotina do entregador e da identidade do motoclube.</p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, text }) => (
            <article key={title} className="steel-card rounded-[2rem] p-5">
              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300"><Icon className="h-5 w-5" /></div>
              <h3 className="mt-5 text-lg font-black uppercase text-white">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-amber-400/10 bg-black/45">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 md:grid-cols-3">
          <TrustStat icon={<ShieldCheck className="h-5 w-5" />} title="Escudo rotativo" text="QR expira automaticamente." />
          <TrustStat icon={<Handshake className="h-5 w-5" />} title="Parceiros credenciados" text="Validação antes de liberar o benefício." />
          <TrustStat icon={<MapPinned className="h-5 w-5" />} title="Foco local" text="Benefícios que fazem sentido na rota." />
        </div>
      </section>

      <footer className="px-4 py-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-700">Irmãos do Asfalto • Honra • Lealdade • Irmandade</p>
      </footer>
    </main>
  );
}

function MiniBadge({ label, value }) {
  return <div className="rounded-2xl border border-white/5 bg-black/35 p-3"><p className="text-[9px] font-black uppercase tracking-[0.24em] text-zinc-600">{label}</p><p className="mt-1 text-xs font-black uppercase text-zinc-200">{value}</p></div>;
}

function TrustStat({ icon, title, text }) {
  return <div className="flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">{icon}</div><div><p className="text-sm font-black uppercase text-white">{title}</p><p className="mt-1 text-sm text-zinc-600">{text}</p></div></div>;
}
