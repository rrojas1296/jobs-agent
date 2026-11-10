import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { requireUser } from "@/lib/auth/server-user";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import { Button } from "@/components/ui/button";
export const metadata = { title: "Dashboard" };
export default async function DashboardPage() {
  const user = await requireUser();
  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card px-5 py-5">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            TU CARRERA, EN MOVIMIENTO
          </div>
          <h1 className="text-[26px] leading-tight font-semibold tracking-[-1px]">
            Hola, {user.firstName}
            <span className="text-primary">.</span>
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Este es tu espacio para encontrar lo que sigue. Vamos paso a paso.
          </p>
        </div>
        <Button asChild variant="outline" className="h-9 text-xs">
          <Link href="/jobs">
            Explorar empleos
            <ArrowUpRight />
          </Link>
        </Button>
      </div>
      <DashboardContent user={user} />
    </>
  );
}
