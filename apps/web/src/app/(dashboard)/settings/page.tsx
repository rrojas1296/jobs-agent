import { requireUser } from "@/lib/auth/server-user";
import { SettingsContent } from "@/features/dashboard/components/settings-content";
export const metadata = { title: "Configuración" };
export default async function SettingsPage() {
  const user = await requireUser();
  return (
    <>
      <section className="panel mb-4 p-6">
        <p className="mb-2 text-xs text-muted-foreground">Configuración</p>
        <h1 className="text-2xl font-semibold">Tu espacio, tus preferencias</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {user.firstName} {user.lastName} · {user.email}
        </p>
      </section>
      <SettingsContent />
    </>
  );
}
