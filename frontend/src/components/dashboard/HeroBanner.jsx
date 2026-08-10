import { BadgeCheck, ShieldAlert } from "lucide-react";
import { BrandCrest } from "../BrandCrest.jsx";

const PHOTO = "https://images.pexels.com/photos/9789338/pexels-photo-9789338.jpeg?auto=compress&cs=tinysrgb&w=1800";

const labels = {
  escudo: ["ESCUDO DA IRMANDADE", "Sua identidade de estrada e validação em tempo real."],
  beneficios: ["PARCEIROS DE ESTRADA", "Benefícios escolhidos para a rotina sobre duas rodas."],
  sos: ["REDE DE APOIO", "Quando a estrada aperta, a irmandade precisa estar perto."],
  carteira: ["VIDA NO CLUBE", "Encontros, rotas e registros da caminhada coletiva."],
  mural: ["VOZ DA DIRETORIA", "Comunicados, convocações e avisos oficiais da irmandade."],
  perfil: ["JORNADA DO INTEGRANTE", "Patente, padrinho, requisitos e história dentro da irmandade."],
  diretoria: ["COMANDO DA IRMANDADE", "Membros, progressão, parceiros e operação da sede digital."]
};

export function HeroBanner({ user, activeTab }) {
  const [title, subtitle] = labels[activeTab] || labels.escudo;
  const candidate = user.patente === "Candidato";
  const active = user.statusAssinatura === "ativo" && !candidate;

  return (
    <section className="mc-member-hero">
      <img src={PHOTO} alt="Motociclistas em comboio" className="mc-member-hero-photo" />
      <div className="mc-member-hero-overlay" />
      <div className="mc-member-hero-copy">
        <p>SALVE, {user.apelidoEstrada}</p>
        <h2>{title}</h2>
        <span>{subtitle}</span>
        <div className="mc-member-hero-status">
          {active ? <BadgeCheck /> : <ShieldAlert />}
          <b>{candidate ? "JORNADA EM AVALIAÇÃO" : active ? "ESCUDO LIBERADO" : "ESCUDO SUSPENSO"}</b>
          <i />
          <small>PATENTE {user.patente}</small>
        </div>
      </div>
      <div className="mc-member-hero-patch"><BrandCrest active={active} compact /></div>
      <div className="mc-member-hero-word">IRMÃOS</div>
    </section>
  );
}
