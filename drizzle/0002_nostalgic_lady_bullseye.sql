ALTER TABLE `appeals` MODIFY COLUMN `reviewedAt` datetime;--> statement-breakpoint
ALTER TABLE `certificates` MODIFY COLUMN `expiresAt` datetime;--> statement-breakpoint
ALTER TABLE `evaluators` MODIFY COLUMN `suspendedAt` datetime;