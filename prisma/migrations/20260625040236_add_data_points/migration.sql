-- CreateEnum
CREATE TYPE "DataField" AS ENUM ('EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "DataPointSource" AS ENUM ('FIRM_DOMAIN', 'OFF_DOMAIN', 'GENERIC_PROVIDER', 'UNVERIFIED', 'PLACES', 'WEBSITE');

-- CreateTable
CREATE TABLE "DataPoint" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "field" "DataField" NOT NULL,
    "value" TEXT NOT NULL,
    "source" "DataPointSource" NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "observedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DataPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataPoint_firmId_field_idx" ON "DataPoint"("firmId", "field");

-- AddForeignKey
ALTER TABLE "DataPoint" ADD CONSTRAINT "DataPoint_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
