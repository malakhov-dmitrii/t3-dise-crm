import { InferSelectModel, relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  json,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { customAlphabet, nanoid } from "nanoid";
import { type AdapterAccount } from "next-auth/adapters";

const nid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 8);

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => name);

export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  firstName: varchar("first_name", { length: 255 }),
  lastName: varchar("last_name", { length: 255 }),
  image: varchar("image", { length: 255 }),
  telegramUserId: text("telegram_user_id"),
  telegramUsername: varchar("telegram_username", { length: 255 }),
  chatId: text("chat_id"),

  language: varchar("language", { length: 255 }).default("en"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),

  // NOTE: Need this for NextAuth adapter to work
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  workspaces: many(workspaces),
  workspaceUsers: many(workspaceUsers),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    userIdIdx: index("account_user_id_idx").on(account.userId),
  }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (session) => ({
    userIdIdx: index("session_user_id_idx").on(session.userId),
  }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    verified: boolean("verified").notNull().default(false),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  }),
);

/**
 * Core tables
 */

export const workspaces = createTable("workspace", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => nid()),
  name: text("name"),
  adminId: varchar("admin_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  thumbnailUrl: text("thumbnail_url"),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
  admin: one(users, { fields: [workspaces.adminId], references: [users.id] }),
  workspaceUsers: many(workspaceUsers),
  workspacePipelines: many(workspacePipelines),
  workspaceChats: many(workspaceChats),
}));

export const workspaceUsers = createTable("workspace_user", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: varchar("workspace_id", { length: 255 })
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  syncedFolders: json("synced_folders").$type<string[]>(),
  invitedBy: varchar("invited_by", { length: 255 }).references(() => users.id),
  role: varchar("role", { length: 255 })
    .$type<"admin" | "user">()
    .default("user"),
});

export const workspaceUsersRelations = relations(workspaceUsers, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceUsers.workspaceId],
    references: [workspaces.id],
  }),
  user: one(users, { fields: [workspaceUsers.userId], references: [users.id] }),
}));

export const workspacePipelines = createTable("workspace_pipeline", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspaceId: varchar("workspace_id", { length: 255 })
    .notNull()
    .references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name"),
  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export const workspacePipelinesRelations = relations(
  workspacePipelines,
  ({ one, many }) => ({
    workspace: one(workspaces, {
      fields: [workspacePipelines.workspaceId],
      references: [workspaces.id],
    }),
    workspacePipelineStages: many(workspacePipelineStages),
  }),
);

export const workspacePipelineStages = createTable("workspace_pipeline_stage", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  workspacePipelineId: varchar("workspace_pipeline_id", { length: 255 })
    .notNull()
    .references(() => workspacePipelines.id, { onDelete: "cascade" }),

  name: text("name"),
  order: integer("order").default(0),
  color: varchar("color", { length: 255 }),

  closedWon: boolean("closed_won").default(false),
  closedLost: boolean("closed_lost").default(false),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
});

export const workspacePipelineStagesRelations = relations(
  workspacePipelineStages,
  ({ one, many }) => ({
    workspacePipeline: one(workspacePipelines, {
      fields: [workspacePipelineStages.workspacePipelineId],
      references: [workspacePipelines.id],
    }),
  }),
);

export const workspaceChats = createTable("workspace_chat", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => nid()),
  workspaceId: varchar("workspace_id", { length: 255 })
    .notNull()
    .references(() => workspaces.id),
  telegramChatId: text("telegram_chat_id").notNull(),
  name: text("name"),
  type: varchar("type", { length: 255 }),
  lastMessageAt: timestamp("last_message_at", {
    mode: "date",
    withTimezone: true,
  }),

  pipelineId: varchar("pipeline_id", { length: 255 }).references(
    () => workspacePipelines.id,
  ),
  pipelineStageId: varchar("pipeline_stage_id", { length: 255 }).references(
    () => workspacePipelineStages.id,
  ),

  createdAt: timestamp("created_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  createdBy: varchar("created_by", { length: 255 }).references(() => users.id),
  updatedBy: varchar("updated_by", { length: 255 }).references(() => users.id),
});

export const workspaceChatsRelations = relations(workspaceChats, ({ one }) => ({
  workspace: one(workspaces, {
    fields: [workspaceChats.workspaceId],
    references: [workspaces.id],
  }),
  pipeline: one(workspacePipelines, {
    fields: [workspaceChats.pipelineId],
    references: [workspacePipelines.id],
  }),
  createdBy: one(users, {
    fields: [workspaceChats.createdBy],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [workspaceChats.updatedBy],
    references: [users.id],
  }),
}));

export type ChatItem = InferSelectModel<typeof workspaceChats>;
