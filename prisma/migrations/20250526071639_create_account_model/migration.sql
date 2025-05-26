/*
  Warnings:

  - You are about to drop the column `letterId` on the `Account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_letterId_fkey";

-- DropIndex
DROP INDEX "Account_letterId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "letterId";

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "accountId" TEXT;

-- CreateIndex
CREATE INDEX "Document_accountId_idx" ON "Document"("accountId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
