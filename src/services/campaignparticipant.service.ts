import prisma from "../client";
import ApiError from "../utils/api-error";
import httpStatus from "http-status";
import mime from "mime-types";
import path from "path";
import { CampaignParticipantInput } from "../types/participant.types";
import { CampaignParticipantUpdateInput } from "../types/participant.types";
import catchAsync from "../utils/catch-async";

const updateCampaignParticipant = async (
  id: string,
  companyId: string,
  data: CampaignParticipantUpdateInput
) => {
  const {
    numberOfDaysInUrban,
    numberOfDaysInRural,
    fullName,
    gender,
    address,
    phoneNumber,
    accountNumber,
    paymentMethod,

    detail,
    files,
  } = data;

  if (!["PHONENUMBER", "ACCOUNTNUMBER"].includes(paymentMethod)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment method must be PHONENUMBER or ACCOUNTNUMBER"
    );
  }

  return await prisma.$transaction(async (tx) => {
    const campaignParticipant = await tx.campaignParticipant.findUnique({
      where: { id },
      include: { participant: true },
    });

    if (!campaignParticipant) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Campaign participant not found"
      );
    }

    // ✅ Update Participant
    await tx.participant.update({
      where: { id: campaignParticipant.participantId },
      data: {
        fullName,
        gender,
        address,
        // companyId, // make sure companyId is included here
        detail,
      },
    });

    // ✅ Get updated rate settings
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

    // ✅ Update CampaignParticipant
    await tx.campaignParticipant.update({
      where: { id },
      data: {
        numberOfDaysInUrban: Number(numberOfDaysInUrban),
        numberOfDaysInRural: Number(numberOfDaysInRural),
        phoneNumber,
        accountNumber,
        paymentMethod,
        urbanRate,
        ruralRate,
        totalAmount,
      },
    });

    // ✅ Upload new documents
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
              campaignParticipantId: id,
            },
          })
        )
      );
    }

    return await tx.campaignParticipant.findUnique({
      where: { id },
      include: {
        participant: true,
        documents: true,
        campaign: true,
      },
    });
  });
};
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
    isVerified,
    files, // ✅ Access files from data
  } = data;

  console.log(isVerified);
  if (!isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please add verification ");
  }

  // const isActuallyVerified =
  //   isVerified === true ||
  //   (typeof isVerified === "string" && isVerified === "true");

  // if (!isActuallyVerified) {
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "Please verify selected payment method"
  //   );
  // }

  if (!["PHONENUMBER", "ACCOUNTNUMBER"].includes(paymentMethod)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment method must be PHONENUMBER or ACCOUNTNUMBER"
    );
  }
  return await prisma.$transaction(async (tx) => {
    const campaignExists = await tx.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaignExists) {
      throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");
    }

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
        phoneNumber,
        accountNumber,
        paymentMethod,
        urbanRate,
        ruralRate,
        totalAmount,
      },
    });
    console.log("filesddsfgfdhfjghd");
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
    where: { campaignId, isActive: true },
    include: {
      participant: true,
      documents: true,
    },
  });
};

const getAllPublishedCampaigns = async (campaignId: string) => {
  return await prisma.campaignParticipant.findMany({
    where: { campaignId: campaignId, isActive: true },
    include: { participant: true, documents: true },
  });
};

const getAllApprovedCampaigns = async (campaignId: string) => {
  return await prisma.campaignParticipant.findMany({
    where: { campaignId: campaignId, isActive: true },
    include: { participant: true, documents: true },
  });
};

type BulkCampaignParticipantInput = {
  participants: {
    //campaignId: string;
    numberOfDaysInUrban: number;
    numberOfDaysInRural: number;
    fullName: string;
    gender: "MALE" | "FEMALE";
    address: string;
    phoneNumber: string;
    accountNumber: string;
    paymentMethod: "PHONENUMBER" | "ACCOUNTNUMBER";
    detail?: string;
  }[];
  companyId: string;
  campaignId: string;
};

export const registerBulkCampaignParticipants = async (
  data: BulkCampaignParticipantInput
) => {
  const { participants, companyId, campaignId } = data;

  console.log("dlfjlasdfjsdhfjhdn");
  return await prisma.$transaction(async (tx) => {
    const rateSetting = await tx.rateSetting.findUnique({
      where: { companyId },
    });

    if (!rateSetting) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "Rate setting not found for the provided company"
      );
    }

    const results = [];

    for (const input of participants) {
      const {
        // campaignId,
        numberOfDaysInUrban,
        numberOfDaysInRural,
        fullName,
        gender,
        address,
        phoneNumber,
        accountNumber,
        paymentMethod,
        detail,
      } = input;

      const campaignExists = await tx.campaign.findUnique({
        where: { id: campaignId },
      });
      if (!campaignExists) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          `Campaign not found: ${campaignId}`
        );
      }

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
          `Participant '${fullName}' already registered`
        );
      }

      const participant = await tx.participant.create({
        data: {
          fullName,
          gender,
          address,
          companyId,
          detail,
          phoneNumber,
          accountNumber,
          paymentMethod,
        },
      });

      const totalAmount =
        rateSetting.urbanRate * numberOfDaysInUrban +
        rateSetting.ruralRate * numberOfDaysInRural;

      const campaignParticipant = await tx.campaignParticipant.create({
        data: {
          campaignId,
          participantId: participant.id,
          numberOfDaysInUrban,
          numberOfDaysInRural,
          phoneNumber,
          accountNumber,
          paymentMethod,
          urbanRate: rateSetting.urbanRate,
          ruralRate: rateSetting.ruralRate,
          totalAmount,
        },
      });

      results.push({
        participant,
        campaignParticipant,
      });
    }

    return results;
  });
};

const updateAccountVerification = async (
  id: string,
  companyId: string,
  isVerified: boolean
) => {
  const existing = await prisma.campaignParticipant.findFirst({
    where: { id },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }

  if (existing.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account already verified");
  }
  const account = await prisma.campaignParticipant.update({
    where: { id },
    data: { isVerified },
    // include: { documents: true },
  });

  return account;
};

const getUnassignedParticipants = async (campaignId: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign) {
    throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");
  }

  // Get all participants that are not assigned to this campaign
  const unassignedParticipants = await prisma.participant.findMany({
    where: {
      NOT: {
        campaignParticipants: {
          some: {
            campaignId: campaignId,
          },
        },
      },
    },
    // include: {
    //   company: true,
    // },
  });

  return unassignedParticipants;
};

export default {
  registerCampaignParticipant,
  getParticipantsByCampaignId,
  getAllPublishedCampaigns,
  getAllApprovedCampaigns,
  updateCampaignParticipant,
  registerBulkCampaignParticipants,
  updateAccountVerification,
  getUnassignedParticipants,
};
