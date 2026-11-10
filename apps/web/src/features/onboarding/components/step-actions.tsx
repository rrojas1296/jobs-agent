import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
export function StepActions({
  pending,
  back,
  last = false,
}: {
  pending: boolean;
  back?: () => void;
  last?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-border pt-6">
      {back ? (
        <Button type="button" variant="ghost" onClick={back} disabled={pending}>
          <ArrowLeft />
          Atrás
        </Button>
      ) : (
        <span className="text-xs text-muted-foreground">Se guarda al continuar</span>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        {pending ? "Guardando…" : last ? "Ir a mi dashboard" : "Guardar y continuar"}
        {!pending && <ArrowRight />}
      </Button>
    </div>
  );
}
