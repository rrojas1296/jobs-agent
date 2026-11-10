import { EmptyState } from "@/components/shared/empty-state";
export const metadata = { title: "Mis postulaciones" };
export default function ApplicationsPage() {
  return (
    <EmptyState
      title="Aquí comienza tu camino"
      description="Todavía no tienes postulaciones. En una siguiente fase podrás llevar el seguimiento de tus oportunidades desde este espacio."
      eyebrow="Mis postulaciones"
    />
  );
}
