import Link from "next/link";
import { ArrowUpRight, Info } from "lucide-react";
import { demoJobs } from "../services/demo-jobs";
import { JobCard } from "./job-card";
export function RecommendedJobs() {
  return (
    <section className="panel min-w-0 p-5">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[15px] font-semibold">Una mirada a lo que viene</h2>
        <Link
          href="/jobs"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          Explorar empleos
          <ArrowUpRight size={13} />
        </Link>
      </div>
      <p className="mb-5 text-xs text-muted-foreground">Así se verán tus ofertas recomendadas.</p>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-primary/10 bg-primary/4 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
        <Info size={14} className="mt-0.5 shrink-0 text-primary" />
        <span>
          <strong className="font-medium text-primary">Modo demostración.</strong> Ofertas, empresas
          y porcentajes ficticios. No son vacantes reales ni resultados de IA.
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
        {demoJobs.slice(0, 2).map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
