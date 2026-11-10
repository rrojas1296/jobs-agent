import Link from "next/link";
import { ArrowLeft, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
export function EmptyState({
  title,
  description,
  eyebrow = "Un espacio para lo que viene",
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <section className="panel flex min-h-[420px] flex-col items-center justify-center p-8 text-center">
      <span className="mb-6 flex size-16 items-center justify-center rounded-2xl border border-primary/15 bg-primary/5 text-primary">
        <Sprout size={29} strokeWidth={1.4} />
      </span>
      <span className="mb-3 text-[10px] tracking-widest text-muted-foreground uppercase">
        {eyebrow}
      </span>
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      <Button asChild variant="outline" className="mt-7">
        <Link href="/dashboard">
          <ArrowLeft />
          Volver al dashboard
        </Link>
      </Button>
    </section>
  );
}
