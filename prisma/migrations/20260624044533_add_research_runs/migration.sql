-- CreateEnum
CREATE TYPE "ResearchTrigger" AS ENUM ('DISCOVERY', 'SAVE', 'SCHEDULED');

-- CreateEnum
CREATE TYPE "FetchProvider" AS ENUM ('JINA', 'DIRECT', 'TAVILY');

-- CreateEnum
CREATE TYPE "CheckOutcome" AS ENUM ('SUCCESS', 'EMPTY', 'ERROR');

-- CreateTable
CREATE TABLE "ResearchRun" (
    "id" TEXT NOT NULL,
    "firmId" TEXT,
    "firmName" TEXT,
    "searchZip" TEXT,
    "trigger" "ResearchTrigger" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebsiteCheck" (
    "id" TEXT NOT NULL,
    "researchRunId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "provider" "FetchProvider" NOT NULL,
    "httpStatus" INTEGER,
    "outcome" "CheckOutcome" NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebsiteCheck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ResearchRun_firmId_idx" ON "ResearchRun"("firmId");

-- CreateIndex
CREATE INDEX "ResearchRun_searchZip_idx" ON "ResearchRun"("searchZip");

-- CreateIndex
CREATE INDEX "WebsiteCheck_researchRunId_idx" ON "WebsiteCheck"("researchRunId");

-- AddForeignKey
ALTER TABLE "ResearchRun" ADD CONSTRAINT "ResearchRun_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebsiteCheck" ADD CONSTRAINT "WebsiteCheck_researchRunId_fkey" FOREIGN KEY ("researchRunId") REFERENCES "ResearchRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
