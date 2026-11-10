import { MapPin, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { DemoJob } from "../types/dashboard";
const colors: Record<string, string> = {
  violet: "bg-violet-100 text-violet-700",
  orange: "bg-orange-100 text-orange-700",
  blue: "bg-blue-100 text-blue-700",
};
export function JobCard({ job }: { job: DemoJob }) {
  return (
    <article className="group rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-2xl font-semibold ${colors[job.color]}`}
        >
          {job.monogram}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[13px] font-semibold leading-5">{job.title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{job.company}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/8 px-1.5 py-1 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
          <Sparkles size={11} />
          {job.compatibility}%
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin size={12} />
          {job.location}
        </span>
        <span className="size-0.5 rounded-full bg-muted-foreground" />
        <span>{job.modality}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.technologies.map((technology) => (
          <span
            key={technology}
            className="rounded-md border border-border bg-muted/40 px-2 py-1 text-[10px] text-muted-foreground"
          >
            {technology}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-[11px] font-medium">
          {job.salary}
          <span className="font-normal text-muted-foreground"> / mes</span>
        </span>
        <Link
          href="/jobs"
          aria-label={`Ver demostración de ${job.title}`}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-primary"
        >
          <ArrowUpRight size={16} />
        </Link>
      </div>
    </article>
  );
}
