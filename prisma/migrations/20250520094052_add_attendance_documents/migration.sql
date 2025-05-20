-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_campaignId_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "campaignId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
