"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { linksSchema, type LinksInput } from "../schemas/onboarding.schema";
import { onboardingService } from "../services/onboarding.service";
import { useSaveStep } from "../hooks/use-onboarding";
import { StepActions } from "./step-actions";
export function LinksStep({
  initial,
  back,
}: {
  initial: Partial<LinksInput> | null;
  back: () => void;
}) {
  const save = useSaveStep(onboardingService.finish, () => {}, true);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LinksInput>({
    resolver: zodResolver(linksSchema),
    defaultValues: {
      linkedinUrl: initial?.linkedinUrl ?? "",
      githubUrl: initial?.githubUrl ?? "",
      portfolioUrl: initial?.portfolioUrl ?? "",
    },
  });
  return (
    <form noValidate onSubmit={handleSubmit((input) => save.mutate(input))} className="space-y-5">
      {(
        [
          {
            name: "linkedinUrl",
            label: "LinkedIn",
            placeholder: "https://linkedin.com/in/tu-perfil",
          },
          { name: "githubUrl", label: "GitHub", placeholder: "https://github.com/tu-usuario" },
          { name: "portfolioUrl", label: "Portfolio", placeholder: "https://tu-sitio.com" },
        ] as const
      ).map((field) => (
        <FormField
          key={field.name}
          id={field.name}
          label={`${field.label} (opcional)`}
          error={errors[field.name]?.message}
        >
          <Input
            id={field.name}
            type="url"
            placeholder={field.placeholder}
            {...register(field.name)}
          />
        </FormField>
      ))}
      <div className="rounded-lg border border-primary/15 bg-primary/5 p-4 text-sm text-muted-foreground">
        Todo listo. Tus preferencias te ayudarán a organizar tu búsqueda. Puedes dejar estos enlaces
        vacíos.
      </div>
      <StepActions pending={save.isPending} back={back} last />
    </form>
  );
}
