import { BriefcaseBusiness, Sparkles, Send, FileUser } from "lucide-react";
import type { DashboardData } from "../types/dashboard";
export function StatisticsGrid({ statistics }: { statistics: DashboardData["statistics"] }) {
  const tiles = [
    {
      label: "Ofertas encontradas",
      value: statistics.found,
      description: "Tu búsqueda, en un lugar",
      icon: BriefcaseBusiness,
      color: "bg-violet-500",
    },
    {
      label: "Ofertas compatibles",
      value: statistics.compatible,
      description: "Alineadas con tu perfil",
      icon: Sparkles,
      color: "bg-orange-500",
    },
    {
      label: "Postulaciones realizadas",
      value: statistics.applications,
      description: "Cada paso cuenta",
      icon: Send,
      color: "bg-pink-500",
    },
    {
      label: "CV generados",
      value: statistics.resumes,
      description: "Tu experiencia, a medida",
      icon: FileUser,
      color: "bg-blue-500",
    },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <article key={tile.label} className="rounded-xl border border-border/60 bg-muted/35 p-1.5">
          <div className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl border-4 border-white/15 text-white shadow-[inset_0_1px_2px_#ffffff55] ${tile.color}`}
            >
              <tile.icon size={18} strokeWidth={1.6} />
            </span>
            <div>
              <p className="text-2xl leading-7 font-semibold tabular-nums">{tile.value}</p>
              <p className="text-[11px] text-muted-foreground">{tile.description}</p>
            </div>
          </div>
          <p className="px-2 py-2 text-xs font-medium">{tile.label}</p>
        </article>
      ))}
    </div>
  );
}
