import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";
import { AuthService } from "../application/auth.service";
import type { PublicUser } from "../../users/domain/user";
export type AuthRequest = Request & { user: PublicUser };
export function readCookie(request: Request, name: string): string | undefined {
  const cookies: unknown = request.cookies;
  if (!cookies || typeof cookies !== "object" || !(name in cookies)) return undefined;
  const value: unknown = Reflect.get(cookies, name);
  return typeof value === "string" ? value : undefined;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = readCookie(request, "access_token");
    if (!token) throw new UnauthorizedException();
    request.user = await this.auth.authenticate(token);
    return true;
  }
}
