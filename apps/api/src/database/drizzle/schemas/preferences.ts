import { sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  varchar,
  timestamp,
  check,
} from "drizzle-orm/pg-core";
import { users } from "./users";
export const modality = pgEnum("modality", ["Remote", "Hybrid", "Onsite"]);
export const jobPreferences = pgTable(
  "job_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    desiredRoles: text("desired_roles").array().default([]).notNull(),
    technologies: text("technologies").array().default([]).notNull(),
    preferredLocations: text("preferred_locations").array().default([]).notNull(),
    modalities: modality("modalities").array().default([]).notNull(),
    seniority: varchar("seniority", { length: 40 }),
    minimumSalary: integer("minimum_salary"),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [check("salary_positive", sql`${table.minimumSalary} >= 0`)],
);
