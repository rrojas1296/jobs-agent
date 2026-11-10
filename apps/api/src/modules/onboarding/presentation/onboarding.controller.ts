import { Body, Controller, Get, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { AuthGuard, type AuthRequest } from "../../auth/presentation/auth.guard";
import { ZodPipe } from "../../../common/zod.pipe";
import { OnboardingRepository } from "../domain/onboarding";
import { profileSchema, linksSchema, preferencesSchema, skillsSchema } from "./onboarding.schemas";
@Controller("onboarding")
@UseGuards(AuthGuard)
export class OnboardingController {
  constructor(private readonly onboarding: OnboardingRepository) {}
  @Get() get(@Req() req: AuthRequest) {
    return this.onboarding.get(req.user.id);
  }
  @Patch("profile") async profile(
    @Req() req: AuthRequest,
    @Body(new ZodPipe(profileSchema)) input: z.infer<typeof profileSchema>,
  ) {
    await this.onboarding.saveProfile(req.user.id, input);
    return this.onboarding.get(req.user.id);
  }
  @Patch("links") async links(
    @Req() req: AuthRequest,
    @Body(new ZodPipe(linksSchema)) input: z.infer<typeof linksSchema>,
  ) {
    await this.onboarding.saveProfile(req.user.id, input);
    return this.onboarding.get(req.user.id);
  }
  @Patch("skills") async skills(
    @Req() req: AuthRequest,
    @Body(new ZodPipe(skillsSchema)) input: z.infer<typeof skillsSchema>,
  ) {
    await this.onboarding.saveSkills(req.user.id, input.technologies);
    return this.onboarding.get(req.user.id);
  }
  @Patch("preferences") async preferences(
    @Req() req: AuthRequest,
    @Body(new ZodPipe(preferencesSchema)) input: z.infer<typeof preferencesSchema>,
  ) {
    await this.onboarding.savePreferences(req.user.id, input);
    return this.onboarding.get(req.user.id);
  }
  @Post("complete") async complete(@Req() req: AuthRequest) {
    await this.onboarding.complete(req.user.id);
    return this.onboarding.get(req.user.id);
  }
}
