import { Module } from "@nestjs/common";
import { UserRepository } from "../users/domain/user";
import { DrizzleUserRepository } from "../users/infrastructure/drizzle-user.repository";
import { PasswordHasher, SessionRepository, TokenService } from "./domain/session";
import { ArgonPasswordHasher } from "./infrastructure/argon-password.hasher";
import { DrizzleSessionRepository } from "./infrastructure/drizzle-session.repository";
import { JoseTokenService } from "./infrastructure/jose-token.service";
import { AuthService } from "./application/auth.service";
import { AuthController } from "./presentation/auth.controller";
import { AuthGuard } from "./presentation/auth.guard";
@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    { provide: UserRepository, useClass: DrizzleUserRepository },
    { provide: SessionRepository, useClass: DrizzleSessionRepository },
    { provide: PasswordHasher, useClass: ArgonPasswordHasher },
    { provide: TokenService, useClass: JoseTokenService },
  ],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
