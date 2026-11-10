import { api } from "@/lib/api/client";
import type { OnboardingData } from "../types/onboarding";
import type {
  ProfileInput,
  LinksInput,
  PreferencesInput,
  SkillsInput,
} from "../schemas/onboarding.schema";
export const onboardingService = {
  get: async () => (await api.get<OnboardingData>("/onboarding")).data,
  profile: async (input: ProfileInput) =>
    (await api.patch<OnboardingData>("/onboarding/profile", input)).data,
  skills: async (input: SkillsInput) =>
    (await api.patch<OnboardingData>("/onboarding/skills", input)).data,
  preferences: async (input: PreferencesInput) =>
    (await api.patch<OnboardingData>("/onboarding/preferences", input)).data,
  finish: async (input: LinksInput) => {
    await api.patch("/onboarding/links", input);
    return (await api.post<OnboardingData>("/onboarding/complete")).data;
  },
};
