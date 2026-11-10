"use client";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useLogout } from "@/features/auth/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/client";
export function LogoutButton() {
  const logout = useLogout();
  return (
    <Button
      variant="ghost"
      disabled={logout.isPending}
      onClick={() => logout.mutate(undefined, { onError: (e) => toast.error(errorMessage(e)) })}
    >
      <LogOut />
      {logout.isPending ? "Saliendo…" : "Cerrar sesión"}
    </Button>
  );
}
