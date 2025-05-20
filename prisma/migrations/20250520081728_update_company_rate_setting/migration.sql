/*
  Warnings:

  - Added the required column `accountNumber` to the `CampaignParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `CampaignParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `CampaignParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `CampaignParticipant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `CampaignParticipant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CampaignParticipant" ADD COLUMN     "accountNumber" TEXT NOT NULL,
ADD COLUMN     "address" TEXT,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
