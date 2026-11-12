import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  customType,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import type { ResumeContent } from "../../../modules/resumes/domain/resume";
const bytea = customType<{ data: Buffer; driverData: Buffer }>({ dataType: () => "bytea" });
export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    originalName: text("original_name").notNull(),
    originalType: text("original_type").notNull(),
    original: bytea("original").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("resumes_user_idx").on(t.userId)],
);
export const resumeRevisions = pgTable(
  "resume_revisions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    number: integer("number").notNull(),
    content: jsonb("content").$type<ResumeContent>().notNull(),
    latex: text("latex").notNull(),
    templateVersion: text("template_version").notNull(),
    status: text("status").$type<"review" | "compiling" | "ready" | "error">().notNull(),
    error: text("error"),
    pdf: bytea("pdf"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("resume_revision_number").on(t.resumeId, t.number)],
);
