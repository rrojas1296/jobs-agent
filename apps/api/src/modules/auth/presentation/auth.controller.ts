import { Body, Controller, Get, Post, Req, Res, UseGuards, HttpCode } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response, CookieOptions } from "express";
import { AuthService } from "../application/auth.service";
import { AuthGuard, AuthRequest, readCookie } from "./auth.guard";
import { loginSchema, registerSchema, RegisterInput } from "./auth.schemas";
import { ZodPipe } from "../../../common/zod.pipe";
import { ACCESS_SECONDS, REFRESH_SECONDS } from "../infrastructure/jose-token.service";
@Controller("auth")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}
  private options(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get("COOKIE_SECURE") === "true",
      sameSite: this.config.getOrThrow<"lax" | "strict" | "none">("COOKIE_SAME_SITE"),
      path: "/",
    };
  }
  private setCookies(response: Response, pair: { accessToken: string; refreshToken: string }) {
    response.cookie("access_token", pair.accessToken, {
      ...this.options(),
      maxAge: ACCESS_SECONDS * 1000,
    });
    response.cookie("refresh_token", pair.refreshToken, {
      ...this.options(),
      maxAge: REFRESH_SECONDS * 1000,
    });
    response.setHeader("Cache-Control", "no-store");
  }
  @Post("register")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async register(
    @Body(new ZodPipe(registerSchema)) input: RegisterInput,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.register(input);
    this.setCookies(response, result);
    return result.user;
  }
  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async login(
    @Body(new ZodPipe(loginSchema)) input: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.auth.login(input.email, input.password);
    this.setCookies(response, result);
    return result.user;
  }
  @Post("refresh")
  @HttpCode(204)
  async refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const result = await this.auth.refresh(readCookie(request, "refresh_token") ?? "");
    this.setCookies(response, result);
  }
  @Post("logout")
  @HttpCode(204)
  async logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    await this.auth.logout(readCookie(request, "refresh_token"));
    response.clearCookie("access_token", this.options());
    response.clearCookie("refresh_token", this.options());
  }
  @Get("me")
  @UseGuards(AuthGuard)
  me(@Req() request: AuthRequest) {
    return request.user;
  }
}
