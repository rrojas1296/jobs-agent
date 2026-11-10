"use client";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUiStore } from "@/stores/ui.store";
import { ThemeSelect } from "@/components/shared/theme-select";
import { UserMenu } from "./user-menu";
import type { User } from "@/features/auth/types/user";
const titles: Record<string, string> = {
  "/dashboard": "Vista general",
  "/jobs": "Explorar empleos",
  "/applications": "Mis postulaciones",
  "/resumes": "Mis CV",
  "/saved": "Ofertas guardadas",
  "/settings": "Configuración",
};
export function DashboardHeader({ user }: { user: User }) {
  const pathname = usePathname();
  const setOpen = useUiStore((s) => s.setMobileOpen);
  return (
    <header className="mb-4 flex min-h-16 items-center justify-between gap-2 rounded-2xl border border-border/50 bg-card px-3 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir navegación"
          className="rounded-lg p-2 hover:bg-muted lg:hidden"
        >
          <Menu size={19} />
        </button>
        <span className="truncate text-sm font-medium">{titles[pathname] ?? "Mi espacio"}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <ThemeSelect />
        <span className="h-6 w-px bg-border" />
        <UserMenu initialUser={user} />
      </div>
    </header>
  );
}
