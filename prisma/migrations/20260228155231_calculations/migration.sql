-- CreateEnum
CREATE TYPE "domain" AS ENUM ('ADD', 'MUL', 'SUB', 'DIV');

-- CreateTable
CREATE TABLE "pattern" (
    "id" TEXT NOT NULL,
    "domain" "domain" NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "params" JSONB NOT NULL,
    "cutoffTimeMs" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pattern_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "patternId" TEXT NOT NULL,
    "domain" "domain" NOT NULL,
    "presentedLevel" INTEGER NOT NULL,
    "seed" INTEGER NOT NULL,
    "solved" BOOLEAN NOT NULL,
    "timeToFirstCorrectMs" INTEGER,
    "presentedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),
    "responseMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_domain_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "domain" "domain" NOT NULL,
    "currentLevel" INTEGER NOT NULL DEFAULT 1,
    "highestUnlockedLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_domain_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pattern_domain_level_description_key" ON "pattern"("domain", "level", "description");

-- CreateIndex
CREATE INDEX "attempt_userId_createdAt_idx" ON "attempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "attempt_userId_patternId_createdAt_idx" ON "attempt"("userId", "patternId", "createdAt");

-- CreateIndex
CREATE INDEX "attempt_patternId_createdAt_idx" ON "attempt"("patternId", "createdAt");

-- CreateIndex
CREATE INDEX "attempt_userId_domain_presentedLevel_createdAt_idx" ON "attempt"("userId", "domain", "presentedLevel", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "user_domain_progress_userId_domain_key" ON "user_domain_progress"("userId", "domain");

-- AddForeignKey
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attempt" ADD CONSTRAINT "attempt_patternId_fkey" FOREIGN KEY ("patternId") REFERENCES "pattern"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_domain_progress" ADD CONSTRAINT "user_domain_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
