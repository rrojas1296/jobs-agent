import { z } from "zod";
const text = (max: number) => z.string().trim().min(1, "Campo obligatorio").max(max);
const items = z
  .array(text(80))
  .min(1, "Selecciona al menos una opción")
  .max(30)
  .transform((values) => [...new Set(values)]);
export const profileSchema = z.object({
  professionalTitle: text(120),
  yearsOfExperience: z.number().int().min(0).max(60),
  country: text(80),
  city: text(100),
  bio: text(2000),
});
const url = z.union([
  z.literal(""),
  z
    .url()
    .max(500)
    .refine(
      (value) => ["https:", "http:"].includes(new URL(value).protocol),
      "Usa una URL http o https",
    ),
]);
export const linksSchema = z.object({ linkedinUrl: url, githubUrl: url, portfolioUrl: url });
export const skillsSchema = z.object({ technologies: items });
export const preferencesSchema = z.object({
  desiredRoles: items,
  preferredLocations: items,
  modalities: z
    .array(z.enum(["Remote", "Hybrid", "Onsite"]))
    .min(1)
    .max(3),
  seniority: z.enum(["Trainee", "Junior", "Mid", "Senior", "Lead"]),
  minimumSalary: z.number().int().min(0).max(100000000).nullable(),
  currency: z.enum(["USD", "EUR", "CLP", "COP", "MXN", "PEN", "ARS"]),
});
