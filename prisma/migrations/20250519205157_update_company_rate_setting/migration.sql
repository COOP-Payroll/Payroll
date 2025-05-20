/*
  Warnings:

  - You are about to drop the column `amount` on the `CampaignParticipant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CampaignParticipant" DROP COLUMN "amount",
ADD COLUMN     "numberOfDaysInRural" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "numberOfDaysInUrban" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "RateSetting" (
    "id" TEXT NOT NULL,
    "urbanRate" DOUBLE PRECISION NOT NULL,
    "ruralRate" DOUBLE PRECISION NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RateSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RateSetting_companyId_key" ON "RateSetting"("companyId");

-- AddForeignKey
ALTER TABLE "RateSetting" ADD CONSTRAINT "RateSetting_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
