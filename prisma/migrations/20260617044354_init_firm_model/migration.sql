-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('HIGH', 'MEDIUM', 'LOW', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('CANDIDATE', 'PENDING_REVIEW', 'VERIFIED', 'REJECTED', 'STALE');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('BAR_DIRECTORY', 'GOOGLE_MAPS', 'WEB_SCRAPE', 'MANUAL', 'MANUAL_SEED');

-- CreateTable
CREATE TABLE "Firm" (
    "id" TEXT NOT NULL,
    "firmName" TEXT NOT NULL,
    "zip" TEXT NOT NULL,
    "zipExt" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "streetAddress" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "practiceAreas" TEXT[],
    "attorneyCountRange" TEXT NOT NULL,
    "attorneys" TEXT[],
    "sourceType" "SourceType" NOT NULL,
    "sourceUrl" TEXT,
    "confidenceLevel" "ConfidenceLevel" NOT NULL DEFAULT 'UNKNOWN',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'CANDIDATE',
    "lastCheckedDate" TIMESTAMP(3),
    "globalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Firm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Firm_zip_idx" ON "Firm"("zip");

-- CreateIndex
CREATE INDEX "Firm_city_state_idx" ON "Firm"("city", "state");
