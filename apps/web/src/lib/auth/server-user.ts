import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@/features/auth/types/user";
export const requireUser = cache(async (): Promise<User> => {
  const jar = await cookies();
  const response = await fetch(`${process.env.API_URL ?? "http://localhost:4000"}/auth/me`, {
    headers: { cookie: jar.toString() },
    cache: "no-store",
  });
  if (response.status === 401) redirect("/login");
  if (!response.ok) throw new Error("No se pudo obtener la sesión");
  return response.json() as Promise<User>;
});
