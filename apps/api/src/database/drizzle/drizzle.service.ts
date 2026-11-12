import { Injectable, OnModuleDestroy, Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as users from "./schemas/users";
import * as sessions from "./schemas/sessions";
import * as profiles from "./schemas/profiles";
import * as preferences from "./schemas/preferences";
import * as resumes from "./schemas/resumes";
import * as relations from "./relations";
@Injectable()
export class DrizzleService implements OnModuleDestroy {
  private readonly pool: Pool;
  readonly db;
  constructor(config: ConfigService) {
    this.pool = new Pool({ connectionString: config.getOrThrow<string>("DATABASE_URL"), max: 10 });
    this.db = drizzle(this.pool, {
      schema: { ...users, ...sessions, ...profiles, ...preferences, ...resumes, ...relations },
    });
  }
  async onModuleDestroy() {
    await this.pool.end();
  }
}
@Global()
@Module({ providers: [DrizzleService], exports: [DrizzleService] })
export class DatabaseModule {}
