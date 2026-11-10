import { BadRequestException, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "../../../database/drizzle/drizzle.service";
import { userProfiles } from "../../../database/drizzle/schemas/profiles";
import { jobPreferences } from "../../../database/drizzle/schemas/preferences";
import { users } from "../../../database/drizzle/schemas/users";
import {
  OnboardingRepository,
  isOnboardingComplete,
  type ProfessionalProfile,
  type ProfessionalLinks,
  type JobPreferences,
} from "../domain/onboarding";
@Injectable()
export class DrizzleOnboardingRepository extends OnboardingRepository {
  constructor(private readonly database: DrizzleService) {
    super();
  }
  async get(userId: string) {
    const [profile, preferences, user] = await Promise.all([
      this.database.db.query.userProfiles.findFirst({ where: eq(userProfiles.userId, userId) }),
      this.database.db.query.jobPreferences.findFirst({ where: eq(jobPreferences.userId, userId) }),
      this.database.db.query.users.findFirst({ where: eq(users.id, userId) }),
    ]);
    return {
      profile: profile
        ? {
            professionalTitle: profile.professionalTitle ?? undefined,
            yearsOfExperience: profile.yearsOfExperience ?? undefined,
            country: profile.country ?? undefined,
            city: profile.city ?? undefined,
            bio: profile.bio ?? undefined,
            linkedinUrl: profile.linkedinUrl ?? "",
            githubUrl: profile.githubUrl ?? "",
            portfolioUrl: profile.portfolioUrl ?? "",
          }
        : null,
      preferences: preferences
        ? {
            desiredRoles: preferences.desiredRoles,
            technologies: preferences.technologies,
            preferredLocations: preferences.preferredLocations,
            modalities: preferences.modalities,
            seniority: preferences.seniority ?? "",
            minimumSalary: preferences.minimumSalary,
            currency: preferences.currency,
          }
        : null,
      completed: user?.onboardingCompleted ?? false,
    };
  }
  async saveProfile(userId: string, input: ProfessionalProfile | ProfessionalLinks) {
    await this.database.db
      .insert(userProfiles)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: { ...input, updatedAt: new Date() },
      });
  }
  async saveSkills(userId: string, technologies: string[]) {
    await this.database.db
      .insert(jobPreferences)
      .values({ userId, technologies })
      .onConflictDoUpdate({
        target: jobPreferences.userId,
        set: { technologies, updatedAt: new Date() },
      });
  }
  async savePreferences(userId: string, input: Omit<JobPreferences, "technologies">) {
    await this.database.db
      .insert(jobPreferences)
      .values({ userId, ...input })
      .onConflictDoUpdate({
        target: jobPreferences.userId,
        set: { ...input, updatedAt: new Date() },
      });
  }
  async complete(userId: string) {
    // Every step writes a complete, validated group, so subsequent edits cannot remove required fields.
    const data = await this.get(userId);
    if (!isOnboardingComplete(data))
      throw new BadRequestException(
        "Completa tu perfil, tecnologías y preferencias antes de continuar",
      );
    await this.database.db
      .update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.id, userId));
  }
}
