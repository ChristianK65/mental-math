import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { domainEnum, attemptOutcomeEnum } from "./enums";
import { users } from "./auth";

export const patterns = pgTable(
  "pattern",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    domain: domainEnum("domain").notNull(),
    level: integer("level").notNull(),
    description: text("description").notNull(),
    params: jsonb("params").notNull(),
    cutoffTimeMs: integer("cutoffTimeMs").notNull(),
    active: boolean("active").default(true).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("pattern_domain_level_description_key").on(
      table.domain,
      table.level,
      table.description
    ),
  ]
);

export const attempts = pgTable(
  "attempt",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    patternId: text("patternId")
      .notNull()
      .references(() => patterns.id, { onDelete: "cascade" }),
    runId: text("runId").notNull(),
    domain: domainEnum("domain").notNull(),
    presentedLevel: integer("presentedLevel").notNull(),
    seed: integer("seed").notNull(),
    outcome: attemptOutcomeEnum("outcome").notNull(),
    firstSubmittedAnswer: numeric("firstSubmittedAnswer", { precision: 65, scale: 30 }),
    firstResponseMs: integer("firstResponseMs").notNull(),
    leftOperand: numeric("leftOperand", { precision: 65, scale: 30 }).notNull(),
    rightOperand: numeric("rightOperand", { precision: 65, scale: 30 }),
    expectedAnswer: numeric("expectedAnswer", { precision: 65, scale: 30 }).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("attempt_userId_createdAt_idx").on(table.userId, table.createdAt),
    index("attempt_userId_runId_createdAt_idx").on(table.userId, table.runId, table.createdAt),
    index("attempt_userId_patternId_createdAt_idx").on(
      table.userId,
      table.patternId,
      table.createdAt
    ),
    index("attempt_patternId_createdAt_idx").on(table.patternId, table.createdAt),
    index("attempt_userId_domain_presentedLevel_createdAt_idx").on(
      table.userId,
      table.domain,
      table.presentedLevel,
      table.createdAt
    ),
  ]
);

export const userDomainProgress = pgTable(
  "user_domain_progress",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    domain: domainEnum("domain").notNull(),
    currentLevel: integer("currentLevel").default(1).notNull(),
    highestUnlockedLevel: integer("highestUnlockedLevel").default(1).notNull(),
    createdAt: timestamp("createdAt", { precision: 3, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { precision: 3, mode: "date" }).notNull(),
  },
  (table) => [
    uniqueIndex("user_domain_progress_userId_domain_key").on(table.userId, table.domain),
  ]
);

export type Pattern = typeof patterns.$inferSelect;
export type NewPattern = typeof patterns.$inferInsert;
export type Attempt = typeof attempts.$inferSelect;
export type NewAttempt = typeof attempts.$inferInsert;
export type UserDomainProgress = typeof userDomainProgress.$inferSelect;
export type NewUserDomainProgress = typeof userDomainProgress.$inferInsert;
