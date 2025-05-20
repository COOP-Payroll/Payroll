/*
  Warnings:

  - You are about to drop the column `accountNumber` on the `CampaignParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `address` on the `CampaignParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `CampaignParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `CampaignParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `CampaignParticipant` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `CampaignParticipant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CampaignParticipant" DROP COLUMN "accountNumber",
DROP COLUMN "address",
DROP COLUMN "fullName",
DROP COLUMN "gender",
DROP COLUMN "paymentMethod",
DROP COLUMN "phoneNumber";
