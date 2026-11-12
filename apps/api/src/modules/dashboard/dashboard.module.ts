import { Controller, Get, Module, Req, UseGuards, ForbiddenException } from "@nestjs/common";
import { count, eq } from "drizzle-orm";
import { DrizzleService } from "../../database/drizzle/drizzle.service";
import { resumes } from "../../database/drizzle/schemas/resumes";
import { AuthModule } from "../auth/auth.module";
import { AuthGuard, type AuthRequest } from "../auth/presentation/auth.guard";
@Controller("dashboard")
@UseGuards(AuthGuard)
class DashboardController {
  constructor(private readonly database: DrizzleService) {}
  @Get() async get(@Req() req: AuthRequest) {
    if (!req.user.onboardingCompleted) throw new ForbiddenException("Completa el onboarding");
    const [row] = await this.database.db
      .select({ total: count() })
      .from(resumes)
      .where(eq(resumes.userId, req.user.id));
    return {
      statistics: { found: 0, compatible: 0, applications: 0, resumes: row?.total ?? 0 },
      activity: [],
    };
  }
}
@Module({ imports: [AuthModule], controllers: [DashboardController] })
export class DashboardModule {}
