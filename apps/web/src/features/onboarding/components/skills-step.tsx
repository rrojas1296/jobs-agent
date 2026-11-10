"use client";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "@/components/shared/form-field";
import { TagPicker } from "@/components/shared/tag-picker";
import { skillsSchema, type SkillsInput } from "../schemas/onboarding.schema";
import { onboardingService } from "../services/onboarding.service";
import { useSaveStep } from "../hooks/use-onboarding";
import { StepActions } from "./step-actions";
const technologies = [
  "React",
  "TypeScript",
  "JavaScript",
  "Next.js",
  "Node.js",
  "Python",
  "Java",
  "PostgreSQL",
  "SQL",
  "Docker",
  "AWS",
  "Figma",
  "Vue",
  "Angular",
  "C#",
  "Go",
];
export function SkillsStep({
  initial,
  next,
  back,
}: {
  initial: string[];
  next: () => void;
  back: () => void;
}) {
  const save = useSaveStep(onboardingService.skills, next);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillsInput>({
    resolver: zodResolver(skillsSchema),
    defaultValues: { technologies: initial },
  });
  return (
    <form noValidate onSubmit={handleSubmit((input) => save.mutate(input))}>
      <FormField
        id="technologies"
        label="Tus tecnologías y herramientas"
        error={errors.technologies?.message}
      >
        <Controller
          name="technologies"
          control={control}
          render={({ field }) => (
            <TagPicker
              id="technologies"
              value={field.value}
              onChange={field.onChange}
              suggestions={technologies}
              placeholder="Buscar o añadir una tecnología…"
            />
          )}
        />
      </FormField>
      <StepActions pending={save.isPending} back={back} />
    </form>
  );
}
