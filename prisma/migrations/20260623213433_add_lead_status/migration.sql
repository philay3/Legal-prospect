-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('ACTIVE', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "SavedLead" ADD COLUMN     "status" "LeadStatus" NOT NULL DEFAULT 'ACTIVE';
