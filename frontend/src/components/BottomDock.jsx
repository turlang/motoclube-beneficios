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
    <div className="mc-dock-wrap bottom-safe">
      <nav className="mc-member-dock" aria-label="Navegação principal">
        <div className="mc-dock-rivet mc-dock-rivet-left" /><div className="mc-dock-rivet mc-dock-rivet-right" />
        {tabs.map(({ key, label, icon: Icon, featured }) => {
          const active = key === activeTab;
          return (
            <button key={key} type="button" onClick={() => onChange(key)} aria-current={active ? "page" : undefined} className={["mc-dock-item", featured ? "mc-dock-sos" : "", active ? "is-current" : ""].join(" ")}>
              <span><Icon /></span><small>{label}</small>
            </button>
          );
        })}
        {isDiretoria && (
          <button type="button" onClick={() => onChange("diretoria")} aria-current={activeTab === "diretoria" ? "page" : undefined} className={["mc-dock-item", activeTab === "diretoria" ? "is-current" : ""].join(" ")}>
            <span><Crown /></span><small>Diretoria</small>
          </button>
        )}
      </nav>
    </div>
  );
}
