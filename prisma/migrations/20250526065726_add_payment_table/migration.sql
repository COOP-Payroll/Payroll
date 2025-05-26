/*
  Warnings:

  - You are about to drop the column `transactionId` on the `CampaignTransaction` table. All the data in the column will be lost.
  - You are about to drop the `Transaction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `paymentId` to the `CampaignTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "CampaignTransaction" DROP CONSTRAINT "CampaignTransaction_transactionId_fkey";

-- AlterTable
ALTER TABLE "CampaignTransaction" DROP COLUMN "transactionId",
ADD COLUMN     "paymentId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Transaction";

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bulkId" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CampaignTransaction" ADD CONSTRAINT "CampaignTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
