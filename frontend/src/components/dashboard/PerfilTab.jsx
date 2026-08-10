import { UserRound } from "lucide-react";
import { DetailRow, SectionHeader } from "./DashboardUI.jsx";
import { JourneyProgress } from "./JourneyProgress.jsx";
import { DocumentsPanel } from "./DocumentsPanel.jsx";
import { MotorcycleHealthPanel } from "./MotorcycleHealthPanel.jsx";

export function PerfilTab({ user, journey, journeyLoading, journeyError, documents, documentsLoading, documentsError, pendingRequiredCount, onAcceptDocument }) {
  return (
    <>
      <SectionHeader eyebrow="Perfil do integrante" title="Sua identidade e sua caminhada dentro da irmandade" />
      <section className="steel-card rounded-[2rem] p-5">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-3xl border border-amber-400/20 bg-black/40 text-amber-300">
            <UserRound className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase text-white">{user.apelidoEstrada}</h3>
            <p className="text-sm text-zinc-500">{user.nome}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          <DetailRow label="E-mail" value={user.email} />
          <DetailRow label="Patente" value={user.patente} />
          <DetailRow label="Núcleo" value={user.nucleo?.nome ? `${user.nucleo.nome}${user.nucleo.estado ? ` • ${user.nucleo.estado}` : ""}` : "A definir"} />
          <DetailRow label="Moto" value={user.moto.modelo} />
          <DetailRow label="Placa" value={user.moto.placa} />
        </div>
      </section>

      <MotorcycleHealthPanel />
      <JourneyProgress journey={journey} loading={journeyLoading} error={journeyError} />
      <DocumentsPanel documents={documents} loading={documentsLoading} error={documentsError} pendingRequiredCount={pendingRequiredCount} onAccept={onAcceptDocument} />
    </>
  );
}
