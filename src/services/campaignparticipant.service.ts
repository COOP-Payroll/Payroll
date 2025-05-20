import prisma from "../client";
import ApiError from "../utils/api-error";
import httpStatus from "http-status";
import mime from "mime-types";
import path from "path";
import { CampaignParticipantInput } from "../types/participant.types";

const registerCampaignParticipant = async (data: CampaignParticipantInput) => {
  const {
    campaignId,
    numberOfDaysInUrban,
    numberOfDaysInRural,
    fullName,
    gender,
    address,
    phoneNumber,
    accountNumber,
    paymentMethod,
    companyId,
    detail,
    files, // ✅ Access files from data
  } = data;

  return await prisma.$transaction(async (tx) => {
    // Check for existing participant with same full name under same campaign
    const existing = await tx.participant.findFirst({
      where: {
        fullName,
        campaignParticipants: {
          some: { campaignId },
        },
      },
    });

    if (existing) {
      throw new ApiError(
        httpStatus.CONFLICT,
        "Participant already registered for this campaign"
      );
    }

    // Get rate settings
    const rateSetting = await tx.rateSetting.findUnique({
      where: { companyId },
    });

    if (!rateSetting) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Rate setting not found for the provided company"
      );
    }

    const urbanRate = rateSetting.urbanRate;
    const ruralRate = rateSetting.ruralRate;

    const totalAmount =
      urbanRate * Number(numberOfDaysInUrban) +
      ruralRate * Number(numberOfDaysInRural);

    // Create participant
    const participant = await tx.participant.create({
      data: {
        fullName,
        gender,
        address,
        phoneNumber,
        accountNumber,
        paymentMethod,
        companyId,
        detail,
      },
    });

    // Create campaign participant record
    const campaignParticipant = await tx.campaignParticipant.create({
      data: {
        campaignId,
        participantId: participant.id,
        numberOfDaysInUrban: Number(numberOfDaysInUrban),
        numberOfDaysInRural: Number(numberOfDaysInRural),
        urbanRate,
        ruralRate,
        totalAmount,
      },
    });
    console.log("filesddd");
    console.log(files);
    console.log(files?.length); // Upload documents
    if (files?.length) {
      await Promise.all(
        files.map((file) =>
          tx.document.create({
            data: {
              fileName: file.originalname,
              filePath: path.basename(file.path),
              mimeType:
                file.mimetype || mime.lookup(file.originalname) || undefined,
              size: file.size,
              campaignParticipantId: campaignParticipant.id,
              campaignId: campaignParticipant.campaignId,
            },
          })
        )
      );
    }

    return await tx.campaignParticipant.findUnique({
      where: { id: campaignParticipant.id },
      include: {
        participant: true,
        documents: true,
        campaign: true,
      },
    });
  });
};

const getParticipantsByCampaignId = async (campaignId: string) => {
  return await prisma.campaignParticipant.findMany({
    where: { campaignId },
    include: {
      participant: true,
      documents: true,
    },
  });
};

const getAllPublishedCampaigns = async () => {
  return await prisma.campaignParticipant.findMany({
    where: { isPublished: true },
    include: { documents: true },
  });
};

const getAllApprovedCampaigns = async () => {
  return await prisma.campaignParticipant.findMany({
    where: { approvalStatus: "APPROVED" },
    include: { documents: true },
  });
};

export default {
  registerCampaignParticipant,
  getParticipantsByCampaignId,
  getAllPublishedCampaigns,
  getAllApprovedCampaigns,
};
