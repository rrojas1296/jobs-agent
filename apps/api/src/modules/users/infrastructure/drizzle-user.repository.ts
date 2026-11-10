import { Injectable, ConflictException } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DrizzleService } from "../../../database/drizzle/drizzle.service";
import { users } from "../../../database/drizzle/schemas/users";
import { UserRepository, NewUser } from "../domain/user";
@Injectable()
export class DrizzleUserRepository extends UserRepository {
  constructor(private readonly database: DrizzleService) {
    super();
  }
  findByEmail(email: string) {
    return this.database.db.query.users.findFirst({ where: eq(users.email, email) });
  }
  findById(id: string) {
    return this.database.db.query.users.findFirst({ where: eq(users.id, id) });
  }
  async create(data: NewUser) {
    const [user] = await this.database.db
      .insert(users)
      .values(data)
      .onConflictDoNothing({ target: users.email })
      .returning();
    if (!user) throw new ConflictException("Este correo ya está registrado");
    return user;
  }
}
