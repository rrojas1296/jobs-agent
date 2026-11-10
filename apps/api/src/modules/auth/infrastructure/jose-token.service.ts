import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
import { TokenClaims, TokenService } from "../domain/session";
export const ACCESS_SECONDS = 900;
export const REFRESH_SECONDS = 60 * 60 * 24 * 30;
@Injectable()
export class JoseTokenService extends TokenService {
  private readonly secret: Uint8Array;
  constructor(config: ConfigService) {
    super();
    this.secret = new TextEncoder().encode(config.getOrThrow<string>("JWT_SECRET"));
  }
  sign(claims: TokenClaims) {
    return new SignJWT({ sid: claims.sid, kind: claims.kind })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(claims.sub)
      .setIssuer("jobs-api")
      .setAudience("jobs-web")
      .setJti(randomUUID())
      .setIssuedAt()
      .setExpirationTime(`${claims.kind === "access" ? ACCESS_SECONDS : REFRESH_SECONDS}s`)
      .sign(this.secret);
  }
  async verify(token: string, kind: TokenClaims["kind"]): Promise<TokenClaims> {
    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: ["HS256"],
        issuer: "jobs-api",
        audience: "jobs-web",
        requiredClaims: ["exp", "iat", "sub", "jti"],
      });
      if (
        payload.kind !== kind ||
        typeof payload.sub !== "string" ||
        typeof payload.sid !== "string" ||
        !/^[\da-f-]{36}$/i.test(payload.sid) ||
        !/^[\da-f-]{36}$/i.test(payload.sub)
      )
        throw new Error("Invalid claims");
      return { sub: payload.sub, sid: payload.sid, kind };
    } catch {
      throw new UnauthorizedException("Sesión inválida o expirada");
    }
  }
}
