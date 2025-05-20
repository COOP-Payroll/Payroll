-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "size" INTEGER;

-- CreateIndex
CREATE INDEX "Document_fileName_idx" ON "Document"("fileName");

-- CreateIndex
CREATE INDEX "Document_campaignId_idx" ON "Document"("campaignId");
