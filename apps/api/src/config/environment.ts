import { z } from "zod";
const environmentSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(4000),
    DATABASE_URL: z.url(),
    WEB_ORIGIN: z.url(),
    JWT_SECRET: z.string().min(32),
    COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
    COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
  })
  .superRefine((env, ctx) => {
    if (
      (env.NODE_ENV === "production" || env.COOKIE_SAME_SITE === "none") &&
      env.COOKIE_SECURE !== "true"
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Production and SameSite=None require secure cookies",
      });
    }
    if (env.NODE_ENV === "production" && env.JWT_SECRET.includes("replace-with")) {
      ctx.addIssue({ code: "custom", message: "Set a random production JWT_SECRET" });
    }
  });
export function validateEnvironment(input: Record<string, unknown>) {
  return environmentSchema.parse(input);
}
