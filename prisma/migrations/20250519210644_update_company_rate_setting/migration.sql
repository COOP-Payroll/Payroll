/*
  Warnings:

  - You are about to drop the `CampaignParticipantMetric` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetricRate` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CampaignParticipantMetric" DROP CONSTRAINT "CampaignParticipantMetric_campaignParticipantId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignParticipantMetric" DROP CONSTRAINT "CampaignParticipantMetric_metricRateId_fkey";

-- DropTable
DROP TABLE "CampaignParticipantMetric";

-- DropTable
DROP TABLE "MetricRate";
