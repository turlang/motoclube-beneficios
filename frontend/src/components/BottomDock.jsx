import { Ambulance, BadgePercent, Crown, Shield, UserRound, WalletCards } from "lucide-react";

const tabs = [
  { key: "escudo", label: "Escudo", icon: Shield },
  { key: "beneficios", label: "Rota", icon: BadgePercent },
  { key: "sos", label: "SOS", icon: Ambulance, featured: true },
  { key: "carteira", label: "Clube", icon: WalletCards },
  { key: "perfil", label: "Perfil", icon: UserRound }
];

export function BottomDock({ activeTab, onChange, isDiretoria = false }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 bottom-safe">
      <nav className="dock-shell mx-auto max-w-lg" aria-label="Navegação principal">
        <div className="flex items-end gap-1 px-2 py-2">
          {tabs.map(({ key, label, icon: Icon, featured }) => {
            const active = key === activeTab;
            if (featured) {
              return (
                <button key={key} type="button" onClick={() => onChange(key)} aria-current={active ? "page" : undefined} className="relative -mt-8 flex min-w-0 flex-1 flex-col items-center gap-1">
                  <span className={["grid h-14 w-14 place-items-center rounded-full border-2 shadow-[0_10px_28px_rgba(0,0,0,0.55)] transition active:scale-95", active ? "border-[#f2e5cf] bg-[#d96b1f] text-black shadow-[0_0_30px_rgba(217,107,31,0.35)]" : "border-[#d96b1f]/45 bg-zinc-950 text-[#e38a48]"].join(" ")}>
                    <Icon className="h-6 w-6" strokeWidth={2.1} />
                  </span>
                  <span className={["text-[9px] font-black uppercase tracking-[0.18em]", active ? "text-[#e38a48]" : "text-zinc-500"].join(" ")}>{label}</span>
                </button>
              );
            }

            return (
              <button key={key} type="button" onClick={() => onChange(key)} aria-current={active ? "page" : undefined} className={["flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition active:scale-95", active ? "text-[#e38a48]" : "text-zinc-600"].join(" ")}>
                <span className={["grid h-8 w-8 place-items-center rounded-xl", active ? "bg-[#d96b1f]/15" : ""].join(" ")}><Icon className="h-[18px] w-[18px]" strokeWidth={2} /></span>
                <span className="truncate text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
              </button>
            );
          })}

          {isDiretoria && (
            <button type="button" onClick={() => onChange("diretoria")} aria-current={activeTab === "diretoria" ? "page" : undefined} className={["flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 transition active:scale-95", activeTab === "diretoria" ? "text-[#e38a48]" : "text-zinc-600"].join(" ")}>
              <span className={["grid h-8 w-8 place-items-center rounded-xl", activeTab === "diretoria" ? "bg-[#d96b1f]/15" : ""].join(" ")}><Crown className="h-[18px] w-[18px]" strokeWidth={2} /></span>
              <span className="truncate text-[9px] font-black uppercase tracking-[0.15em]">Diretoria</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
}
