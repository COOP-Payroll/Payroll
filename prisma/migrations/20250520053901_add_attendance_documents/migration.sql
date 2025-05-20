-- AlterTable
ALTER TABLE "CampaignParticipant" ADD COLUMN     "ruralRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "urbanRate" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "campaignParticipantId" TEXT;

-- AlterTable
ALTER TABLE "RateSetting" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Document_campaignParticipantId_idx" ON "Document"("campaignParticipantId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_campaignParticipantId_fkey" FOREIGN KEY ("campaignParticipantId") REFERENCES "CampaignParticipant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
