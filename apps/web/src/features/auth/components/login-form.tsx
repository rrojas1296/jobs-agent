"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "./password-input";
import { loginSchema, type LoginInput } from "../schemas/auth.schema";
import { useAuthenticate } from "../hooks/use-auth";
import { errorMessage } from "@/lib/api/client";
export function LoginForm() {
  const auth = useAuthenticate("login");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  return (
    <>
      <h2 className="text-[28px] font-semibold">Qué bueno verte de nuevo</h2>
      <p className="mt-2 mb-8 text-muted-foreground">
        Entra a tu espacio y continúa donde lo dejaste.
      </p>
      <form noValidate onSubmit={handleSubmit((input) => auth.mutate(input))} className="space-y-5">
        <FormField id="email" label="Correo electrónico" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
        </FormField>
        <FormField id="password" label="Contraseña" error={errors.password?.message}>
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="Tu contraseña"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
        </FormField>
        {auth.isError && (
          <p role="alert" className="rounded-lg bg-destructive/8 p-3 text-sm text-destructive">
            {errorMessage(auth.error)}
          </p>
        )}
        <Button type="submit" disabled={auth.isPending} className="mt-2 w-full">
          {auth.isPending ? <Loader2 className="animate-spin" /> : null}
          {auth.isPending ? "Entrando…" : "Iniciar sesión"}
          <ArrowRight />
        </Button>
      </form>
      <p className="mt-7 text-center text-sm text-muted-foreground">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Crea tu cuenta
        </Link>
      </p>
    </>
  );
}
