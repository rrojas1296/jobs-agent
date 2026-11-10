import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server-user";
import { Sidebar } from "@/features/dashboard/components/sidebar";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  if (!user.onboardingCompleted) redirect("/onboarding");
  return (
    <div className="mx-auto flex min-h-dvh max-w-[1680px] items-start gap-4 p-3 sm:p-4">
      <a
        href="#main-content"
        className="sr-only z-50 rounded bg-primary p-3 text-white focus:not-sr-only focus:fixed"
      >
        Saltar al contenido
      </a>
      <Sidebar />
      <div className="min-w-0 flex-1">
        <DashboardHeader user={user} />
        <main id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <footer className="flex flex-wrap justify-between gap-2 px-2 py-6 text-[11px] text-muted-foreground">
          <span>Hecho para tu siguiente capítulo.</span>
          <span>Nexo · Primera versión</span>
        </footer>
      </div>
    </div>
  );
}
