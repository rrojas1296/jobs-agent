"use client";
import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../services/dashboard.service";
import { StatisticsGrid } from "./statistics-grid";
import { RecommendedJobs } from "./recommended-jobs";
import { ProfileCard } from "./profile-card";
import { RecentActivity } from "./recent-activity";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/client";
import type { User } from "@/features/auth/types/user";
export function DashboardContent({ user }: { user: User }) {
  const query = useQuery({ queryKey: ["dashboard"], queryFn: getDashboard });
  if (query.isPending)
    return (
      <div className="space-y-4" aria-live="polite" aria-busy="true">
        <span className="sr-only">Cargando dashboard…</span>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="panel h-32 animate-pulse bg-card" />
          ))}
        </div>
        <div className="panel h-80 animate-pulse" />
      </div>
    );
  if (query.isError)
    return (
      <div className="panel p-6" role="alert">
        <p className="mb-4">{errorMessage(query.error)}</p>
        <Button onClick={() => void query.refetch()}>Reintentar</Button>
      </div>
    );
  return (
    <div className="space-y-4">
      <div className="panel p-4">
        <StatisticsGrid statistics={query.data.statistics} />
      </div>
      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_290px]">
        <RecommendedJobs />
        <ProfileCard user={user} />
      </div>
      <RecentActivity activity={query.data.activity} />
    </div>
  );
}
