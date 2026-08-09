import { Ambulance, Headphones, PhoneCall } from "lucide-react";
import { ActionCard, SectionHeader } from "./DashboardUI.jsx";

export function SosTab() {
  return (
    <>
      <SectionHeader eyebrow="Rede de apoio" title="Na rua, um ajuda o outro" />
      <section className="grid gap-3">
        <ActionCard icon={<Ambulance className="h-5 w-5" />} title="SOS mecânico" description="Acione parceiros próximos para pneu, bateria, corrente e reparos rápidos." cta="Chamar suporte" />
        <ActionCard icon={<PhoneCall className="h-5 w-5" />} title="Contato de emergência" description="Canal direto para apoio do motoclube em caso de acidente ou problema grave." cta="Ligar agora" />
        <ActionCard icon={<Headphones className="h-5 w-5" />} title="Central da irmandade" description="Dúvidas, suporte com assinatura e orientação para uso do benefício." cta="Abrir atendimento" />
      </section>
    </>
  );
}
