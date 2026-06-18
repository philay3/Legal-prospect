-- CreateTable
CREATE TABLE "Attorney" (
    "id" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attorney_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Attorney_firmId_idx" ON "Attorney"("firmId");

-- CreateIndex
CREATE UNIQUE INDEX "Attorney_firmId_name_key" ON "Attorney"("firmId", "name");

-- AddForeignKey
ALTER TABLE "Attorney" ADD CONSTRAINT "Attorney_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;
