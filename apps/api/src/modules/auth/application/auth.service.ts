import { Injectable, UnauthorizedException } from "@nestjs/common";
import { createHash, randomUUID } from "node:crypto";
import { UserRepository, publicUser, User } from "../../users/domain/user";
import { PasswordHasher, SessionRepository, TokenService } from "../domain/session";
import type { RegisterInput } from "./register.input";
const digest = (token: string) => createHash("sha256").update(token).digest("hex");
@Injectable()
export class AuthService {
  private readonly dummyHash: Promise<string>;
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly passwords: PasswordHasher,
    private readonly tokens: TokenService,
  ) {
    this.dummyHash = passwords.hash(randomUUID());
  }
  async register(input: RegisterInput) {
    const user = await this.users.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash: await this.passwords.hash(input.password),
    });
    return this.startSession(user);
  }
  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    // Perform the same expensive work for unknown accounts to reduce timing enumeration.
    const hash = user?.passwordHash ?? (await this.dummyHash);
    const valid = await this.passwords.verify(hash, password);
    if (!user || !valid) throw new UnauthorizedException("Correo o contraseña incorrectos");
    return this.startSession(user);
  }
  private async issue(userId: string, sessionId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokens.sign({ sub: userId, sid: sessionId, kind: "access" }),
      this.tokens.sign({ sub: userId, sid: sessionId, kind: "refresh" }),
    ]);
    return { accessToken, refreshToken };
  }
  private async startSession(user: User) {
    const id = randomUUID();
    const pair = await this.issue(user.id, id);
    await this.sessions.create({
      id,
      userId: user.id,
      refreshTokenHash: digest(pair.refreshToken),
      expiresAt: new Date(Date.now() + 30 * 86400000),
    });
    return { ...pair, user: publicUser(user) };
  }
  async refresh(token: string) {
    const claims = await this.tokens.verify(token, "refresh");
    const session = await this.sessions.find(claims.sid);
    if (
      !session ||
      session.userId !== claims.sub ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now()
    )
      throw new UnauthorizedException();
    const pair = await this.issue(claims.sub, claims.sid);
    if (!(await this.sessions.rotate(claims.sid, digest(token), digest(pair.refreshToken)))) {
      await this.sessions.revoke(claims.sid);
      throw new UnauthorizedException("Token reutilizado. Inicia sesión de nuevo");
    }
    return pair;
  }
  async authenticate(token: string) {
    const claims = await this.tokens.verify(token, "access");
    const [session, user] = await Promise.all([
      this.sessions.find(claims.sid),
      this.users.findById(claims.sub),
    ]);
    if (
      !session ||
      session.userId !== claims.sub ||
      session.revokedAt ||
      session.expiresAt.getTime() <= Date.now() ||
      !user
    )
      throw new UnauthorizedException();
    return publicUser(user);
  }
  async logout(token: string | undefined) {
    if (!token) return;
    try {
      const claims = await this.tokens.verify(token, "refresh");
      await this.sessions.revoke(claims.sid);
    } catch (error) {
      if (!(error instanceof UnauthorizedException)) throw error;
    }
  }
}
