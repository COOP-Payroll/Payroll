import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import { ApprovalStatus, CampaignStatus, StageStatus } from "@prisma/client";
import prisma from "../client";
import ApiError from "../utils/api-error";
import { AuthUser } from "../types/express";
import logger from "../config/logger";
import { PaymentJobData, paymentJobSchema } from "../types/payment";
import campaignService from "./campaign.service";
import { paymentQueue } from "../queues";

const createCampaignForApproval = async (campaignId: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { company: true },
  });

  if (!campaign) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Campaign not found");
  }

  // TODO: update campaign status

  const workflow = await prisma.approvalWorkflow.findFirst({
    where: {
      companyId: campaign.companyId,
    },
    include: {
      stages: {
        orderBy: { order: "asc" },
      },
    },
  });

  if (!workflow || workflow.stages.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Approval workflow or stages not found for this company"
    );
  }

  const firstStage = workflow.stages.find((stage) => stage.order === 1);
  if (!firstStage) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "No initial approval stage found"
    );
  }

  const approvalInstance = await prisma.campaignApprovalInstance.create({
    data: {
      campaignId: campaign.id,
      workflowId: workflow.id,
      status: "PENDING",
      currentStageId: firstStage.id,
    },
  });

  console.log("----instance", approvalInstance);

  // TODO: send notification to the first approval

  const campaignStageStatus = workflow.stages.map((stage) => ({
    instanceId: approvalInstance.id,
    stageId: stage.id,
    status:
      stage.id === firstStage.id
        ? StageStatus["PENDING"]
        : StageStatus["WAITING"],
  }));

  await prisma.campaignStageStatus.createMany({
    data: campaignStageStatus,
  });

  return;
};

// const approveOrRejectCampaignStage = async (
//   campaignId: string,
//   user: AuthUser,
//   action: StageStatus
// ) => {
//   const instance = await prisma.campaignApprovalInstance.findFirst({
//     where: {
//       campaignId,
//     },
//     include: {
//       currentStage: true,
//       campaign: true,
//       workflow: {
//         include: { stages: { orderBy: { order: "asc" } } },
//       },
//     },
//   });

//   if (!instance)
//     throw new ApiError(httpStatus.NOT_FOUND, "Approval instance not found");

//   if (!instance.currentStage || !instance.currentStageId) {
//     throw new ApiError(
//       httpStatus.NOT_FOUND,
//       "Campaign is not ready for approval"
//     );
//   }

//   // check if the user has the role to approve
//   // ✅ Step 1: Get user's roles
//   const userWithRoles = await prisma.user.findUnique({
//     where: { id: user.id },
//     include: {
//       userRoles: true,
//     },
//   });

//   const currentStageRole = await prisma.stageRole.findMany({
//     where: { stageId: instance.currentStageId },
//   });

//   if (!userWithRoles)
//     throw new ApiError(httpStatus.NOT_FOUND, "User not found");

//   const currentStageRoleIds = currentStageRole.map(
//     (currentStageRole) => currentStageRole.roleId
//   );
//   const userRoleIds = userWithRoles.userRoles.map((role) => role.roleId);

//   // const canAct = userRoleIds.includes(currentStageRoleIds);
//   const set = new Set(currentStageRoleIds);
//   const canAct = userRoleIds.some((id) => set.has(id));

//   if (!canAct) {
//     throw new ApiError(
//       httpStatus.FORBIDDEN,
//       "You are not authorized to approve this stage"
//     );
//   }

//   const approverUser = await prisma.user.findUnique({ where: { id: user.id } });
//   // const campaignCreatedUser = await prisma.campaign.findFirst({where: {createdBy: }})
//   const campaignCreatedUser = await prisma.user.findUnique({
//     where: { id: instance.campaign.createdById },
//   });

//   if (!approverUser || !campaignCreatedUser)
//     throw new ApiError(httpStatus.BAD_REQUEST, "campaign approver has no user");

//   if (instance.currentStage.order === 1) {
//     if (approverUser.departmentId !== campaignCreatedUser.departmentId) {
//       logger.info("Your department can not approve this campaign");
//       throw new ApiError(
//         httpStatus.BAD_REQUEST,
//         "Your department can not approve this campaign"
//       );
//     }
//   }

//   // ✅ Step 3: Update current stage status
//   await prisma.campaignStageStatus.updateMany({
//     where: {
//       instanceId: instance.id,
//       stageId: instance.currentStageId,
//     },
//     data: {
//       status: action,
//       approvedById: user.id,
//     },
//   });

//   // ✅ Step 4: Handle rejection or move to next stage
//   if (action === StageStatus["REJECTED"]) {
//     await prisma.campaignApprovalInstance.update({
//       where: { id: instance.id },
//       data: { status: StageStatus["REJECTED"] },
//     });
//     return "Campaign Rejected Successfully";
//   }

//   const currentStageOrder = instance.workflow.stages.find(
//     (stage) => stage.id === instance.currentStageId
//   )?.order;

//   const nextStage = instance.workflow.stages.find(
//     (stage) => stage.order === currentStageOrder! + 1
//   );

//   if (!nextStage) {
//     await prisma.campaignApprovalInstance.update({
//       where: { id: instance.id },
//       data: { status: "APPROVED" }, // Final approval
//     });

//     try {
//       const participants = await prisma.campaignParticipant.findMany({
//         where: {
//           campaignId,
//           // approvalStatus: ApprovalStatus["APPROVED"],
//           accountNumber: { not: null }, // Skip participants without accountNumber
//         },
//         select: {
//           id: true,
//           totalAmount: true,
//           accountNumber: true,
//           // phoneNumber: true,
//         },
//       });

//       if (participants.length === 0) {
//         logger.warn(
//           `No approved participants found for campaignId: ${campaignId}`
//         );
//         // return res
//         //   .status(400)
//         //   .json({ error: "No approved participants found for the campaign" });
//       }
//       // Calculate total amount
//       const totalAmount = participants.reduce(
//         (sum, p) => sum + p.totalAmount,
//         0
//       );
//       const account = await prisma.account.findFirst({
//         where: { companyId: user.companyId, isMaster: true, isActive: true },
//       });
//       if (account) {
//         const paymentJobData: PaymentJobData = {
//           debitAccount: account?.accountNumber,
//           totalAmount,
//           bulkId: uuidv4(),
//           participantId: participants[0].id,
//           creditTransactions: participants.map((p) => ({
//             orderId: uuidv4(),
//             creditAccount: p.accountNumber!,
//             amount: p.totalAmount,
//           })),
//         };

//         // Validate constructed data
//         const parsedData = paymentJobSchema.parse(paymentJobData);

//         // Add job to the queue
//         const job = await paymentQueue.add("create-payment", parsedData, {
//           attempts: 3,
//           backoff: {
//             type: "exponential",
//             delay: 1000,
//           },
//         });

//         logger.info(`Payment job queued for bulkId: ${parsedData.bulkId}`, {
//           jobId: job.id,
//           campaignId,
//         });
//       }
//     } catch (error) {
//       if (error instanceof z.ZodError) {
//         logger.error("Validation error in campaign approval", {
//           errors: error.errors,
//           // campaignId: req.body.campaignId,
//         });
//         // return res
//         //   .status(400)
//         //   .json({ error: "Invalid data", details: error.errors });
//       }
//       logger.error("Error processing campaign approval", {
//         error,
//         // campaignId: req.body.campaignId,
//       });
//       // res.status(500).json({ error: "Internal server error" });
//     }

//     // Construct payment job data

//     return "Campaign Finally Approved Successfully";
//   }

//   // Move to next stage
//   await prisma.campaignStageStatus.updateMany({
//     where: {
//       instanceId: instance.id,
//       stageId: nextStage.id,
//     },
//     data: {
//       status: "PENDING",
//     },
//   });

//   await prisma.campaignApprovalInstance.update({
//     where: { id: instance.id },
//     data: {
//       currentStageId: nextStage.id,
//     },
//   });

//   return "Campaign is Approved Successfully";
// };

/**
 * Approves or rejects a campaign stage, handling all necessary updates and payments.
 * @param campaignId - The ID of the campaign
 * @param user - The authenticated user performing the action
 * @param action - The action to take (APPROVED or REJECTED)
 * @returns A success message
 */
const approveOrRejectCampaignStage = async (
  campaignId: string,
  user: AuthUser,
  action: StageStatus
): Promise<string> => {
  // Fetch and validate campaign approval instance
  const instance = await getCampaignApprovalInstance(campaignId);

  // Ensure campaign is ready for approval
  await checkCampaignReadyForApproval(instance);

  // Verify user authorization
  await checkUserAuthorization(instance, user);

  // Update current stage status
  await updateStageStatus(instance, user, action);

  if (action === StageStatus.REJECTED) {
    await handleRejection(instance);
    return "Campaign Rejected Successfully";
  } else {
    const nextStage = getNextStage(instance);
    if (nextStage) {
      await moveToNextStage(instance, nextStage);
      return "Campaign is Approved Successfully";
    } else {
      await handleFinalApproval(instance, user, campaignId);
      return "Campaign Finally Approved Successfully";
    }
  }
};

// Helper Functions

async function checkUserAuthorization(instance: any, user: AuthUser) {
  // Fetch user and stage roles
  const [userRoles, stageRoles] = await Promise.all([
    prisma.userRole.findMany({
      where: { userId: user.id },
      select: { roleId: true },
    }),
    prisma.stageRole.findMany({
      where: { stageId: instance.currentStageId },
      select: { roleId: true },
    }),
  ]);

  const userRoleIds = userRoles.map((ur) => ur.roleId);
  const stageRoleIds = stageRoles.map((sr) => sr.roleId);
  const canAct = userRoleIds.some((id) => stageRoleIds.includes(id));

  if (!canAct) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to approve this stage"
    );
  }

  // Additional department check for first stage
  const [approverUser, campaignCreator] = await Promise.all([
    prisma.user.findUnique({ where: { id: user.id } }),
    prisma.user.findUnique({ where: { id: instance.campaign.createdById } }),
  ]);

  if (!approverUser || !campaignCreator) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User data is missing");
  }

  if (
    instance.currentStage.order === 1 &&
    approverUser.departmentId !== campaignCreator.departmentId
  ) {
    logger.info(
      `Unauthorized department approval attempt by user ${user.id} for campaign ${instance.campaignId}`
    );
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Your department cannot approve this campaign"
    );
  }
}

async function getCampaignApprovalInstance(campaignId: string) {
  const instance = await prisma.campaignApprovalInstance.findFirst({
    where: { campaignId },
    include: {
      currentStage: { select: { id: true, order: true } },
      campaign: { select: { createdById: true } },
      workflow: {
        include: {
          stages: {
            select: { id: true, order: true },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
  if (!instance) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Campaign approval instance not found"
    );
  }
  return instance;
}

async function checkCampaignReadyForApproval(instance: any) {
  if (!instance.currentStage || !instance.currentStageId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Campaign is not ready for approval"
    );
  }
}

async function updateStageStatus(
  instance: any,
  user: AuthUser,
  action: StageStatus
) {
  const updatedCount = await prisma.campaignStageStatus.updateMany({
    where: {
      instanceId: instance.id,
      stageId: instance.currentStageId,
    },
    data: {
      status: action,
      approvedById: user.id,
    },
  });

  if (updatedCount.count === 0) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to update stage status"
    );
  }
}

async function handleRejection(instance: any) {
  await prisma.campaignApprovalInstance.update({
    where: { id: instance.id },
    data: { status: StageStatus.REJECTED },
  });
}

function getNextStage(instance: any): any | null {
  const stages = instance.workflow.stages;
  const currentIndex = stages.findIndex(
    (s: any) => s.id === instance.currentStageId
  );
  return currentIndex + 1 < stages.length ? stages[currentIndex + 1] : null;
}

async function moveToNextStage(instance: any, nextStage: any) {
  await prisma.$transaction([
    prisma.campaignStageStatus.upsert({
      where: {
        instanceId_stageId: { instanceId: instance.id, stageId: nextStage.id },
      },
      update: { status: StageStatus.PENDING },
      create: {
        instanceId: instance.id,
        stageId: nextStage.id,
        status: StageStatus.PENDING,
      },
    }),
    prisma.campaignApprovalInstance.update({
      where: { id: instance.id },
      data: { currentStageId: nextStage.id },
    }),
  ]);
}

async function handleFinalApproval(
  instance: any,
  user: AuthUser,
  campaignId: string
) {
  // Mark instance as approved
  await prisma.campaignApprovalInstance.update({
    where: { id: instance.id },
    data: { status: StageStatus.APPROVED },
  });

  // Fetch approved participants
  const participants = await prisma.campaignParticipant.findMany({
    where: {
      campaignId,
      approvalStatus: ApprovalStatus.APPROVED,
      accountNumber: { not: null },
    },
    select: {
      id: true,
      totalAmount: true,
      accountNumber: true,
    },
  });

  if (!participants.length) {
    logger.warn(`No approved participants found for campaign ${campaignId}`);
    return;
  }

  // Calculate total amount
  const totalAmount = participants.reduce(
    (sum: number, p: any) => sum + p.totalAmount,
    0
  );

  // Fetch master account
  const account = await prisma.account.findFirst({
    where: { companyId: user.companyId, isMaster: true, isActive: true },
    select: { accountNumber: true },
  });

  if (!account) {
    logger.error(
      `No active master account found for company ${user.companyId}`
    );
    throw new ApiError(httpStatus.NOT_FOUND, "Master account not found");
  }

  // Prepare payment job
  const paymentJobData: PaymentJobData = {
    debitAccount: account.accountNumber,
    totalAmount,
    bulkId: uuidv4(),
    participantId: participants[0].id,
    creditTransactions: participants.map((p: any) => ({
      orderId: uuidv4(),
      creditAccount: p.accountNumber!,
      amount: p.totalAmount,
    })),
  };

  try {
    const parsedData = paymentJobSchema.parse(paymentJobData);
    const job = await paymentQueue.add("create-payment", parsedData, {
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    });
    logger.info(`Payment job queued for campaign ${campaignId}`, {
      bulkId: parsedData.bulkId,
      jobId: job.id,
    });
  } catch (error) {
    logger.error(`Failed to queue payment job for campaign ${campaignId}`, {
      error,
    });
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Payment processing failed"
    );
  }
}

const rollbackCampaignApproval = async (campaignId: string, user: AuthUser) => {
  const instance = await getCampaignApprovalInstance(campaignId);

  if (!instance)
    throw new ApiError(httpStatus.BAD_REQUEST, "There is no campaign approval");

  if (!instance.currentStageId) {
    await updateStageStatus(instance, user, StageStatus.REJECTED);
    await handleRejection(instance);
    await campaignService.updateCampaignStatus(
      campaignId,
      CampaignStatus["ACTIVE"]
    );
    return "Campaign rollback successfully";
  }

  if (instance && instance.currentStage && instance.currentStage.order !== 1)
    throw new ApiError(httpStatus.BAD_REQUEST, "You can't rollback approval");

  const campaignStageStatus = await prisma.campaignStageStatus.findFirst({
    where: { id: instance.currentStageId },
  });

  if (campaignStageStatus?.status === StageStatus.APPROVED) {
    throw new ApiError(httpStatus.BAD_REQUEST, "You can't rollback approval");
  }

  await updateStageStatus(instance, user, StageStatus.REJECTED);
  await handleRejection(instance);
  await campaignService.updateCampaignStatus(
    campaignId,
    CampaignStatus["ACTIVE"]
  );
  return "Campaign rollback successfully";
};

export default {
  createCampaignForApproval,
  approveOrRejectCampaignStage,
  rollbackCampaignApproval,
};
