import httpStatus from "http-status";
import { StageStatus } from "@prisma/client";
import prisma from "../client";
import ApiError from "../utils/api-error";
import { AuthUser } from "../types/express";

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
