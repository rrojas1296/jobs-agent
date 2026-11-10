"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/shared/form-field";
import { Input } from "@/components/ui/input";
import { profileSchema, type ProfileInput } from "../schemas/onboarding.schema";
import { onboardingService } from "../services/onboarding.service";
import { useSaveStep } from "../hooks/use-onboarding";
import { StepActions } from "./step-actions";
import { countries } from "../data/profile-options";
export function ProfileStep({
  initial,
  next,
}: {
  initial: Partial<ProfileInput> | null;
  next: () => void;
}) {
  const save = useSaveStep(onboardingService.profile, next);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      professionalTitle: "",
      country: "",
      city: "",
      bio: "",
      yearsOfExperience: 0,
      ...initial,
    },
  });
  return (
    <form noValidate onSubmit={handleSubmit((input) => save.mutate(input))} className="space-y-5">
      <FormField
        id="professionalTitle"
        label="Título profesional"
        error={errors.professionalTitle?.message}
      >
        <Input
          id="professionalTitle"
          placeholder="Ej. Frontend Developer"
          {...register("professionalTitle")}
        />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-3">
        {(
          [
            { name: "yearsOfExperience", label: "Años de experiencia", type: "number" },
            { name: "country", label: "País", type: "text" },
            { name: "city", label: "Ciudad", type: "text" },
          ] as const
        ).map((field) => (
          <FormField
            key={field.name}
            id={field.name}
            label={field.label}
            error={errors[field.name]?.message}
          >
            {field.name === "country" ? (
              <select
                id="country"
                autoComplete="country-name"
                aria-invalid={!!errors.country}
                {...register("country")}
                className="h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 text-sm focus-visible:outline-primary aria-invalid:border-destructive"
              >
                <option value="" disabled>
                  Selecciona tu país
                </option>
                {initial?.country && !countries.includes(initial.country) ? (
                  <option value={initial.country}>{initial.country}</option>
                ) : null}
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={field.name}
                type={field.type}
                min={field.type === "number" ? 0 : undefined}
                max={field.type === "number" ? 60 : undefined}
                {...register(field.name, { valueAsNumber: field.type === "number" })}
              />
            )}
          </FormField>
        ))}
      </div>
      <FormField
        id="bio"
        label="Un poco sobre ti"
        error={errors.bio?.message}
        hint="Cuenta qué haces, qué te motiva y qué puedes aportar."
      >
        <textarea
          id="bio"
          rows={4}
          maxLength={2000}
          className="w-full resize-y rounded-lg border border-input bg-card p-3 text-sm"
          placeholder="Soy una persona apasionada por…"
          {...register("bio")}
        />
      </FormField>
      <StepActions pending={save.isPending} />
    </form>
  );
}
