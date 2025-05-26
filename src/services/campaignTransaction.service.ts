import httpStatus from "http-status";
import { StageStatus } from "@prisma/client";
import prisma from "../client";
import ApiError from "../utils/api-error";
import { AuthUser } from "../types/express";

const createPayment = async (campaignId: string) => {
  const campaignParticipants = await prisma.campaignParticipant.findMany({
    where: { campaignId },
  });

  if (!campaignParticipants || campaignParticipants.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Campign has no Participants");
  }

  const fixedData = campaignParticipants.map((campaignParticipant) => {
    return {};
  });
};
