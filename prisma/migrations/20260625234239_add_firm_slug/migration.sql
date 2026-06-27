/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Firm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Firm" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Firm_slug_key" ON "Firm"("slug");
