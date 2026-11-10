"use client";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, LogOut, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useLogout, useUser } from "@/features/auth/hooks/use-auth";
import type { User } from "@/features/auth/types/user";
import { errorMessage } from "@/lib/api/client";
export function UserMenu({ initialUser }: { initialUser: User }) {
  const { data = initialUser } = useUser(initialUser);
  const logout = useLogout();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className="flex items-center gap-2 rounded-lg p-1.5 text-left hover:bg-muted"
        aria-label="Menú de usuario"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/10 bg-primary/10 text-xs font-medium text-primary">
          {data.firstName[0]}
          {data.lastName[0]}
        </span>
        <span className="hidden sm:block">
          <span className="block max-w-36 truncate text-xs font-medium">
            {data.firstName} {data.lastName}
          </span>
          <span className="block text-[10px] text-muted-foreground">Mi espacio personal</span>
        </span>
        <ChevronDown size={13} className="hidden text-muted-foreground sm:block" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={12}
          className="z-50 min-w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg"
        >
          <DropdownMenu.Label className="max-w-64 truncate px-3 py-2 text-xs text-muted-foreground">
            {data.email}
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-muted"
            >
              <Settings2 size={15} />
              Configuración
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            disabled={logout.isPending}
            onSelect={() =>
              logout.mutate(undefined, { onError: (e) => toast.error(errorMessage(e)) })
            }
            className="flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive outline-none data-disabled:opacity-50 data-highlighted:bg-muted"
          >
            <LogOut size={15} />
            {logout.isPending ? "Cerrando sesión…" : "Cerrar sesión"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
