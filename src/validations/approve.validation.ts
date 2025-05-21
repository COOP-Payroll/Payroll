import Joi from "joi";

const createCampaignForApprovalSchema = {
  params: Joi.object({
    campaignId: Joi.string()
      .required()
      .description("Campaign ID associated with the flow"),
  }),
};

export default { createCampaignForApprovalSchema };
