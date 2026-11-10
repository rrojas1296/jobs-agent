"use client";
import { useOnboarding } from "../hooks/use-onboarding";
import { OnboardingWizard } from "./onboarding-wizard";
import { Button } from "@/components/ui/button";
import { errorMessage } from "@/lib/api/client";
export function OnboardingContent() {
  const query = useOnboarding();
  if (query.isPending)
    return (
      <div
        aria-live="polite"
        aria-busy="true"
        className="panel mx-auto max-w-2xl animate-pulse space-y-6 p-9"
      >
        <span className="sr-only">Cargando tu progreso…</span>
        <div className="h-7 w-2/3 rounded bg-muted" />
        <div className="h-48 rounded bg-muted" />
      </div>
    );
  if (query.isError)
    return (
      <div role="alert" className="panel mx-auto max-w-2xl p-8">
        <p className="mb-4">{errorMessage(query.error)}</p>
        <Button onClick={() => void query.refetch()}>Reintentar</Button>
      </div>
    );
  return <OnboardingWizard data={query.data} />;
}
