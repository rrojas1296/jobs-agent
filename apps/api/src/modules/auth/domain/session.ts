export interface Session {
  id: string;
  userId: string;
  refreshTokenHash: string;
  expiresAt: Date;
  revokedAt: Date | null;
}
export abstract class SessionRepository {
  abstract create(session: Omit<Session, "revokedAt">): Promise<void>;
  abstract find(id: string): Promise<Session | undefined>;
  abstract rotate(id: string, previousHash: string, nextHash: string): Promise<boolean>;
  abstract revoke(id: string): Promise<void>;
}
export abstract class PasswordHasher {
  abstract hash(password: string): Promise<string>;
  abstract verify(hash: string, password: string): Promise<boolean>;
}
export interface TokenClaims {
  sub: string;
  sid: string;
  kind: "access" | "refresh";
}
export abstract class TokenService {
  abstract sign(claims: TokenClaims): Promise<string>;
  abstract verify(token: string, kind: TokenClaims["kind"]): Promise<TokenClaims>;
}
