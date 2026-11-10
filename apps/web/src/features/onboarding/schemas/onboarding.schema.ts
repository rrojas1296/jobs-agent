import { z } from "zod";
const text = (max: number) =>
  z.string().trim().min(1, "Este campo es obligatorio").max(max, `Máximo ${max} caracteres`);
export const profileSchema = z.object({
  professionalTitle: text(120),
  yearsOfExperience: z.number({ error: "Introduce un número" }).int().min(0).max(60),
  country: text(80),
  city: text(100),
  bio: text(2000),
});
const list = z.array(text(80)).min(1, "Añade al menos una opción").max(30);
export const skillsSchema = z.object({ technologies: list });
export const preferencesSchema = z.object({
  desiredRoles: list,
  preferredLocations: list,
  modalities: z
    .array(z.enum(["Remote", "Hybrid", "Onsite"]))
    .min(1, "Selecciona una modalidad")
    .max(3),
  seniority: z.enum(["Trainee", "Junior", "Mid", "Senior", "Lead"], {
    error: "Selecciona tu nivel",
  }),
  minimumSalary: z.number().int().min(0).max(100000000).nullable(),
  currency: z.enum(["USD", "EUR", "CLP", "COP", "MXN", "PEN", "ARS"]),
});
const url = z.union([
  z.literal(""),
  z
    .url("Introduce una URL válida")
    .max(500)
    .refine((value) => ["http:", "https:"].includes(new URL(value).protocol), "Usa http o https"),
]);
export const linksSchema = z.object({ linkedinUrl: url, githubUrl: url, portfolioUrl: url });
export type ProfileInput = z.infer<typeof profileSchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
export type PreferencesInput = z.infer<typeof preferencesSchema>;
export type LinksInput = z.infer<typeof linksSchema>;
