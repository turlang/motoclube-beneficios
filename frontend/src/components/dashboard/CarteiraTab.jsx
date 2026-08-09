import { CheckCircle2, WalletCards } from "lucide-react";
import { SectionHeader } from "./DashboardUI.jsx";

const activities = [
  { title: "Abastecimento", place: "Posto Rota 000", value: "-R$ 25,00", status: "Hoje, 08:15" },
  { title: "Serviço", place: "Borracharia do André", value: "-R$ 30,00", status: "Ontem, 17:45" },
  { title: "Lavagem", place: "Lava Jato Estrada Limpa", value: "-R$ 20,00", status: "05/06, 15:20" }
];

export function CarteiraTab({ isActive }) {
  return (
    <>
      <SectionHeader eyebrow="Sua assinatura" title="Tudo que fortalece quem acelera a cidade" />
      <section className="steel-card rounded-[2rem] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-zinc-500">Plano</p>
            <h3 className="mt-2 text-2xl font-black uppercase text-white">Escudado</h3>
          </div>
          <div className={["rounded-2xl px-3 py-2 text-xs font-black uppercase tracking-[0.22em]", isActive ? "bg-emerald-400/10 text-emerald-300" : "bg-zinc-800 text-zinc-500"].join(" ")}>
            {isActive ? "Ativo" : "Inativo"}
          </div>
        </div>
        <ul className="mt-5 space-y-3 text-sm text-zinc-400">
          <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Acesso a todos os parceiros</li>
          <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Descontos exclusivos</li>
          <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Eventos e ações do clube</li>
          <li className="flex items-center gap-3"><CheckCircle2 className="h-4 w-4 text-amber-400" /> Suporte e assistência</li>
        </ul>
        <button className="mt-5 h-12 w-full rounded-2xl bg-amber-400 font-black uppercase tracking-[0.18em] text-black">
          Gerenciar assinatura
        </button>
      </section>

      <section className="steel-card rounded-[2rem] p-5">
        <div className="flex items-center gap-3">
          <WalletCards className="h-5 w-5 text-amber-300" />
          <h3 className="text-lg font-black uppercase text-white">Atividades recentes</h3>
        </div>
        <div className="mt-4 space-y-4">
          {activities.map((activity) => (
            <div key={`${activity.title}-${activity.status}`} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/25 p-3">
              <div>
                <p className="text-sm font-black uppercase text-white">{activity.title}</p>
                <p className="mt-1 text-xs text-zinc-500">{activity.place}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-emerald-400">{activity.value}</p>
                <p className="mt-1 text-xs text-zinc-600">{activity.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
