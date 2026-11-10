import { z } from "zod";
export const loginSchema = z.object({
  email: z.email("Introduce un correo válido").max(254),
  password: z.string().min(1, "Introduce tu contraseña").max(128),
});
export const registerSchema = loginSchema
  .extend({
    firstName: z.string().trim().min(1, "Introduce tu nombre").max(80),
    lastName: z.string().trim().min(1, "Introduce tu apellido").max(80),
    password: z
      .string()
      .min(8, "Mínimo 8 caracteres")
      .max(128)
      .regex(/[A-Z]/, "Incluye una mayúscula")
      .regex(/[a-z]/, "Incluye una minúscula")
      .regex(/[0-9]/, "Incluye un número")
      .regex(/[^A-Za-z0-9\s]/, "Incluye un carácter especial"),
    confirmPassword: z.string(),
  })
  .refine((input) => input.password === input.confirmPassword, {
    path: ["confirmPassword"],
    message: "Las contraseñas no coinciden",
  });
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
