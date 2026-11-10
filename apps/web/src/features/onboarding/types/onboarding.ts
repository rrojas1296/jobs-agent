import type { ProfileInput, LinksInput, PreferencesInput } from "../schemas/onboarding.schema";
export interface OnboardingData {
  profile: Partial<ProfileInput & LinksInput> | null;
  preferences:
    | (Omit<PreferencesInput, "seniority"> & { seniority: string; technologies: string[] })
    | null;
  completed: boolean;
}
