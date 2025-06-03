import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "../utils/api-error";
import { CampaignReportResponse, DownloadCampaignReportResponse } from "../dto";

const fetchCampaignReport = async (
  campaignId: string,
  options: {
    limit?: string;
    page?: string;
  }
) => {
  const page = options.page ? parseInt(options.page) : 1;
  const limit = options.limit ? parseInt(options.limit) : 10;
  const skip = (page - 1) * limit;
  const [campaign, totalParticipants] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        documents: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
            mimeType: true,
            size: true,
            uploadedAt: true,
          },
        },
        campaignParticipants: {
          skip,
          take: limit,
          include: {
            participant: {
              select: {
                fullName: true,
                gender: true,
                phoneNumber: true,
                accountNumber: true,
                paymentMethod: true,
              },
            },
            payments: {
              select: {
                totalAmount: true,
                creditTransactions: {
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.campaignParticipant.count({
      where: { campaignId },
    }),
  ]);

  if (!campaign) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Campaign Not Found");
  }

  const allParticipants = await prisma.campaignParticipant.findMany({
    where: { campaignId },
    select: {
      totalAmount: true,
      paymentStatus: true,
    },
  });

  const { totalPaidAmount, totalUnpaidAmount } = allParticipants.reduce(
    (acc, participant) => {
      const participantTotal = Number(participant.totalAmount);
      if (participant.paymentStatus !== "COMPLETED") {
        acc.totalUnpaidAmount += participantTotal;
      } else {
        acc.totalPaidAmount += participantTotal;
      }
      return acc;
    },
    { totalPaidAmount: 0, totalUnpaidAmount: 0 }
  );

  const totalPages = Math.ceil(totalParticipants / limit);
  const response: CampaignReportResponse = {
    totalParticipant: totalParticipants,
    totalPaidAmount,
    totalUnpaidAmount,
    campaignTitle: campaign.name,
    Documents: campaign.documents.map((doc) => ({
      id: doc.id,
      fileName: doc.fileName,
      filePath: doc.filePath,
      mimeType: doc.mimeType,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
    })),
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    campaignParticipants: campaign.campaignParticipants.map((cp) => ({
      id: cp.id,
      fullName: cp.participant.fullName,
      Gender: cp.participant.gender,
      paymentMethod: cp.paymentMethod,
      phoneNumber: cp.phoneNumber,
      accountNumber: cp.accountNumber,
      isVerified: cp.isVerified,
      urbanDays: cp.numberOfDaysInUrban,
      ruralDays: cp.numberOfDaysInRural,
      totalAmount: Number(cp.totalAmount),
    })),
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: totalParticipants,
      limit,
    },
  };
  return response;
};

const downloadCampaignReport = async (campaignId: string) => {
  const [campaign, totalParticipants] = await Promise.all([
    prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        documents: {
          select: {
            id: true,
            fileName: true,
            filePath: true,
            mimeType: true,
            size: true,
            uploadedAt: true,
          },
        },
        campaignParticipants: {
          include: {
            participant: {
              select: {
                fullName: true,
                gender: true,
                phoneNumber: true,
                accountNumber: true,
                paymentMethod: true,
              },
            },
            payments: {
              select: {
                totalAmount: true,
                creditTransactions: {
                  select: {
                    status: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.campaignParticipant.count({
      where: { campaignId },
    }),
  ]);

  if (!campaign) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Campaign Not Found");
  }

  const allParticipants = await prisma.campaignParticipant.findMany({
    where: { campaignId },
    select: {
      totalAmount: true,
      paymentStatus: true,
    },
  });

  const { totalPaidAmount, totalUnpaidAmount } = allParticipants.reduce(
    (acc, participant) => {
      const participantTotal = Number(participant.totalAmount);
      if (participant.paymentStatus !== "COMPLETED") {
        acc.totalUnpaidAmount += participantTotal;
      } else {
        acc.totalPaidAmount += participantTotal;
      }
      return acc;
    },
    { totalPaidAmount: 0, totalUnpaidAmount: 0 }
  );

  const response: DownloadCampaignReportResponse = {
    totalParticipant: totalParticipants,
    totalPaidAmount,
    totalUnpaidAmount,
    campaignName: campaign.name,
    Documents: campaign.documents.map((doc) => ({
      id: doc.id,
      fileName: doc.fileName,
      filePath: doc.filePath,
      mimeType: doc.mimeType,
      size: doc.size,
      uploadedAt: doc.uploadedAt,
    })),
    startDate: campaign.startDate,
    endDate: campaign.endDate,
    campaignParticipants: campaign.campaignParticipants.map((cp) => ({
      id: cp.id,
      fullName: cp.participant.fullName,
      Gender: cp.participant.gender,
      paymentMethod: cp.paymentMethod,
      phoneNumber: cp.phoneNumber,
      accountNumber: cp.accountNumber,
      isVerified: cp.isVerified,
      urbanDays: cp.numberOfDaysInUrban,
      ruralDays: cp.numberOfDaysInRural,
      totalAmount: Number(cp.totalAmount),
    })),
  };
  return response;
};

export default {
  fetchCampaignReport,
  downloadCampaignReport,
};
