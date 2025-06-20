import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "../utils/api-error";
import { DownloadCampaignReportResponse } from "../dto";

// const fetchCampaignReport = async (
//   campaignId: string,
//   options: {
//     limit?: string;
//     page?: string;
//   }
// ) => {
//   const page = options.page ? parseInt(options.page) : 1;
//   const limit = options.limit ? parseInt(options.limit) : 10;
//   const skip = (page - 1) * limit;
//   const paidCampaigns = await prisma.payment.findFirst({
//     where: {
//       campaignId,
//       status: {
//         not: "PENDING",
//       },
//     },
//     select: {
//       campaign: {
//         select: {
//           name: true,
//           startDate: true,
//           endDate: true,
//           documents: {
//             select: {
//               id: true,
//               fileName: true,
//               filePath: true,
//               mimeType: true,
//               size: true,
//               uploadedAt: true,
//             },
//           },
//         },
//       },
//       creditTransactions: {
//         select: {
//           status: true,
//           creditAccount: true,
//           amount: true,
//           transactionId: true,
//           failureReason: true,
//           campaignParticipant: {
//             select: {
//               numberOfDaysInUrban: true,
//               numberOfDaysInRural: true,
//               participant: {
//                 select: {
//                   fullName: true,
//                   paymentMethod: true,
//                   phoneNumber: true,
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });

//   if (!paidCampaigns) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Campaign Not Found");
//   }

//   return paidCampaigns;
// };

const fetchCampaignReport = async (
  campaignId: string,
  options: {
    limit?: string;
    page?: string;
  }
) => {
  const page = parseInt(options.page || "1");
  const limit = parseInt(options.limit || "10");
  const skip = (page - 1) * limit;

  const [totalParticipants, totalPaid, totalFailedTransactions, payment] =
    await Promise.all([
      prisma.campaignParticipant.count({
        where: { campaignId },
      }),
      prisma.creditTransaction.aggregate({
        where: {
          payment: { campaignId },
          status: "PAID",
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.creditTransaction.count({
        where: {
          payment: { campaignId },
          status: "FAILED",
        },
      }),
      prisma.payment.findFirst({
        where: { campaignId, status: { in: ["COMPLETED", "FAILED"] } },
      }),
    ]);

  if (!payment) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Campaign has no payment history"
    );
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      startDate: true,
      endDate: true,
      name: true,
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
    },
  });

  if (!campaign) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Campaign not found");
  }

  // Paginated list of creditTransactions with participant info
  const creditTransactions = await prisma.creditTransaction.findMany({
    where: {
      payment: {
        campaignId,
        status: { not: "PENDING" },
      },
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      status: true,
      creditAccount: true,
      amount: true,
      transactionId: true,
      campaignParticipant: {
        select: {
          numberOfDaysInUrban: true,
          numberOfDaysInRural: true,
          participant: {
            select: {
              fullName: true,
              phoneNumber: true,
            },
          },
        },
      },
    },
  });

  return {
    meta: {
      totalParticipants,
      totalPaid: totalPaid._sum.amount ?? 0,
      totalFailedTransactions,
      page,
      limit,
    },
    campaign,
    transactions: creditTransactions.map((txn) => ({
      status: txn.status,
      creditAccount: txn.creditAccount,
      amount: txn.amount,
      transactionId: txn.transactionId,
      numberOfDaysInUrban: txn.campaignParticipant.numberOfDaysInUrban,
      numberOfDaysInRural: txn.campaignParticipant.numberOfDaysInRural,
      fullName: txn.campaignParticipant.participant.fullName,
      phoneNumber: txn.campaignParticipant.participant.phoneNumber,
    })),
  };
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
            // payments: {
            //   select: {
            //     totalAmount: true,
            //     creditTransactions: {
            //       select: {
            //         status: true,
            //       },
            //     },
            //   },
            // },
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
  console.log("------", campaign.name);
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

const fetchPublishedCampaign = async (
  campaignId: string,
  options: {
    limit?: string;
    page?: string;
  }
) => {
  const page = options.page ? parseInt(options.page) : 1;
  const limit = options.limit ? parseInt(options.limit) : 10;
  const skip = (page - 1) * limit;
  const instance = await prisma.campaignApprovalInstance.findFirst({
    where: { campaignId },
    select: {
      id: true,
      currentStageId: true,
      stageStatuses: {
        select: {
          id: true,
          status: true,
          approvedBy: { select: { name: true } },
          stage: {
            select: { name: true },
          },
        },
      },
      currentStage: {
        select: {
          order: true,
          stageRoles: {
            select: { roleId: true },
          },
        },
      },
    },
  });

  if (
    !instance ||
    !instance.currentStageId ||
    !instance.currentStage?.stageRoles
  )
    throw new ApiError(httpStatus.BAD_REQUEST, "There is no campaign approval");

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      id: true,
      name: true,
      documents: true,
      campaignParticipants: {
        where: { isActive: true },
        skip,
        take: limit,
        select: {
          id: true,
          totalAmount: true,
          accountNumber: true,
          phoneNumber: true,
          isVerified: true,
          numberOfDaysInUrban: true,
          numberOfDaysInRural: true,
          paymentMethod: true,
          participant: {
            select: { id: true, fullName: true, gender: true },
          },
        },
      },
    },
  });

  if (!campaign) throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");

  const totalPaying = campaign.campaignParticipants.reduce(
    (sum, participant) => {
      const amount = Number(participant.totalAmount || 0);
      return sum + amount;
    },
    0
  );
  const totalPages = Math.ceil(campaign.campaignParticipants.length / limit);
  return {
    campaignId: campaign.id,
    currentStageId: instance.currentStageId,
    campaignTitle: campaign.name,
    totalPaying,
    totalParticipants: campaign.campaignParticipants.length,
    stages: instance.stageStatuses,
    participants: campaign.campaignParticipants,
    documents: campaign.documents,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: campaign.campaignParticipants.length,
      limit,
    },
  };
};

const fetchCampaignPaymentHistory = async (
  campaignId: string,
  options: {
    limit?: string;
    page?: string;
  }
) => {
  const page = options.page ? parseInt(options.page) : 1;
  const limit = options.limit ? parseInt(options.limit) : 10;
  const skip = (page - 1) * limit;
  const [
    paidTransactions,
    failedTransactions,
    pendingTransactions,
    participantCount,
    participantsList,
  ] = await Promise.all([
    prisma.campaignParticipant.aggregate({
      where: { campaignId, paymentStatus: "COMPLETED" },
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.campaignParticipant.aggregate({
      where: { paymentStatus: "FAILED" },
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.campaignParticipant.aggregate({
      where: { paymentStatus: "PENDING" },
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.campaignParticipant.count(),
    prisma.campaignParticipant.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        accountNumber: true,
        isVerified: true,
        phoneNumber: true,
        paymentMethod: true,
        totalAmount: true,
        participant: {
          select: {
            fullName: true,
            gender: true,
          },
        },
      },
    }),
  ]);

  const formattedParticipants = participantsList.map((p) => ({
    id: p.id,
    name: p.participant.fullName,
    gender: p.participant.gender,
    accountNumber: p.accountNumber,
    isVerified: p.isVerified,
    phoneNumber: p.phoneNumber,
    paymentMethod: p.paymentMethod,
    totalAmount: p.totalAmount,
  }));

  const totalPages = Math.ceil(participantCount / limit);

  return {
    totalPaidTransactions: paidTransactions._count,
    totalFailedTransactions: failedTransactions._count,
    totalPendingTransactions: pendingTransactions._count,
    totalCampaignParticipants: participantCount,
    totalAmountPaid: paidTransactions._sum.totalAmount || 0,
    totalAmountFailed: failedTransactions._sum.totalAmount || 0,
    totalAmountPending: pendingTransactions._sum.totalAmount,
    campaignParticipants: formattedParticipants,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: participantCount,
      limit,
    },
  };
};
const fetchCampaignSummaryReport = async (companyId: string) => {
  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      companyId,
    },
    select: {
      id: true,
      status: true,
      department: {
        select: {
          deptName: true,
        },
      },
    },
  });

  const totalCampaigns = campaigns.length;
  let totalProcessed = 0;
  let totalApproved = 0;
  let totalActive = 0;
  let totalClosed = 0;

  const departments: Record<
    string,
    {
      count: number;
      statuses: Record<string, number>;
    }
  > = {};

  for (const campaign of campaigns) {
    const deptName = campaign.department?.deptName || "UNKNOWN";
    const status = campaign.status.toUpperCase();

    // Initialize department if not already present
    if (!departments[deptName]) {
      departments[deptName] = {
        count: 0,
        statuses: {
          ACTIVE: 0,
          PROCESSED: 0,
          APPROVED: 0,
          CLOSED: 0,
        },
      };
    }

    departments[deptName].count++;

    if (departments[deptName].statuses[status] !== undefined) {
      departments[deptName].statuses[status]++;
    } else {
      departments[deptName].statuses[status] = 1;
    }

    // Count global totals
    if (status === "PROCESSED") totalProcessed++;
    if (status === "APPROVED") totalApproved++;
    if (status === "ACTIVE") totalActive++;
    if (status === "CLOSED") totalClosed++;
  }

  const response = {
    totalCampaigns,
    totalProcessed,
    totalApproved,
    totalActive,
    totalClosed,
    departments,
  };

  return response;
};

const fetchCampaignParticipantSummary = async (companyId: string) => {
  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      companyId,
    },
    select: {
      name: true,
      campaignParticipants: {
        where: { isActive: true },
        select: {
          id: true, // Just need count
        },
      },
    },
  });

  let totalParticipant = 0;
  const campaign: Record<string, number> = {};

  for (const c of campaigns) {
    const participantCount = c.campaignParticipants.length;
    campaign[c.name] = participantCount;
    totalParticipant += participantCount;
  }

  const response = {
    totalParticipant,
    campaign,
  };

  return response;
};

const fetchPaidCampaigns = async (companyId: string) => {
  const paidCampaigns = await prisma.payment.findMany({
    where: {
      campaign: {
        companyId,
      },
      status: {
        in: ["COMPLETED", "FAILED"],
      },
    },
    select: {
      campaign: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return paidCampaigns;
};

export default {
  fetchCampaignReport,
  downloadCampaignReport,
  fetchPublishedCampaign,
  fetchCampaignPaymentHistory,
  fetchCampaignSummaryReport,
  fetchCampaignParticipantSummary,
  fetchPaidCampaigns,
};
