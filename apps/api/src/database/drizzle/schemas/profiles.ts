import { sql } from "drizzle-orm";
import { pgTable, uuid, varchar, text, integer, timestamp, check } from "drizzle-orm/pg-core";
import { users } from "./users";
export const userProfiles = pgTable(
  "user_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    professionalTitle: varchar("professional_title", { length: 120 }),
    bio: text("bio"),
    yearsOfExperience: integer("years_of_experience"),
    country: varchar("country", { length: 80 }),
    city: varchar("city", { length: 100 }),
    linkedinUrl: text("linkedin_url"),
    githubUrl: text("github_url"),
    portfolioUrl: text("portfolio_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [check("experience_range", sql`${table.yearsOfExperience} between 0 and 60`)],
);
