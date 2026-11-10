"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authService } from "../services/auth.service";
import type { User } from "../types/user";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
export function useUser(initialData?: User) {
  return useQuery({ queryKey: ["auth", "me"], queryFn: authService.me, initialData });
}
export function useAuthenticate(mode: "login" | "register") {
  const router = useRouter();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput | RegisterInput) =>
      mode === "register" ? authService.register(input as RegisterInput) : authService.login(input),
    onSuccess: (user) => {
      client.clear();
      client.setQueryData(["auth", "me"], user);
      router.replace(user.onboardingCompleted ? "/dashboard" : "/onboarding");
      router.refresh();
    },
  });
}
export function useLogout() {
  const client = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      client.clear();
      router.replace("/login");
      router.refresh();
    },
  });
}
