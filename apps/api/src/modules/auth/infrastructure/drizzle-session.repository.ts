import { Injectable } from "@nestjs/common";
import { and, eq, gt, isNull } from "drizzle-orm";
import { DrizzleService } from "../../../database/drizzle/drizzle.service";
import { sessions } from "../../../database/drizzle/schemas/sessions";
import { Session, SessionRepository } from "../domain/session";
@Injectable()
export class DrizzleSessionRepository extends SessionRepository {
  constructor(private readonly database: DrizzleService) {
    super();
  }
  async create(session: Omit<Session, "revokedAt">) {
    await this.database.db.insert(sessions).values(session);
  }
  find(id: string) {
    return this.database.db.query.sessions.findFirst({ where: eq(sessions.id, id) });
  }
  async rotate(id: string, previousHash: string, nextHash: string) {
    const result = await this.database.db
      .update(sessions)
      .set({ refreshTokenHash: nextHash })
      .where(
        and(
          eq(sessions.id, id),
          eq(sessions.refreshTokenHash, previousHash),
          isNull(sessions.revokedAt),
          gt(sessions.expiresAt, new Date()),
        ),
      )
      .returning({ id: sessions.id });
    return result.length === 1;
  }
  async revoke(id: string) {
    await this.database.db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, id));
  }
}
