-- AlterTable
ALTER TABLE "Firm" ADD COLUMN     "searchZip" TEXT;

-- CreateIndex
CREATE INDEX "Firm_searchZip_idx" ON "Firm"("searchZip");
