# Bitcointalk Certification System - Database Schema Design

## Core Tables

### users
Extended from default template to include Bitcointalk-specific fields.

| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY | Surrogate key |
| openId | VARCHAR(64) UNIQUE | Manus OAuth identifier |
| name | TEXT | User's display name |
| email | VARCHAR(320) | User email |
| bitcointalkUsername | VARCHAR(128) UNIQUE | Bitcointalk forum username |
| bitcointalkRank | VARCHAR(64) | Current forum rank (Newbie, Jr. Member, etc.) |
| trustScore | INT | Positive trust score on forum |
| yearsActive | INT | Years active on forum |
| profileUrl | VARCHAR(512) | Link to Bitcointalk profile |
| role | ENUM('user', 'admin', 'evaluator') | User role |
| createdAt | TIMESTAMP | Account creation time |
| updatedAt | TIMESTAMP | Last update time |
| lastSignedIn | TIMESTAMP | Last login time |

### applications
Tracks certification applications submitted by users.

| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY | Application ID |
| userId | INT FOREIGN KEY | Reference to users.id |
| boardCategory | VARCHAR(128) | Expertise area (e.g., "Mining", "Technical") |
| applicationText | LONGTEXT | User's application statement |
| forumThreadUrl | VARCHAR(512) | Link to forum discussion thread |
| portfolioUrl | VARCHAR(512) | Link to contribution portfolio |
| supportingEvidence | LONGTEXT | Additional evidence/links |
| status | ENUM('pending', 'approved', 'rejected', 'appealed') | Application status |
| attemptCount | INT DEFAULT 1 | Number of resubmissions |
| createdAt | TIMESTAMP | Submission date |
| updatedAt | TIMESTAMP | Last update date |

### evaluations
Individual evaluator scores for each application.

| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY | Evaluation ID |
| applicationId | INT FOREIGN KEY | Reference to applications.id |
| evaluatorId | INT FOREIGN KEY | Reference to users.id (evaluator) |
| technicalScore | INT (0-10) | Technical knowledge score |
| qualityScore | INT (0-10) | Contribution quality score |
| helpfulnessScore | INT (0-10) | Helpfulness score |
| consistencyScore | INT (0-10) | Consistency score |
| comment | LONGTEXT | Evaluator feedback |
| createdAt | TIMESTAMP | Evaluation submission date |

### certificates
Issued certificates for approved applications.

| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY | Certificate ID |
| applicationId | INT FOREIGN KEY | Reference to applications.id |
| certificateId | VARCHAR(64) UNIQUE | Unique certificate code (e.g., BT-2026-0001) |
| level | ENUM('Bronze', 'Silver', 'Gold') | Certification level |
| finalScore | DECIMAL(5,2) | Final weighted score |
| verificationUrl | VARCHAR(512) | Public verification link |
| qrCodeUrl | VARCHAR(512) | QR code image URL |
| certificatePdfUrl | VARCHAR(512) | PDF certificate URL |
| issuedAt | TIMESTAMP | Issuance date |
| expiresAt | TIMESTAMP | Expiration date (optional) |

### evaluators
Tracks evaluator eligibility and status.

| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY | Evaluator ID |
| userId | INT FOREIGN KEY | Reference to users.id |
| yearsOnForum | INT | Years active on Bitcointalk |
| trustStatus | VARCHAR(64) | Trust status (clean, flagged, etc.) |
| evaluationsCompleted | INT DEFAULT 0 | Number of evaluations done |
| approvalRating | DECIMAL(3,2) | Average approval rating |
| status | ENUM('active', 'inactive', 'suspended') | Evaluator status |
| approvedAt | TIMESTAMP | Date approved as evaluator |
| suspendedAt | TIMESTAMP | Date suspended (if applicable) |

### auditLogs
Tracks all system actions for compliance and monitoring.

| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY | Log ID |
| userId | INT FOREIGN KEY | User who performed action |
| action | VARCHAR(128) | Action type (apply, evaluate, certify, etc.) |
| entityType | VARCHAR(64) | Entity affected (application, certificate, etc.) |
| entityId | INT | ID of affected entity |
| details | LONGTEXT | Additional context |
| createdAt | TIMESTAMP | Log timestamp |

### appeals
Tracks appeals for rejected applications.

| Column | Type | Description |
|--------|------|-------------|
| id | INT PRIMARY KEY | Appeal ID |
| applicationId | INT FOREIGN KEY | Reference to applications.id |
| userId | INT FOREIGN KEY | User submitting appeal |
| appealReason | LONGTEXT | Reason for appeal |
| newEvidence | LONGTEXT | Additional evidence |
| status | ENUM('pending', 'approved', 'rejected') | Appeal status |
| adminNotes | LONGTEXT | Admin review notes |
| createdAt | TIMESTAMP | Appeal submission date |
| reviewedAt | TIMESTAMP | Admin review date |

## Relationships

```
users (1) ──→ (many) applications
users (1) ──→ (many) evaluations (as evaluator)
users (1) ──→ (many) auditLogs
users (1) ──→ (1) evaluators

applications (1) ──→ (many) evaluations
applications (1) ──→ (1) certificates
applications (1) ──→ (many) appeals

evaluations ──→ users (evaluator)
```

## Indexing Strategy

- `users.bitcointalkUsername` - Unique index for forum account lookup
- `applications.userId` - Index for user's applications
- `applications.status` - Index for filtering by status
- `evaluations.applicationId` - Index for application's evaluations
- `evaluations.evaluatorId` - Index for evaluator's assignments
- `certificates.certificateId` - Unique index for verification
- `auditLogs.userId` - Index for user action history
- `auditLogs.createdAt` - Index for time-based queries

## Design Notes

1. **Scoring**: Each evaluation stores individual dimension scores (0-10). Final score is calculated as weighted average: (technical×0.35 + quality×0.30 + helpfulness×0.20 + consistency×0.15) / 10 × 100

2. **Certification Levels**: 
   - Bronze: 70-79 points
   - Silver: 80-89 points
   - Gold: 90-100 points

3. **Evaluator Assignment**: Applications should be assigned to 3-5 evaluators for consensus-based evaluation.

4. **Certificate ID Format**: `BT-YYYY-NNNNN` where YYYY is year and NNNNN is sequential number.

5. **Audit Trail**: All critical actions (apply, evaluate, certify, reject, appeal) are logged for transparency and compliance.
