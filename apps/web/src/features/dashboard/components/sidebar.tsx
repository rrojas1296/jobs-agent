"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useUiStore } from "@/stores/ui.store";
import { SidebarNav } from "./sidebar-nav";
export function Sidebar() {
  const collapsed = useUiStore((s) => s.collapsed);
  const open = useUiStore((s) => s.mobileOpen);
  const setOpen = useUiStore((s) => s.setMobileOpen);
  return (
    <>
      <aside
        className={`sticky top-4 hidden h-[calc(100dvh-32px)] shrink-0 overflow-y-auto rounded-2xl border border-border/60 bg-card transition-[width] lg:block ${collapsed ? "w-[76px]" : "w-[222px]"}`}
      >
        <SidebarNav compact={collapsed} />
      </aside>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/35 backdrop-blur-xs" />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 w-[280px] max-w-[90vw] overflow-y-auto bg-card shadow-xl"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Navegación de Nexo</Dialog.Title>
            <Dialog.Close
              className="absolute top-6 right-4 z-10 rounded-md p-2 text-muted-foreground hover:bg-muted"
              aria-label="Cerrar menú"
            >
              <X size={18} />
            </Dialog.Close>
            <SidebarNav mobile />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
