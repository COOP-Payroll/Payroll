import httpStatus from "http-status";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { ApprovalStatus, StageStatus } from "@prisma/client";
import prisma from "../client";
import ApiError from "../utils/api-error";
import { AuthUser } from "../types/express";
import logger from "../config/logger";
import { PaymentJobData, paymentJobSchema } from "../types/payment";
import paymentQueue from "../mq-client";

const createCampaignForApproval = async (campaignId: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { company: true },
  });

  if (!campaign) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Campaign not found");
  }

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

const approveOrRejectCampaignStage = async (
  campaignId: string,
  user: AuthUser,
  action: StageStatus
) => {
  const instance = await prisma.campaignApprovalInstance.findFirst({
    where: {
      campaignId,
    },
    include: {
      currentStage: true,
      workflow: {
        include: { stages: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!instance)
    throw new ApiError(httpStatus.NOT_FOUND, "Approval instance not found");

  if (!instance.currentStage || !instance.currentStageId) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Campaign is not ready for approval"
    );
  }
  // check if the user has the role to approve
  // ✅ Step 1: Get user's roles
  const userWithRoles = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      userRoles: true,
    },
  });

  const currentStageRole = await prisma.stageRole.findMany({
    where: { stageId: instance.currentStageId },
  });

  if (!userWithRoles)
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const currentStageRoleIds = currentStageRole.map(
    (currentStageRole) => currentStageRole.roleId
  );
  const userRoleIds = userWithRoles.userRoles.map((role) => role.roleId);

  // const canAct = userRoleIds.includes(currentStageRoleIds);
  const set = new Set(currentStageRoleIds);
  const canAct = userRoleIds.some((id) => set.has(id));

  if (!canAct) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to approve this stage"
    );
  }

  // ✅ Step 3: Update current stage status
  await prisma.campaignStageStatus.updateMany({
    where: {
      instanceId: instance.id,
      stageId: instance.currentStageId,
    },
    data: {
      status: action,
      approvedById: user.id,
    },
  });

  // ✅ Step 4: Handle rejection or move to next stage
  if (action === StageStatus["REJECTED"]) {
    await prisma.campaignApprovalInstance.update({
      where: { id: instance.id },
      data: { status: StageStatus["REJECTED"] },
    });
    return "Campaign Rejected Successfully";
  }

  const currentStageOrder = instance.workflow.stages.find(
    (stage) => stage.id === instance.currentStageId
  )?.order;

  const nextStage = instance.workflow.stages.find(
    (stage) => stage.order === currentStageOrder! + 1
  );

  if (!nextStage) {
    await prisma.campaignApprovalInstance.update({
      where: { id: instance.id },
      data: { status: "APPROVED" }, // Final approval
    });

    try {
      const participants = await prisma.campaignParticipant.findMany({
        where: {
          campaignId,
          // approvalStatus: ApprovalStatus["APPROVED"],
          accountNumber: { not: null }, // Skip participants without accountNumber
        },
        select: {
          id: true,
          totalAmount: true,
          accountNumber: true,
          // phoneNumber: true,
        },
      });

      if (participants.length === 0) {
        logger.warn(
          `No approved participants found for campaignId: ${campaignId}`
        );
        // return res
        //   .status(400)
        //   .json({ error: "No approved participants found for the campaign" });
      }
      // Calculate total amount
      const totalAmount = participants.reduce(
        (sum, p) => sum + p.totalAmount,
        0
      );
      const account = await prisma.account.findFirst({
        where: { companyId: user.companyId, isMaster: true, isActive: true },
      });
      if (account) {
        const paymentJobData: PaymentJobData = {
          debitAccount: account?.accountNumber,
          totalAmount,
          bulkId: uuidv4(),
          participantId: participants[0].id,
          creditTransactions: participants.map((p) => ({
            orderId: uuidv4(),
            creditAccount: p.accountNumber!,
            amount: p.totalAmount,
          })),
        };

        // Validate constructed data
        const parsedData = paymentJobSchema.parse(paymentJobData);

        // Add job to the queue
        const job = await paymentQueue.add("create-payment", parsedData, {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        });

        logger.info(`Payment job queued for bulkId: ${parsedData.bulkId}`, {
          jobId: job.id,
          campaignId,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.error("Validation error in campaign approval", {
          errors: error.errors,
          // campaignId: req.body.campaignId,
        });
        // return res
        //   .status(400)
        //   .json({ error: "Invalid data", details: error.errors });
      }
      logger.error("Error processing campaign approval", {
        error,
        // campaignId: req.body.campaignId,
      });
      // res.status(500).json({ error: "Internal server error" });
    }

    // Construct payment job data

    return "Campaign Finally Approved Successfully";
  }

  // Move to next stage
  await prisma.campaignStageStatus.updateMany({
    where: {
      instanceId: instance.id,
      stageId: nextStage.id,
    },
    data: {
      status: "PENDING",
    },
  });

  await prisma.campaignApprovalInstance.update({
    where: { id: instance.id },
    data: {
      currentStageId: nextStage.id,
    },
  });

  return "Campaign is Approved Successfully";
};

export default {
  createCampaignForApproval,
  approveOrRejectCampaignStage,
};
