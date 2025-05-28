import Joi from "joi";

const createCampaignForApprovalSchema = {
  params: Joi.object({
    campaignId: Joi.string()
      .required()
      .description("Campaign ID associated with the flow"),
  }),
};

const approveOrRejectCampaignStageSchema = {
  body: Joi.object({
    campaignId: Joi.string()
      .required()
      .description("Campaign ID associated with the flow"),
    action: Joi.string().required().description("Action is required"),
  }),
};

export default {
  createCampaignForApprovalSchema,
  approveOrRejectCampaignStageSchema,
};
