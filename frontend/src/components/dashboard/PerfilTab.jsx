import { UserRound } from "lucide-react";
import { DetailRow, SectionHeader } from "./DashboardUI.jsx";

export function PerfilTab({ user }) {
  return (
    <>
      <SectionHeader eyebrow="Perfil do associado" title="Sua identidade dentro da irmandade" />
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
          <DetailRow label="Moto" value={user.moto.modelo} />
          <DetailRow label="Placa" value={user.moto.placa} />
        </div>
      </section>
    </>
  );
}
