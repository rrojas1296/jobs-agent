import { ArrowUpRight, BriefcaseBusiness, Check, Sparkles } from "lucide-react";
import { Brand } from "@/components/shared/brand";
import { ThemeSelect } from "@/components/shared/theme-select";
export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh p-3 md:p-5">
      <div className="grid min-h-[calc(100dvh-40px)] overflow-hidden rounded-2xl border border-border bg-card lg:grid-cols-[.95fr_1.05fr]">
        <aside className="relative hidden flex-col justify-between border-r border-border bg-muted/50 p-12 lg:flex">
          <Brand />
          <div className="py-12">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs text-primary">
              <Sparkles size={13} /> Tu carrera, con dirección
            </div>
            <h1 className="max-w-sm text-[46px] leading-[1.12] font-medium">
              Tu próximo paso
              <br />
              empieza aquí.
            </h1>
            <p className="mt-5 max-w-sm text-muted-foreground">
              Menos pestañas abiertas. Más claridad para encontrar un empleo que encaje contigo.
            </p>
            <div className="mt-10 max-w-sm rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <BriefcaseBusiness size={21} />
                </div>
                <div>
                  <p className="font-medium">Un perfil. Nuevas posibilidades.</p>
                  <p className="text-xs text-muted-foreground">
                    Todo listo para tu siguiente oportunidad
                  </p>
                </div>
                <ArrowUpRight size={16} className="ml-auto text-muted-foreground" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Tu experiencia", "Tus habilidades", "Tus preferencias"].map((item) => (
                  <span key={item} className="tag">
                    <Check size={11} className="text-primary" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Una búsqueda más organizada. Una decisión más tuya.
          </p>
        </aside>
        <section className="flex flex-col p-6 sm:p-10">
          <div className="flex items-center justify-between">
            <div className="lg:invisible">
              <Brand />
            </div>
            <ThemeSelect />
          </div>
          <div className="m-auto w-full max-w-[390px] py-10">{children}</div>
          <p className="text-center text-xs text-muted-foreground">
            Tus datos son tuyos. Tu siguiente paso, también.
          </p>
        </section>
      </div>
    </main>
  );
}
