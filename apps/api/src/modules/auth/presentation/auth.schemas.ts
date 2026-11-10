import { z } from "zod";
export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(128)
  .regex(/[A-Z]/, "Incluye una mayúscula")
  .regex(/[a-z]/, "Incluye una minúscula")
  .regex(/[0-9]/, "Incluye un número")
  .regex(/[^A-Za-z0-9\s]/, "Incluye un carácter especial");
export const loginSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z.string().min(1).max(128),
});
export const registerSchema = loginSchema
  .extend({
    firstName: z.string().trim().min(1).max(80),
    lastName: z.string().trim().min(1).max(80),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });
export type RegisterInput = z.infer<typeof registerSchema>;
