import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { OnboardingRepository } from "./domain/onboarding";
import { DrizzleOnboardingRepository } from "./infrastructure/drizzle-onboarding.repository";
import { OnboardingController } from "./presentation/onboarding.controller";
@Module({
  imports: [AuthModule],
  controllers: [OnboardingController],
  providers: [{ provide: OnboardingRepository, useClass: DrizzleOnboardingRepository }],
})
export class OnboardingModule {}
