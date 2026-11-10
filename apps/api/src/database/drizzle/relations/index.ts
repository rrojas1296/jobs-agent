import { relations } from "drizzle-orm";
import { users } from "../schemas/users";
import { sessions } from "../schemas/sessions";
import { userProfiles } from "../schemas/profiles";
import { jobPreferences } from "../schemas/preferences";
export const usersRelations = relations(users, ({ one, many }) => ({
  sessions: many(sessions),
  profile: one(userProfiles),
  preferences: one(jobPreferences),
}));
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
export const profileRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));
export const preferenceRelations = relations(jobPreferences, ({ one }) => ({
  user: one(users, { fields: [jobPreferences.userId], references: [users.id] }),
}));
