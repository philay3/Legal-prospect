-- CreateTable
CREATE TABLE "PracticeArea" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PracticeArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirmPracticeArea" (
    "firmId" TEXT NOT NULL,
    "practiceAreaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FirmPracticeArea_pkey" PRIMARY KEY ("firmId","practiceAreaId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeArea_name_key" ON "PracticeArea"("name");

-- CreateIndex
CREATE INDEX "FirmPracticeArea_practiceAreaId_idx" ON "FirmPracticeArea"("practiceAreaId");

-- AddForeignKey
ALTER TABLE "FirmPracticeArea" ADD CONSTRAINT "FirmPracticeArea_firmId_fkey" FOREIGN KEY ("firmId") REFERENCES "Firm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FirmPracticeArea" ADD CONSTRAINT "FirmPracticeArea_practiceAreaId_fkey" FOREIGN KEY ("practiceAreaId") REFERENCES "PracticeArea"("id") ON DELETE CASCADE ON UPDATE CASCADE;
