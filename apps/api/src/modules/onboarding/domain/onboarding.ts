export interface ProfessionalProfile {
  professionalTitle: string;
  yearsOfExperience: number;
  country: string;
  city: string;
  bio: string;
}
export interface ProfessionalLinks {
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}
export interface JobPreferences {
  desiredRoles: string[];
  technologies: string[];
  preferredLocations: string[];
  modalities: ("Remote" | "Hybrid" | "Onsite")[];
  seniority: string;
  minimumSalary: number | null;
  currency: string;
}
export interface OnboardingData {
  profile: Partial<ProfessionalProfile & ProfessionalLinks> | null;
  preferences: JobPreferences | null;
  completed: boolean;
}
export function isOnboardingComplete(data: OnboardingData): boolean {
  const p = data.profile;
  const j = data.preferences;
  return !!(
    p?.professionalTitle?.trim() &&
    p.country?.trim() &&
    p.city?.trim() &&
    p.bio?.trim() &&
    typeof p.yearsOfExperience === "number" &&
    p.yearsOfExperience >= 0 &&
    j?.technologies.length &&
    j.desiredRoles.length &&
    j.modalities.length &&
    j.preferredLocations.length &&
    j.seniority
  );
}
export abstract class OnboardingRepository {
  abstract get(userId: string): Promise<OnboardingData>;
  abstract saveProfile(
    userId: string,
    input: ProfessionalProfile | ProfessionalLinks,
  ): Promise<void>;
  abstract saveSkills(userId: string, technologies: string[]): Promise<void>;
  abstract savePreferences(
    userId: string,
    input: Omit<JobPreferences, "technologies">,
  ): Promise<void>;
  abstract complete(userId: string): Promise<void>;
}
