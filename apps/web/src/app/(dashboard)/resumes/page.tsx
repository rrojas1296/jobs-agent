import { EmptyState } from "@/components/shared/empty-state";
export const metadata = { title: "Mis CV" };
export default function ResumesPage() {
  return (
    <EmptyState
      title="Tu experiencia merece una buena historia"
      description="Aquí vivirán tus CV personalizados. La generación de documentos con IA no está disponible en esta primera versión."
      eyebrow="Mis CV"
    />
  );
}
