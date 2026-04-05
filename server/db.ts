import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  applications,
  InsertApplication,
  evaluations,
  InsertEvaluation,
  certificates,
  InsertCertificate,
  evaluators,
  InsertEvaluator,
  auditLogs,
  InsertAuditLog,
  appeals,
  InsertAppeal,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Applications
export async function createApplication(input: InsertApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(applications).values(input);
  return result;
}

export async function getApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserApplications(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(applications).where(eq(applications.userId, userId));
}

export async function getPendingApplications() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(applications).where(eq(applications.status, "pending"));
}

export async function updateApplicationStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(applications).set({ status: status as any, updatedAt: new Date() }).where(eq(applications.id, id));
}

// Evaluations
export async function createEvaluation(input: InsertEvaluation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(evaluations).values(input);
}

export async function getApplicationEvaluations(applicationId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(evaluations).where(eq(evaluations.applicationId, applicationId));
}

export async function getEvaluatorPendingReviews(evaluatorId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(evaluations).where(eq(evaluations.evaluatorId, evaluatorId));
}

// Certificates
export async function createCertificate(input: InsertCertificate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(certificates).values(input);
}

export async function getCertificateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(certificates).where(eq(certificates.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCertificateByCertificateId(certificateId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(certificates).where(eq(certificates.certificateId, certificateId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserCertificates(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select()
    .from(certificates)
    .innerJoin(applications, eq(certificates.applicationId, applications.id))
    .where(eq(applications.userId, userId));
}

// Evaluators
export async function createEvaluator(input: InsertEvaluator) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(evaluators).values(input);
}

export async function getEvaluatorByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(evaluators).where(eq(evaluators.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveEvaluators() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(evaluators).where(eq(evaluators.status, "active"));
}

export async function updateEvaluatorStats(evaluatorId: number, completedCount: number, rating: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(evaluators)
    .set({ evaluationsCompleted: completedCount, approvalRating: rating as any })
    .where(eq(evaluators.id, evaluatorId));
}

// Audit Logs
export async function createAuditLog(input: InsertAuditLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(auditLogs).values(input);
}

export async function getUserAuditLogs(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId));
}

// Appeals
export async function createAppeal(input: InsertAppeal) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.insert(appeals).values(input);
}

export async function getApplicationAppeal(applicationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appeals).where(eq(appeals.applicationId, applicationId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPendingAppeals() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(appeals).where(eq(appeals.status, "pending"));
}
