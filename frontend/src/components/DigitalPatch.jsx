import { Bike, CheckCircle2, Crown, ShieldAlert, Star } from "lucide-react";
import { BrandCrest } from "./BrandCrest.jsx";

const rankStars = {
  Candidato: 0,
  "Próspero": 1,
  "Meio-Escudo": 2,
  Escudado: 3,
  Diretoria: 4
};

export function DigitalPatch({ user, active = true, children }) {
  const stars = rankStars[user.patente] ?? 0;
  const candidate = user.patente === "Candidato";
  const statusText = candidate
    ? "Entrada em avaliação • jornada iniciada"
    : active
      ? "Escudo liberado • irmão na ativa"
      : "Escudo suspenso • assinatura inativa";

  return (
    <section className={["digital-patch leather-panel", active ? "digital-patch-active" : "digital-patch-inactive", candidate ? "digital-patch-candidate" : ""].join(" ")}>
      <div className="patch-rivet patch-rivet-tl" />
      <div className="patch-rivet patch-rivet-tr" />
      <div className="patch-rivet patch-rivet-bl" />
      <div className="patch-rivet patch-rivet-br" />

      <div className="patch-rocker patch-rocker-top"><span>IRMÃOS DO ASFALTO</span></div>

      <div className="relative z-10 px-4 pb-4 pt-14">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Nome de estrada</p>
            <h2 className={["mt-1 text-3xl font-black uppercase leading-none", active ? "text-[#f2e5cf]" : "text-zinc-500"].join(" ")}>{user.apelidoEstrada}</h2>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 4 }).map((_, index) => (
                <Star key={index} className={["h-3.5 w-3.5", index < stars && active ? "fill-[#d96b1f] text-[#d96b1f]" : "text-zinc-700"].join(" ")} />
              ))}
            </div>
          </div>

          <div className={["rounded-2xl border px-3 py-2 text-right", active ? "border-[#d96b1f]/35 bg-[#d96b1f]/10" : candidate ? "border-[#b99665]/30 bg-[#b99665]/10" : "border-zinc-800 bg-zinc-900/70"].join(" ")}>
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-zinc-500">Patente</p>
            <p className={["mt-1 text-xs font-black uppercase", active ? "text-[#e38a48]" : candidate ? "text-[#d6b98c]" : "text-zinc-500"].join(" ")}>{user.patente}</p>
          </div>
        </div>

        <div className="relative mt-3 flex justify-center py-1">
          <div className={active ? "patch-aura" : ""} />
          <BrandCrest active={active} size="large" />
          {user.patente === "Diretoria" && (
            <div className="absolute right-4 top-6 grid h-10 w-10 place-items-center rounded-full border border-[#d96b1f]/40 bg-black/80 text-[#e38a48]">
              <Crown className="h-5 w-5" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <PatchSpec label="Moto" value={user.moto.modelo} icon={<Bike className="h-4 w-4" />} />
          <PatchSpec label="Placa" value={user.moto.placa} icon={<span className="text-xs font-black">BR</span>} />
        </div>

        <div className={["mt-3 flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5", active ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300" : candidate ? "border-[#b99665]/25 bg-[#b99665]/10 text-[#d6b98c]" : "border-zinc-800 bg-zinc-900/60 text-zinc-600"].join(" ")}>
          {active ? <CheckCircle2 className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
          <span className="text-[10px] font-black uppercase tracking-[0.22em]">{statusText}</span>
        </div>

        {children}

        <div className="patch-motto mt-4"><span>HONRA</span><i /> <span>RESPEITO</span><i /> <span>IRMANDADE</span></div>
      </div>

      <div className="patch-rocker patch-rocker-bottom"><span>ESTRADA • UNIÃO • LIBERDADE</span></div>
    </section>
  );
}

function PatchSpec({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-black/35 p-3">
      <div className="flex items-center gap-2 text-[#d96b1f]">{icon}<span className="text-[9px] font-black uppercase tracking-[0.24em] text-zinc-600">{label}</span></div>
      <p className="mt-2 truncate text-xs font-black uppercase text-zinc-200">{value}</p>
    </div>
  );
}
