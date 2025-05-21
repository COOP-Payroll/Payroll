import httpStatus from "http-status";
import catchAsync from "../utils/catch-async";
import campaignForApprovalService from "../services/approval.service";

const createCampaignForApproval = catchAsync(async (req, res) => {
  const { campaignId } = req.params;

  await campaignForApprovalService.createCampaignForApproval(campaignId);

  res.status(httpStatus.CREATED).send({
    // data: campaignForApproval,
    message: "Campaign submitted for approval successfully",
  });
});

export default {
  createCampaignForApproval,
};
