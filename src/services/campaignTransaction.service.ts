import httpStatus from "http-status";
import { StageStatus } from "@prisma/client";
import prisma from "../client";
import ApiError from "../utils/api-error";
import { AuthUser } from "../types/express";
import crypto from "crypto";

const createPayment = async (campaignId: string) => {
  const campaignParticipants = await prisma.campaignParticipant.findMany({
    where: { campaignId },
    include: { campaign: { select: { name: true } } },
  });

  if (!campaignParticipants || campaignParticipants.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Campign has no Participants");
  }

  const bulkId = crypto.randomUUID();
  const name = `${campaignParticipants[0].campaign.name}Transaction`;

  // const transaction = await prisma.transa

  const fixedData = campaignParticipants.map((campaignParticipant) => {
    return {};
  });
};
