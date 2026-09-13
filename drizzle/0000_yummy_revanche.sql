CREATE TYPE "public"."attempt_outcome" AS ENUM('CORRECT', 'WRONG', 'TIMEOUT', 'SKIPPED');--> statement-breakpoint
CREATE TYPE "public"."domain" AS ENUM('ADD', 'MUL', 'SUB', 'DIV');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp (3),
	"refreshTokenExpiresAt" timestamp (3),
	"scope" text,
	"password" text,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"username" text,
	"displayUsername" text,
	"isAnonymous" boolean,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attempt" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"patternId" text NOT NULL,
	"runId" text NOT NULL,
	"domain" "domain" NOT NULL,
	"presentedLevel" integer NOT NULL,
	"seed" integer NOT NULL,
	"outcome" "attempt_outcome" NOT NULL,
	"firstSubmittedAnswer" numeric(65, 30),
	"firstResponseMs" integer NOT NULL,
	"leftOperand" numeric(65, 30) NOT NULL,
	"rightOperand" numeric(65, 30),
	"expectedAnswer" numeric(65, 30) NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pattern" (
	"id" text PRIMARY KEY NOT NULL,
	"domain" "domain" NOT NULL,
	"level" integer NOT NULL,
	"description" text NOT NULL,
	"params" jsonb NOT NULL,
	"cutoffTimeMs" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_domain_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"domain" "domain" NOT NULL,
	"currentLevel" integer DEFAULT 1 NOT NULL,
	"highestUnlockedLevel" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_patternId_pattern_id_fk" FOREIGN KEY ("patternId") REFERENCES "public"."pattern"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_domain_progress" ADD CONSTRAINT "user_domain_progress_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "session" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "verification_identifier_idx" ON "verification" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "attempt_userId_createdAt_idx" ON "attempt" USING btree ("userId","createdAt");--> statement-breakpoint
CREATE INDEX "attempt_userId_runId_createdAt_idx" ON "attempt" USING btree ("userId","runId","createdAt");--> statement-breakpoint
CREATE INDEX "attempt_userId_patternId_createdAt_idx" ON "attempt" USING btree ("userId","patternId","createdAt");--> statement-breakpoint
CREATE INDEX "attempt_patternId_createdAt_idx" ON "attempt" USING btree ("patternId","createdAt");--> statement-breakpoint
CREATE INDEX "attempt_userId_domain_presentedLevel_createdAt_idx" ON "attempt" USING btree ("userId","domain","presentedLevel","createdAt");--> statement-breakpoint
CREATE UNIQUE INDEX "pattern_domain_level_description_key" ON "pattern" USING btree ("domain","level","description");--> statement-breakpoint
CREATE UNIQUE INDEX "user_domain_progress_userId_domain_key" ON "user_domain_progress" USING btree ("userId","domain");--> statement-breakpoint
INSERT INTO "pattern" (id, domain, level, description, params, "cutoffTimeMs", active, "createdAt", "updatedAt")
VALUES
  -- ADD
  (gen_random_uuid()::text, 'ADD'::"domain", 1,  '1-digit + 1-digit, no carry',       '{"operation":"ADD","leftDigits":1,"rightDigits":1,"carryCount":0}',  4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 2,  '1-digit + 1-digit, with carry',      '{"operation":"ADD","leftDigits":1,"rightDigits":1,"carryCount":1}',  4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 3,  '1-digit + 2-digit, no carry',        '{"operation":"ADD","leftDigits":1,"rightDigits":2,"carryCount":0}',  4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 4,  '1-digit + 2-digit, with carry',      '{"operation":"ADD","leftDigits":1,"rightDigits":2,"carryCount":1}',  4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 5,  '2-digit + 2-digit, no carry',        '{"operation":"ADD","leftDigits":2,"rightDigits":2,"carryCount":0}',  5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 6,  '2-digit + 2-digit, one carry',       '{"operation":"ADD","leftDigits":2,"rightDigits":2,"carryCount":1}',  5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 7,  '2-digit + 2-digit, two carries',     '{"operation":"ADD","leftDigits":2,"rightDigits":2,"carryCount":2}',  5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 8,  '2-digit + 3-digit, no carry',        '{"operation":"ADD","leftDigits":2,"rightDigits":3,"carryCount":0}',  5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 9,  '2-digit + 3-digit, one carry',       '{"operation":"ADD","leftDigits":2,"rightDigits":3,"carryCount":1}',  6000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'ADD'::"domain", 10, '3-digit + 3-digit, no carry',        '{"operation":"ADD","leftDigits":3,"rightDigits":3,"carryCount":0}',  6000, true, NOW(), NOW()),
  -- MUL
  (gen_random_uuid()::text, 'MUL'::"domain", 1,  '1-digit x 1-digit, no carry',        '{"operation":"MUL","leftDigits":1,"rightDigits":1,"carryCount":0}',  4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 2,  '1-digit x 1-digit, with carry',      '{"operation":"MUL","leftDigits":1,"rightDigits":1,"carryCount":1}',  4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 3,  '1-digit x 2-digit, no carry',        '{"operation":"MUL","leftDigits":1,"rightDigits":2,"carryCount":0}',  4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 4,  '1-digit x 2-digit, with carry',      '{"operation":"MUL","leftDigits":1,"rightDigits":2,"carryCount":1}',  4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 5,  '1-digit x 2-digit, two carries',     '{"operation":"MUL","leftDigits":1,"rightDigits":2,"carryCount":2}',  5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 6,  '1-digit x 3-digit, no carry',        '{"operation":"MUL","leftDigits":1,"rightDigits":3,"carryCount":0}',  5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 7,  '1-digit x 3-digit, one carry',       '{"operation":"MUL","leftDigits":1,"rightDigits":3,"carryCount":1}',  5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 8,  '1-digit x 3-digit, two carries',     '{"operation":"MUL","leftDigits":1,"rightDigits":3,"carryCount":2}',  5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 9,  '1-digit x 3-digit, three carries',   '{"operation":"MUL","leftDigits":1,"rightDigits":3,"carryCount":3}',  6000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'MUL'::"domain", 10, '2-digit x 2-digit, no carry',        '{"operation":"MUL","leftDigits":2,"rightDigits":2,"carryCount":0}',  6000, true, NOW(), NOW()),
  -- SUB
  (gen_random_uuid()::text, 'SUB'::"domain", 1,  '1-digit - 1-digit, non-negative (no borrow possible)', '{"operation":"SUB","leftDigits":1,"rightDigits":1,"borrowCount":0,"allowNegative":false}', 4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 2,  '2-digit - 1-digit, no borrow',       '{"operation":"SUB","leftDigits":2,"rightDigits":1,"borrowCount":0,"allowNegative":false}', 4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 3,  '2-digit - 1-digit, with borrow (single)', '{"operation":"SUB","leftDigits":2,"rightDigits":1,"borrowCount":1,"allowNegative":false}', 4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 4,  '2-digit - 2-digit, no borrow',       '{"operation":"SUB","leftDigits":2,"rightDigits":2,"borrowCount":0,"allowNegative":false}', 5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 5,  '2-digit - 2-digit, with borrow (single)', '{"operation":"SUB","leftDigits":2,"rightDigits":2,"borrowCount":1,"allowNegative":false}', 5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 6,  '3-digit - 1-digit, no borrow',       '{"operation":"SUB","leftDigits":3,"rightDigits":1,"borrowCount":0,"allowNegative":false}', 5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 7,  '3-digit - 1-digit, with borrow (single)', '{"operation":"SUB","leftDigits":3,"rightDigits":1,"borrowCount":1,"allowNegative":false}', 5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 8,  '3-digit - 2-digit, no borrow',       '{"operation":"SUB","leftDigits":3,"rightDigits":2,"borrowCount":0,"allowNegative":false}', 5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 9,  '3-digit - 2-digit, with borrow (single)', '{"operation":"SUB","leftDigits":3,"rightDigits":2,"borrowCount":1,"allowNegative":false}', 6000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'SUB'::"domain", 10, '3-digit - 3-digit, no borrow',       '{"operation":"SUB","leftDigits":3,"rightDigits":3,"borrowCount":0,"allowNegative":false}', 6000, true, NOW(), NOW()),
  -- DIV
  (gen_random_uuid()::text, 'DIV'::"domain", 1,  '1-digit / 1-digit, exact integer (1-digit quotient)',   '{"operation":"DIV","dividendDigits":1,"divisorDigits":1,"exactInteger":true,"quotientDigits":1}', 4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 2,  '2-digit / 1-digit, exact integer (1-digit quotient)',   '{"operation":"DIV","dividendDigits":2,"divisorDigits":1,"exactInteger":true,"quotientDigits":1}', 4000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 3,  '2-digit / 1-digit, exact integer (2-digit quotient)',   '{"operation":"DIV","dividendDigits":2,"divisorDigits":1,"exactInteger":true,"quotientDigits":2}', 4500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 4,  '2-digit / 2-digit, exact integer (1-digit quotient)',   '{"operation":"DIV","dividendDigits":2,"divisorDigits":2,"exactInteger":true,"quotientDigits":1}', 5000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 5,  '3-digit / 1-digit, exact integer (2-digit quotient)',   '{"operation":"DIV","dividendDigits":3,"divisorDigits":1,"exactInteger":true,"quotientDigits":2}', 5500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 6,  '3-digit / 1-digit, exact integer (3-digit quotient)',   '{"operation":"DIV","dividendDigits":3,"divisorDigits":1,"exactInteger":true,"quotientDigits":3}', 6000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 7,  '3-digit / 2-digit, exact integer (1-digit quotient)',   '{"operation":"DIV","dividendDigits":3,"divisorDigits":2,"exactInteger":true,"quotientDigits":1}', 6500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 8,  '3-digit / 2-digit, exact integer (2-digit quotient)',   '{"operation":"DIV","dividendDigits":3,"divisorDigits":2,"exactInteger":true,"quotientDigits":2}', 7000, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 9,  '4-digit / 2-digit, exact integer (2-digit quotient)',   '{"operation":"DIV","dividendDigits":4,"divisorDigits":2,"exactInteger":true,"quotientDigits":2}', 7500, true, NOW(), NOW()),
  (gen_random_uuid()::text, 'DIV'::"domain", 10, '4-digit / 2-digit, exact integer (3-digit quotient)',   '{"operation":"DIV","dividendDigits":4,"divisorDigits":2,"exactInteger":true,"quotientDigits":3}', 8000, true, NOW(), NOW())
ON CONFLICT (domain, level, description) DO UPDATE SET
  "cutoffTimeMs" = EXCLUDED."cutoffTimeMs",
  params         = EXCLUDED.params,
  active         = EXCLUDED.active,
  "updatedAt"    = NOW();