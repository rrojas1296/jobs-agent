"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/shared/form-field";
import { TagPicker } from "@/components/shared/tag-picker";
import { Input } from "@/components/ui/input";
import { preferencesSchema, type PreferencesInput } from "../schemas/onboarding.schema";
import { onboardingService } from "../services/onboarding.service";
import { useSaveStep } from "../hooks/use-onboarding";
import { StepActions } from "./step-actions";
import { RoleSelect } from "./role-select";
import type { OnboardingData } from "../types/onboarding";
export function PreferencesStep({
  initial,
  next,
  back,
}: {
  initial: OnboardingData["preferences"];
  next: () => void;
  back: () => void;
}) {
  const parsed = preferencesSchema.safeParse(initial);
  const save = useSaveStep(onboardingService.preferences, next);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PreferencesInput>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: parsed.success
      ? parsed.data
      : {
          desiredRoles: [],
          preferredLocations: [],
          modalities: [],
          seniority: "Mid",
          minimumSalary: null,
          currency: "USD",
        },
  });
  return (
    <form noValidate onSubmit={handleSubmit((input) => save.mutate(input))} className="space-y-5">
      <FormField
        id="desiredRoles"
        label="¿Qué roles te interesan?"
        error={errors.desiredRoles?.message}
      >
        <Controller
          name="desiredRoles"
          control={control}
          render={({ field }) => (
            <RoleSelect
              id="desiredRoles"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!errors.desiredRoles}
            />
          )}
        />
      </FormField>
      <FormField
        id="preferredLocations"
        label="Ubicaciones preferidas"
        error={errors.preferredLocations?.message}
      >
        <Controller
          name="preferredLocations"
          control={control}
          render={({ field }) => (
            <TagPicker
              id="preferredLocations"
              value={field.value}
              onChange={field.onChange}
              placeholder="Ej. Latinoamérica, Santiago…"
            />
          )}
        />
      </FormField>
      <fieldset>
        <legend className="field-label">Modalidad de trabajo</legend>
        <div className="flex flex-wrap gap-3">
          {(
            [
              { value: "Remote", label: "Remoto" },
              { value: "Hybrid", label: "Híbrido" },
              { value: "Onsite", label: "Presencial" },
            ] as const
          ).map((item) => (
            <label key={item.value} className="tag cursor-pointer gap-2 py-2.5">
              <input
                type="checkbox"
                value={item.value}
                {...register("modalities")}
                className="accent-primary"
              />
              {item.label}
            </label>
          ))}
        </div>
        {errors.modalities && (
          <p role="alert" className="field-error">
            {errors.modalities.message}
          </p>
        )}
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="seniority" label="Nivel" error={errors.seniority?.message}>
          <select
            id="seniority"
            {...register("seniority")}
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
          >
            {["Trainee", "Junior", "Mid", "Senior", "Lead"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </FormField>
        <FormField
          id="minimumSalary"
          label="Mínimo mensual (opcional)"
          error={errors.minimumSalary?.message}
        >
          <Input
            id="minimumSalary"
            type="number"
            min={0}
            placeholder="Sin mínimo"
            {...register("minimumSalary", {
              setValueAs: (v: string) => (v === "" ? null : Number(v)),
            })}
          />
        </FormField>
        <FormField id="currency" label="Moneda">
          <select
            id="currency"
            {...register("currency")}
            className="h-11 w-full rounded-lg border border-input bg-card px-3 text-sm"
          >
            {["USD", "EUR", "CLP", "COP", "MXN", "PEN", "ARS"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </FormField>
      </div>
      <StepActions pending={save.isPending} back={back} />
    </form>
  );
}
