import httpStatus from "http-status";
import { StageStatus } from "@prisma/client";
import prisma from "../client";
import ApiError from "../utils/api-error";

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

  console.log("----", workflow);

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

  console.log("----", firstStage);

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

export default {
  createCampaignForApproval,
};
