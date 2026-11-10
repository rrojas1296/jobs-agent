import { History, ArrowUpRight, Inbox } from "lucide-react";
import Link from "next/link";
import type { DashboardData } from "../types/dashboard";
export function RecentActivity({ activity }: { activity: DashboardData["activity"] }) {
  return (
    <section className="panel overflow-hidden p-3">
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2.5">
        <h2 className="flex items-center gap-2 text-sm font-medium">
          <span className="rounded-md border border-border bg-card p-1.5">
            <History size={15} />
          </span>
          Actividad reciente
        </h2>
        <Link
          href="/applications"
          aria-label="Mis postulaciones"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <span className="hidden sm:inline">Mis postulaciones</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
      {activity.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-9 text-center">
          <span className="mb-3 rounded-xl border border-border bg-muted/40 p-3 text-muted-foreground">
            <Inbox size={21} strokeWidth={1.5} />
          </span>
          <h3 className="text-sm font-medium">Cada gran cambio empieza con un primer paso</h3>
          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-muted-foreground">
            Todavía no tienes actividad. Aquí aparecerán tus postulaciones y avances cuando estén
            disponibles.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {activity.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 p-4 text-sm">
              <span>{item.title}</span>
              <time dateTime={item.date} className="text-muted-foreground">
                {new Date(item.date).toLocaleDateString("es")}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
