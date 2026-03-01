/*
  Warnings:

  - You are about to drop the column `answeredAt` on the `attempt` table. All the data in the column will be lost.
  - You are about to drop the column `presentedAt` on the `attempt` table. All the data in the column will be lost.
  - You are about to drop the column `responseMs` on the `attempt` table. All the data in the column will be lost.
  - You are about to drop the column `solved` on the `attempt` table. All the data in the column will be lost.
  - You are about to drop the column `timeToFirstCorrectMs` on the `attempt` table. All the data in the column will be lost.
  - Added the required column `expectedAnswer` to the `attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstResponseMs` to the `attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `leftOperand` to the `attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `outcome` to the `attempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `runId` to the `attempt` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "attempt_outcome" AS ENUM ('CORRECT', 'WRONG', 'TIMEOUT', 'SKIPPED');

-- AlterTable
ALTER TABLE "attempt" DROP COLUMN "answeredAt",
DROP COLUMN "presentedAt",
DROP COLUMN "responseMs",
DROP COLUMN "solved",
DROP COLUMN "timeToFirstCorrectMs",
ADD COLUMN     "expectedAnswer" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "firstResponseMs" INTEGER NOT NULL,
ADD COLUMN     "firstSubmittedAnswer" DECIMAL(65,30),
ADD COLUMN     "leftOperand" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "outcome" "attempt_outcome" NOT NULL,
ADD COLUMN     "rightOperand" DECIMAL(65,30),
ADD COLUMN     "runId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "attempt_userId_runId_createdAt_idx" ON "attempt"("userId", "runId", "createdAt");
