/*
  Warnings:

  - You are about to drop the column `name` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `CampaignTransaction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[bulkId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `debitAccount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participantId` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- DropForeignKey
ALTER TABLE "CampaignTransaction" DROP CONSTRAINT "CampaignTransaction_paymentId_fkey";

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "name",
ADD COLUMN     "debitAccount" TEXT NOT NULL,
ADD COLUMN     "participantId" TEXT NOT NULL,
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL;

-- DropTable
DROP TABLE "CampaignTransaction";

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "creditAccount" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "transactionId" TEXT,
    "failureReason" TEXT,
    "paymentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_orderId_key" ON "CreditTransaction"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bulkId_key" ON "Payment"("bulkId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "CampaignParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
