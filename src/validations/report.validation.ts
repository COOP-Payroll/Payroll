import Joi from "joi";

const fetchCampaignReportSchema = {
  params: Joi.object().keys({
    campaignId: Joi.string(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().max(100).default(20),
  }),
};

const downloadCampaignReportSchema = {
  params: Joi.object().keys({
    campaignId: Joi.string(),
  }),
  query: Joi.object().keys({
    page: Joi.number().integer().positive().default(1),
    limit: Joi.number().integer().positive().max(100).default(20),
    format: Joi.string().valid("excel", "pdf"),
  }),
};

// const fetchCampaignPublishedSchema = {
//   params: Joi.object().keys({
//     campaignId: Joi.string(),
//   }),
// };

export default {
  fetchCampaignReportSchema,
  downloadCampaignReportSchema,
  // fetchCampaignPublishedSchema,
};
