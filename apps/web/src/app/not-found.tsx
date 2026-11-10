import { EmptyState } from "@/components/shared/empty-state";
export default function NotFound() {
  return (
    <main className="mx-auto max-w-2xl p-6">
      <EmptyState
        title="Este camino no existe"
        description="No encontramos la página que buscas. Regresa a tu espacio para continuar."
        eyebrow="404 · Página no encontrada"
      />
    </main>
  );
}
