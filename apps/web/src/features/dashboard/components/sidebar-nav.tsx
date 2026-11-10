"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Send,
  FileUser,
  Bookmark,
  Settings2,
  ArrowUpRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { useUiStore } from "@/stores/ui.store";
const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Explorar empleos", icon: Search },
  { href: "/applications", label: "Mis postulaciones", icon: Send },
  { href: "/resumes", label: "Mis CV", icon: FileUser },
  { href: "/saved", label: "Ofertas guardadas", icon: Bookmark },
];
export function SidebarNav({
  compact = false,
  mobile = false,
}: {
  compact?: boolean;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const toggle = useUiStore((s) => s.toggleSidebar);
  const close = useUiStore((s) => s.setMobileOpen);
  return (
    <div className="flex h-full flex-col px-3 py-5">
      <div className={`mb-9 flex items-center ${compact ? "justify-center" : "px-3"}`}>
        <Brand compact={compact} />
      </div>
      <p className={`mb-3 px-3 text-[11px] text-muted-foreground ${compact ? "sr-only" : ""}`}>
        Mi espacio
      </p>
      <nav aria-label="Navegación principal" className="space-y-1">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            title={compact ? item.label : undefined}
            aria-label={compact ? item.label : undefined}
            aria-current={pathname === item.href ? "page" : undefined}
            onClick={() => close(false)}
            className={`relative flex h-11 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors hover:bg-muted ${compact ? "justify-center" : ""} ${pathname === item.href ? "bg-muted font-medium text-foreground before:absolute before:inset-y-3 before:left-0 before:w-[3px] before:rounded-full before:bg-primary" : "text-muted-foreground"}`}
          >
            <item.icon size={17} strokeWidth={1.65} />
            {!compact && item.label}
          </Link>
        ))}
      </nav>
      <p className={`mt-9 mb-3 px-3 text-[11px] text-muted-foreground ${compact ? "sr-only" : ""}`}>
        General
      </p>
      <Link
        href="/settings"
        title={compact ? "Configuración" : undefined}
        aria-label={compact ? "Configuración" : undefined}
        aria-current={pathname === "/settings" ? "page" : undefined}
        onClick={() => close(false)}
        className={`flex h-11 items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground hover:bg-muted ${compact ? "justify-center" : ""}`}
      >
        <Settings2 size={17} />
        {!compact && "Configuración"}
      </Link>
      <div className="mt-auto pt-10">
        {!compact && (
          <div className="mb-4 rounded-xl border border-border bg-linear-to-b from-primary/4 to-muted/40 p-4">
            <div className="mb-3 flex size-8 items-center justify-center rounded-lg bg-primary text-white">
              <ArrowUpRight size={17} />
            </div>
            <h2 className="text-sm font-medium">Tu próximo paso importa</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Tu perfil está listo. Pronto podrás descubrir oportunidades a tu medida.
            </p>
            <span className="mt-4 block rounded-md border border-border bg-card py-1.5 text-center text-[11px] text-muted-foreground">
              Primera versión · en evolución
            </span>
          </div>
        )}
        {!mobile && (
          <button
            type="button"
            onClick={toggle}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg text-xs text-muted-foreground hover:bg-muted"
            aria-label={compact ? "Expandir sidebar" : "Contraer sidebar"}
          >
            {compact ? (
              <PanelLeftOpen size={16} />
            ) : (
              <>
                <PanelLeftClose size={16} />
                Contraer menú
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
