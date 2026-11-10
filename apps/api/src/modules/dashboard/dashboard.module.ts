import { Controller, Get, Module, Req, UseGuards, ForbiddenException } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AuthGuard, type AuthRequest } from "../auth/presentation/auth.guard";
@Controller("dashboard")
@UseGuards(AuthGuard)
class DashboardController {
  @Get() get(@Req() req: AuthRequest) {
    if (!req.user.onboardingCompleted) throw new ForbiddenException("Completa el onboarding");
    // No job integrations exist yet. Demo cards are kept separate in the frontend.
    return { statistics: { found: 0, compatible: 0, applications: 0, resumes: 0 }, activity: [] };
  }
}
@Module({ imports: [AuthModule], controllers: [DashboardController] })
export class DashboardModule {}
