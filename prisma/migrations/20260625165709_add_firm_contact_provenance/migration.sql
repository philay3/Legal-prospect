-- AlterTable
ALTER TABLE "Firm" ADD COLUMN     "emailConfidence" DOUBLE PRECISION,
ADD COLUMN     "emailSource" "DataPointSource",
ADD COLUMN     "phoneConfidence" DOUBLE PRECISION,
ADD COLUMN     "phoneSource" "DataPointSource";
