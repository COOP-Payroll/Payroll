import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import campaignForApprovalService from "../services/approval.service";
import { AuthUser } from "../types/express";

const createCampaignForApproval = catchAsync(async (req, res) => {
  const { campaignId } = req.params;

  await campaignForApprovalService.createCampaignForApproval(campaignId);

  res.status(httpStatus.CREATED).send({
    // data: campaignForApproval,
    message: "Campaign submitted for approval successfully",
  });
});

const approveOrRejectCampaignStage = catchAsync(async (req, res) => {
  const { campaignId, action } = req.body;
  const user = req.user as AuthUser;
  const approveOrRejectCampaign =
    await campaignForApprovalService.approveOrRejectCampaignStage(
      campaignId,
      user,
      action
    );
  res.status(httpStatus.CREATED).send({
    data: [],
    message: approveOrRejectCampaign,
  });
});

const rollbackCampaignApproval = catchAsync(async (req, res) => {
  const { campaignId } = req.params;
  const user = req.user as AuthUser;

  await campaignForApprovalService.rollbackCampaignApproval(campaignId, user);
  res.status(httpStatus.CREATED).send({
    message: "Campaign approval revoked successfully",
  });
});

export default {
  createCampaignForApproval,
  approveOrRejectCampaignStage,
  rollbackCampaignApproval,
};
