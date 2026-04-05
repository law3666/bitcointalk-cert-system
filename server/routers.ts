import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  createApplication,
  getApplicationById,
  getUserApplications,
  getPendingApplications,
  updateApplicationStatus,
  createEvaluation,
  getApplicationEvaluations,
  getEvaluatorPendingReviews,
  createCertificate,
  getCertificateById,
  getCertificateByCertificateId,
  getUserCertificates,
  createEvaluator,
  getEvaluatorByUserId,
  getActiveEvaluators,
  updateEvaluatorStats,
  createAuditLog,
  getUserAuditLogs,
  createAppeal,
  getApplicationAppeal,
  getPendingAppeals,
  getUserByOpenId,
} from "./db";
import { TRPCError } from "@trpc/server";

/**
 * Scoring algorithm: weighted average of four dimensions
 * Technical (35%) + Quality (30%) + Helpfulness (20%) + Consistency (15%)
 */
function calculateFinalScore(evaluation: {
  technicalScore: number;
  qualityScore: number;
  helpfulnessScore: number;
  consistencyScore: number;
}): number {
  const weighted =
    evaluation.technicalScore * 0.35 +
    evaluation.qualityScore * 0.3 +
    evaluation.helpfulnessScore * 0.2 +
    evaluation.consistencyScore * 0.15;
  return Math.round((weighted / 10) * 100) / 100;
}

/**
 * Determine certification level based on final score
 */
function getCertificationLevel(score: number): "Bronze" | "Silver" | "Gold" {
  if (score >= 90) return "Gold";
  if (score >= 80) return "Silver";
  return "Bronze";
}

/**
 * Generate unique certificate ID: BT-YYYY-NNNNN
 */
function generateCertificateId(sequenceNumber: number): string {
  const year = new Date().getFullYear();
  const paddedNumber = String(sequenceNumber).padStart(5, "0");
  return `BT-${year}-${paddedNumber}`;
}

/**
 * Check if user is eligible to apply for certification
 */
async function checkEligibility(userId: number): Promise<{ eligible: boolean; reason?: string }> {
  const user = await getUserByOpenId("");
  if (!user) return { eligible: false, reason: "User not found" };

  // Check rank requirement: Sr. Member or higher
  const validRanks = ["Sr. Member", "Hero Member", "Legendary"];
  if (!validRanks.includes(user.bitcointalkRank || "")) {
    return { eligible: false, reason: "Minimum rank requirement not met (Sr. Member+)" };
  }

  // Check trust score: minimum +5
  if ((user.trustScore || 0) < 5) {
    return { eligible: false, reason: "Minimum trust score requirement not met (+5)" };
  }

  // Check application count: maximum 2
  const userApps = await getUserApplications(userId);
  if (userApps.length >= 2) {
    return { eligible: false, reason: "Maximum 2 applications per user exceeded" };
  }

  return { eligible: true };
}

/**
 * Check if user is eligible to be an evaluator
 */
async function checkEvaluatorEligibility(userId: number): Promise<{ eligible: boolean; reason?: string }> {
  const user = await getUserByOpenId("");
  if (!user) return { eligible: false, reason: "User not found" };

  // Check rank requirement: Hero Member or Legendary
  const validRanks = ["Hero Member", "Legendary"];
  if (!validRanks.includes(user.bitcointalkRank || "")) {
    return { eligible: false, reason: "Evaluator rank requirement not met (Hero/Legendary)" };
  }

  // Check years active: minimum 5 years
  if ((user.yearsActive || 0) < 5) {
    return { eligible: false, reason: "Minimum 5 years on forum required" };
  }

  // Check trust status: must be clean
  if (user.trustScore === null || user.trustScore < 0) {
    return { eligible: false, reason: "Trust status must be clean" };
  }

  return { eligible: true };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  /**
   * User Profile & Eligibility
   */
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),

    checkEligibility: protectedProcedure.query(async ({ ctx }) => {
      return await checkEligibility(ctx.user.id);
    }),

    checkEvaluatorEligibility: protectedProcedure.query(async ({ ctx }) => {
      return await checkEvaluatorEligibility(ctx.user.id);
    }),

    getEvaluatorStatus: protectedProcedure.query(async ({ ctx }) => {
      const evaluator = await getEvaluatorByUserId(ctx.user.id);
      if (!evaluator) {
        return { isEvaluator: false, status: null };
      }
      return {
        isEvaluator: true,
        status: evaluator.status,
        evaluationsCompleted: evaluator.evaluationsCompleted,
        approvalRating: evaluator.approvalRating,
      };
    }),
  }),

  /**
   * Applications
   */
  applications: router({
    create: protectedProcedure
      .input(
        z.object({
          boardCategory: z.string().min(1),
          applicationText: z.string().min(100),
          forumThreadUrl: z.string().url().optional(),
          portfolioUrl: z.string().url().optional(),
          supportingEvidence: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check eligibility
        const eligibility = await checkEligibility(ctx.user.id);
        if (!eligibility.eligible) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: eligibility.reason || "Not eligible to apply",
          });
        }

        // Create application
        await createApplication({
          userId: ctx.user.id,
          boardCategory: input.boardCategory,
          applicationText: input.applicationText,
          forumThreadUrl: input.forumThreadUrl,
          portfolioUrl: input.portfolioUrl,
          supportingEvidence: input.supportingEvidence,
          status: "pending",
          attemptCount: 1,
        });

        // Get the created application
        const userApps = await getUserApplications(ctx.user.id);
        const newApp = userApps[userApps.length - 1];

        // Log action
        if (newApp) {
          await createAuditLog({
            userId: ctx.user.id,
            action: "application_created",
            entityType: "application",
            entityId: newApp.id,
            details: `Applied for ${input.boardCategory} certification`,
          });
        }

        return { success: true, applicationId: newApp?.id || 0 };
      }),

    getMyApplications: protectedProcedure.query(async ({ ctx }) => {
      return await getUserApplications(ctx.user.id);
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getApplicationById(input.id);
      }),

    getPending: protectedProcedure.query(async ({ ctx }) => {
      // Only admins can view all pending applications
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await getPendingApplications();
    }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          status: z.enum(["pending", "approved", "rejected", "appealed"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        await updateApplicationStatus(input.applicationId, input.status);

        await createAuditLog({
          userId: ctx.user.id,
          action: "application_status_updated",
          entityType: "application",
          entityId: input.applicationId,
          details: `Status changed to ${input.status}`,
        });

        return { success: true };
      }),
  }),

  /**
   * Evaluations
   */
  evaluations: router({
    submit: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          technicalScore: z.number().min(0).max(10),
          qualityScore: z.number().min(0).max(10),
          helpfulnessScore: z.number().min(0).max(10),
          consistencyScore: z.number().min(0).max(10),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Check evaluator eligibility
        const evaluator = await getEvaluatorByUserId(ctx.user.id);
        if (!evaluator || evaluator.status !== "active") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not an active evaluator",
          });
        }

        // Create evaluation
        await createEvaluation({
          applicationId: input.applicationId,
          evaluatorId: ctx.user.id,
          technicalScore: input.technicalScore,
          qualityScore: input.qualityScore,
          helpfulnessScore: input.helpfulnessScore,
          consistencyScore: input.consistencyScore,
          comment: input.comment,
        });

        // Log action
        await createAuditLog({
          userId: ctx.user.id,
          action: "evaluation_submitted",
          entityType: "evaluation",
          entityId: input.applicationId,
          details: `Submitted evaluation for application ${input.applicationId}`,
        });

        return { success: true };
      }),

    getApplicationEvaluations: publicProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ input }) => {
        return await getApplicationEvaluations(input.applicationId);
      }),

    getMyPendingReviews: protectedProcedure.query(async ({ ctx }) => {
      const evaluator = await getEvaluatorByUserId(ctx.user.id);
      if (!evaluator) return [];
      return await getEvaluatorPendingReviews(evaluator.id);
    }),
  }),

  /**
   * Certificates
   */
  certificates: router({
    generate: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Get application and its evaluations
        const application = await getApplicationById(input.applicationId);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const evals = await getApplicationEvaluations(input.applicationId);
        if (evals.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No evaluations found for this application",
          });
        }

        // Calculate average score
        const avgScore =
          evals.reduce((sum, e) => sum + calculateFinalScore(e), 0) / evals.length;

        // Determine level
        const level = getCertificationLevel(avgScore);

        // Generate certificate ID
        const certificateId = generateCertificateId(Date.now() % 100000);

        // Create certificate
        const result = await createCertificate({
          applicationId: input.applicationId,
          certificateId,
          level,
          finalScore: avgScore as any,
          verificationUrl: `/verify/${certificateId}`,
          qrCodeUrl: `/api/qr/${certificateId}`, // Will be generated separately
          certificatePdfUrl: `/api/certificate/${certificateId}.pdf`, // Will be generated separately
        });

        // Update application status
        await updateApplicationStatus(input.applicationId, "approved");

        // Log action
        await createAuditLog({
          userId: ctx.user.id,
          action: "certificate_generated",
          entityType: "certificate",
          entityId: input.applicationId,
          details: `Generated ${level} certificate with score ${avgScore}`,
        });

        return { success: true, certificateId };
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getCertificateById(input.id);
      }),

    getByCertificateId: publicProcedure
      .input(z.object({ certificateId: z.string() }))
      .query(async ({ input }) => {
        return await getCertificateByCertificateId(input.certificateId);
      }),

    getMyCertificates: protectedProcedure.query(async ({ ctx }) => {
      return await getUserCertificates(ctx.user.id);
    }),
  }),

  /**
   * Appeals
   */
  appeals: router({
    submit: protectedProcedure
      .input(
        z.object({
          applicationId: z.number(),
          appealReason: z.string().min(50),
          newEvidence: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const application = await getApplicationById(input.applicationId);
        if (!application || application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        if (application.status !== "rejected") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Can only appeal rejected applications",
          });
        }

        // Check if already appealed
        const existingAppeal = await getApplicationAppeal(input.applicationId);
        if (existingAppeal) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Application already has an appeal",
          });
        }

        // Create appeal
        await createAppeal({
          applicationId: input.applicationId,
          userId: ctx.user.id,
          appealReason: input.appealReason,
          newEvidence: input.newEvidence,
          status: "pending",
        });

        // Update application status
        await updateApplicationStatus(input.applicationId, "appealed");

        // Log action
        await createAuditLog({
          userId: ctx.user.id,
          action: "appeal_submitted",
          entityType: "appeal",
          entityId: input.applicationId,
          details: "Submitted appeal for rejected application",
        });

        return { success: true };
      }),

    getPending: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return await getPendingAppeals();
    }),
  }),

  /**
   * Admin & Statistics
   */
  admin: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const allApps = await getPendingApplications();
      const allAppeals = await getPendingAppeals();
      const allEvaluators = await getActiveEvaluators();

      return {
        totalApplications: allApps.length,
        pendingApplications: allApps.filter((a) => a.status === "pending").length,
        totalAppeals: allAppeals.length,
        totalEvaluators: allEvaluators.length,
      };
    }),

    approveEvaluator: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const eligibility = await checkEvaluatorEligibility(input.userId);
        if (!eligibility.eligible) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: eligibility.reason,
          });
        }

        const user = await getUserByOpenId("");
        if (!user) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await createEvaluator({
          userId: input.userId,
          yearsOnForum: user.yearsActive || 0,
          trustStatus: "clean",
          status: "active",
        });

        await createAuditLog({
          userId: ctx.user.id,
          action: "evaluator_approved",
          entityType: "evaluator",
          entityId: input.userId,
          details: `Approved user ${input.userId} as evaluator`,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
