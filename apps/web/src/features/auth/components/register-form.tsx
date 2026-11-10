"use client";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "./password-input";
import { registerSchema, type RegisterInput } from "../schemas/auth.schema";
import { useAuthenticate } from "../hooks/use-auth";
import { errorMessage } from "@/lib/api/client";
export function RegisterForm() {
  const auth = useAuthenticate("register");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  return (
    <>
      <h2 className="text-[28px] font-semibold">Dale espacio a lo que viene</h2>
      <p className="mt-2 mb-7 text-muted-foreground">
        Crea tu cuenta y cuéntanos qué estás buscando.
      </p>
      <form noValidate onSubmit={handleSubmit((input) => auth.mutate(input))} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { name: "firstName", label: "Nombre", autocomplete: "given-name" },
              { name: "lastName", label: "Apellido", autocomplete: "family-name" },
            ] as const
          ).map((field) => (
            <FormField
              key={field.name}
              id={field.name}
              label={field.label}
              error={errors[field.name]?.message}
            >
              <Input
                id={field.name}
                autoComplete={field.autocomplete}
                aria-invalid={!!errors[field.name]}
                aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
                {...register(field.name)}
              />
            </FormField>
          ))}
        </div>
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
        <FormField
          id="password"
          label="Contraseña"
          error={errors.password?.message}
          hint="8 caracteres, mayúscula, minúscula, número y símbolo."
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? "password-error" : "password-hint"}
            {...register("password")}
          />
        </FormField>
        <FormField
          id="confirmPassword"
          label="Confirma tu contraseña"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            {...register("confirmPassword")}
          />
        </FormField>
        {auth.isError && (
          <p role="alert" className="rounded-lg bg-destructive/8 p-3 text-sm text-destructive">
            {errorMessage(auth.error)}
          </p>
        )}
        <Button type="submit" disabled={auth.isPending} className="w-full">
          {auth.isPending ? <Loader2 className="animate-spin" /> : null}
          {auth.isPending ? "Creando cuenta…" : "Crear mi cuenta"}
          <ArrowRight />
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}
