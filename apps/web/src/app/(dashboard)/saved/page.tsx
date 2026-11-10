import { EmptyState } from "@/components/shared/empty-state";
export const metadata = { title: "Ofertas guardadas" };
export default function SavedPage() {
  return (
    <EmptyState
      title="Guarda lo que te inspire"
      description="Aún no hay ofertas guardadas. Esta sección estará disponible cuando se conecten los portales de empleo."
      eyebrow="Ofertas guardadas"
    />
  );
}
