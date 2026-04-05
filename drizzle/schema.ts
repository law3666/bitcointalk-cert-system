import { datetime, decimal, int, longtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";
/**
 * Core user table backing auth flow.
 * Extended with Bitcointalk-specific fields for certification system.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "evaluator"]).default("user").notNull(),
  bitcointalkUsername: varchar("bitcointalkUsername", { length: 128 }).unique(),
  bitcointalkRank: varchar("bitcointalkRank", { length: 64 }),
  trustScore: int("trustScore").default(0),
  yearsActive: int("yearsActive").default(0),
  profileUrl: varchar("profileUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Certification applications submitted by users.
 */
export const applications = mysqlTable("applications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  boardCategory: varchar("boardCategory", { length: 128 }).notNull(),
  applicationText: longtext("applicationText").notNull(),
  forumThreadUrl: varchar("forumThreadUrl", { length: 512 }),
  portfolioUrl: varchar("portfolioUrl", { length: 512 }),
  supportingEvidence: longtext("supportingEvidence"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "appealed"]).default("pending").notNull(),
  attemptCount: int("attemptCount").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

/**
 * Individual evaluator scores for each application.
 */
export const evaluations = mysqlTable("evaluations", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  evaluatorId: int("evaluatorId").notNull(),
  technicalScore: int("technicalScore").notNull(),
  qualityScore: int("qualityScore").notNull(),
  helpfulnessScore: int("helpfulnessScore").notNull(),
  consistencyScore: int("consistencyScore").notNull(),
  comment: longtext("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Evaluation = typeof evaluations.$inferSelect;
export type InsertEvaluation = typeof evaluations.$inferInsert;

/**
 * Issued certificates for approved applications.
 */
export const certificates = mysqlTable("certificates", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull().unique(),
  certificateId: varchar("certificateId", { length: 64 }).notNull().unique(),
  level: mysqlEnum("level", ["Bronze", "Silver", "Gold"]).notNull(),
  finalScore: decimal("finalScore", { precision: 5, scale: 2 }).notNull(),
  verificationUrl: varchar("verificationUrl", { length: 512 }),
  qrCodeUrl: varchar("qrCodeUrl", { length: 512 }),
  certificatePdfUrl: varchar("certificatePdfUrl", { length: 512 }),
 issuedAt: timestamp("issuedAt").defaultNow().notNull(),
 expiresAt: datetime("expiresAt"), 
});

export type Certificate = typeof certificates.$inferSelect;
export type InsertCertificate = typeof certificates.$inferInsert;

/**
 * Tracks evaluator eligibility and status.
 */
export const evaluators = mysqlTable("evaluators", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  yearsOnForum: int("yearsOnForum").notNull(),
  trustStatus: varchar("trustStatus", { length: 64 }).default("clean"),
  evaluationsCompleted: int("evaluationsCompleted").default(0),
  approvalRating: decimal("approvalRating", { precision: 3, scale: 2 }).default("0"),
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  approvedAt: timestamp("approvedAt").defaultNow(),
  suspendedAt: datetime("suspendedAt"),  // ← Changed from timestamp to datetime
});

export type Evaluator = typeof evaluators.$inferSelect;
export type InsertEvaluator = typeof evaluators.$inferInsert;

/**
 * Tracks all system actions for compliance and monitoring.
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entityType", { length: 64 }),
  entityId: int("entityId"),
  details: longtext("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Tracks appeals for rejected applications.
 */
export const appeals = mysqlTable("appeals", {
  id: int("id").autoincrement().primaryKey(),
  applicationId: int("applicationId").notNull(),
  userId: int("userId").notNull(),
  appealReason: longtext("appealReason").notNull(),
  newEvidence: longtext("newEvidence"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: longtext("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: datetime("reviewedAt"),  // ← Changed from timestamp to datetime
});

export type Appeal = typeof appeals.$inferSelect;
export type InsertAppeal = typeof appeals.$inferInsert;

/**
 * Relations for type safety and convenience.
 */
export const usersRelations = relations(users, ({ many, one }) => ({
  applications: many(applications),
  evaluations: many(evaluations),
  evaluator: one(evaluators),
  auditLogs: many(auditLogs),
}));

export const applicationsRelations = relations(applications, ({ one, many }) => ({
  user: one(users, { fields: [applications.userId], references: [users.id] }),
  evaluations: many(evaluations),
  certificate: one(certificates),
  appeals: many(appeals),
}));

export const evaluationsRelations = relations(evaluations, ({ one }) => ({
  application: one(applications, { fields: [evaluations.applicationId], references: [applications.id] }),
  evaluator: one(users, { fields: [evaluations.evaluatorId], references: [users.id] }),
}));

export const certificatesRelations = relations(certificates, ({ one }) => ({
  application: one(applications, { fields: [certificates.applicationId], references: [applications.id] }),
}));

export const evaluatorsRelations = relations(evaluators, ({ one }) => ({
  user: one(users, { fields: [evaluators.userId], references: [users.id] }),
}));

export const appealsRelations = relations(appeals, ({ one }) => ({
  application: one(applications, { fields: [appeals.applicationId], references: [applications.id] }),
  user: one(users, { fields: [appeals.userId], references: [users.id] }),
}));