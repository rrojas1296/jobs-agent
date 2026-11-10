import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return true;
    // JSON + custom header prevents simple cross-site forms; strict Origin check covers credentialed requests.
    if (
      request.headers.origin !== this.config.getOrThrow<string>("WEB_ORIGIN") ||
      request.headers["x-requested-with"] !== "jobs-web"
    )
      throw new ForbiddenException("Origen de solicitud no permitido");
    return true;
  }
}
