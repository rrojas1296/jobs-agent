"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { onboardingService } from "../services/onboarding.service";
import type { OnboardingData } from "../types/onboarding";
import { errorMessage } from "@/lib/api/client";
export function useOnboarding() {
  return useQuery({ queryKey: ["onboarding"], queryFn: onboardingService.get });
}
export function useSaveStep<T>(
  save: (input: T) => Promise<OnboardingData>,
  next: () => void,
  complete = false,
) {
  const client = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: save,
    onSuccess: (data) => {
      client.setQueryData(["onboarding"], data);
      toast.success(complete ? "¡Tu perfil está listo!" : "Progreso guardado");
      if (complete) {
        void client.invalidateQueries({ queryKey: ["auth", "me"] });
        router.replace("/dashboard");
        router.refresh();
      } else next();
    },
    onError: (error) => toast.error(errorMessage(error)),
  });
}
