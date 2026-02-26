/*
  Warnings:

  - A unique constraint covering the columns `[hackathonId,trackNumber]` on the table `hackathon_problem_statements` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trackNumber` to the `hackathon_problem_statements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackTitle` to the `hackathon_problem_statements` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('SENT', 'FAILED');

-- AlterTable
ALTER TABLE "hackathon_participants" ADD COLUMN     "selectedTrack" INTEGER;

-- AlterTable
ALTER TABLE "hackathon_problem_statements" ADD COLUMN     "trackNumber" INTEGER NOT NULL,
ADD COLUMN     "trackTitle" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hostApprovedAt" TIMESTAMP(3),
ADD COLUMN     "hostRequestedAt" TIMESTAMP(3),
ADD COLUMN     "otpExpiresAt" TIMESTAMP(3),
ADD COLUMN     "otpHash" TEXT;

-- CreateTable
CREATE TABLE "email_logs" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "status" "EmailStatus" NOT NULL,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hackathon_problem_statements_hackathonId_trackNumber_key" ON "hackathon_problem_statements"("hackathonId", "trackNumber");
