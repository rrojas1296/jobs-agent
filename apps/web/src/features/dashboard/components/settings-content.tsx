"use client";
import { useOnboarding } from "@/features/onboarding/hooks/use-onboarding";
import { ThemeSelect } from "@/components/shared/theme-select";
import { LogoutButton } from "@/components/shared/logout-button";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/client";
export function SettingsContent() {
  const query = useOnboarding();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="panel p-6">
        <h2 className="mb-5 text-base font-semibold">Perfil profesional</h2>
        {query.isPending ? (
          <p aria-live="polite" className="animate-pulse text-sm text-muted-foreground">
            Cargando tu información…
          </p>
        ) : query.isError ? (
          <div role="alert">
            <p className="mb-3 text-sm">{errorMessage(query.error)}</p>
            <Button variant="outline" onClick={() => void query.refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <dl className="space-y-4 text-sm">
              {[
                ["Título", query.data.profile?.professionalTitle],
                [
                  "Ubicación",
                  [query.data.profile?.city, query.data.profile?.country]
                    .filter(Boolean)
                    .join(", "),
                ],
                ["Experiencia", `${query.data.profile?.yearsOfExperience ?? 0} años`],
                ["Nivel", query.data.preferences?.seniority],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-5">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="text-right">{value || "Sin especificar"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2">
              {query.data.preferences?.technologies.map((item) => (
                <span key={item} className="tag">
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              La edición del perfil estará disponible en una próxima versión.
            </p>
          </>
        )}
      </section>
      <section className="panel p-6">
        <h2 className="text-base font-semibold">Hazlo tuyo</h2>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-medium">Apariencia</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Claro, oscuro o según tu dispositivo.
            </p>
          </div>
          <ThemeSelect />
        </div>
        <div className="mt-7 border-t border-border pt-5">
          <h3 className="mb-3 text-sm font-medium">Tu sesión</h3>
          <LogoutButton />
        </div>
      </section>
    </div>
  );
}
