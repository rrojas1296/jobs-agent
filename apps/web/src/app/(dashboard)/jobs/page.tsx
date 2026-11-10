import { EmptyState } from "@/components/shared/empty-state";
import { demoJobs } from "@/features/dashboard/services/demo-jobs";
import { JobCard } from "@/features/dashboard/components/job-card";
export const metadata = { title: "Explorar empleos" };
export default function JobsPage() {
  return (
    <div className="space-y-5">
      <EmptyState
        title="Tu próxima oportunidad, próximamente"
        description="La integración con portales de empleo llegará en una siguiente fase. Aún no hay vacantes reales ni análisis con IA disponibles."
        eyebrow="Explorar empleos"
      />
      <section className="panel p-5">
        <h2 className="text-base font-semibold">Vista previa · ofertas de demostración</h2>
        <p className="mt-2 mb-5 text-xs text-muted-foreground">
          Empresas, vacantes, salarios y compatibilidades ficticias. No puedes postular a estas
          ofertas.
        </p>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {demoJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </div>
  );
}
