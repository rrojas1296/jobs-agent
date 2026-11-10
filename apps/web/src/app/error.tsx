"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="panel mx-auto my-12 max-w-lg p-8 text-center">
      <h1 className="text-xl font-semibold">No pudimos cargar este espacio</h1>
      <p className="my-4 text-sm text-muted-foreground">
        Comprueba la conexión y vuelve a intentarlo. Tu progreso guardado sigue a salvo.
      </p>
      <Button onClick={reset}>Reintentar</Button>
    </main>
  );
}
