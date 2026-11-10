"use client";
import { useState } from "react";
import { Check, UserRound, Code2, BriefcaseBusiness, Link2 } from "lucide-react";
import { ProfileStep } from "./profile-step";
import { SkillsStep } from "./skills-step";
import { PreferencesStep } from "./preferences-step";
import { LinksStep } from "./links-step";
import type { OnboardingData } from "../types/onboarding";
const steps = [
  {
    title: "Tu experiencia cuenta",
    subtitle: "Empecemos por lo que te hace profesionalmente único.",
    label: "Perfil profesional",
    icon: UserRound,
  },
  {
    title: "¿Cuál es tu stack?",
    subtitle: "Selecciona tus habilidades. También puedes añadir las tuyas.",
    label: "Tecnologías",
    icon: Code2,
  },
  {
    title: "Un empleo a tu medida",
    subtitle: "Cuéntanos cómo y dónde te gustaría trabajar.",
    label: "Preferencias",
    icon: BriefcaseBusiness,
  },
  {
    title: "Conecta tu trayectoria",
    subtitle: "Añade tus enlaces profesionales para completar tu perfil.",
    label: "Enlaces",
    icon: Link2,
  },
];
export function OnboardingWizard({ data }: { data: OnboardingData }) {
  const [step, setStep] = useState(() =>
    !data.profile?.professionalTitle
      ? 0
      : !data.preferences?.technologies.length
        ? 1
        : !data.preferences.seniority
          ? 2
          : 3,
  );
  const current = steps[step] ?? steps[0]!;
  const next = () => setStep((value) => Math.min(value + 1, 3));
  const back = () => setStep((value) => Math.max(value - 1, 0));
  return (
    <div className="mx-auto grid max-w-[1040px] gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:pt-7">
        <p className="mb-5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Tu siguiente capítulo
        </p>
        <h1 className="mb-3 text-2xl font-semibold">Hagamos que encaje.</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Unos minutos para conocerte. Un perfil que habla por ti.
        </p>
        <ol className="mt-8 grid grid-cols-4 gap-2 lg:grid-cols-1 lg:gap-5">
          {steps.map((item, index) => (
            <li
              key={item.label}
              aria-current={step === index ? "step" : undefined}
              className="flex items-center gap-3"
            >
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${index === step ? "border-primary bg-primary text-white" : index < step ? "border-primary/15 bg-primary/8 text-primary" : "border-border bg-card text-muted-foreground"}`}
              >
                {index < step ? <Check size={16} /> : <item.icon size={16} />}
              </span>
              <span
                className={`hidden text-sm lg:block ${step === index ? "font-medium" : "text-muted-foreground"}`}
              >
                {item.label}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-8 hidden text-xs text-muted-foreground lg:block">
          Tu progreso se guarda en cada paso.
        </p>
      </aside>
      <section className="panel p-6 sm:p-9">
        <div className="mb-7">
          <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Paso {step + 1} de 4</span>
            <span>{Math.round(((step + 1) / 4) * 100)}%</span>
          </div>
          <div className="mb-7 h-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(step + 1) * 25}%` }}
            />
          </div>
          <h2 className="text-2xl font-semibold">{current.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{current.subtitle}</p>
        </div>
        {step === 0 ? (
          <ProfileStep initial={data.profile} next={next} />
        ) : step === 1 ? (
          <SkillsStep initial={data.preferences?.technologies ?? []} next={next} back={back} />
        ) : step === 2 ? (
          <PreferencesStep initial={data.preferences} next={next} back={back} />
        ) : (
          <LinksStep initial={data.profile} back={back} />
        )}
      </section>
    </div>
  );
}
