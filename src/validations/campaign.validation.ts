import Joi from "joi";

// const deleteDocument = {
//   query: Joi.object({
//     campaignId: Joi.string().uuid().required().messages({
//       "string.base": "Campaign ID must be a string",
//       "string.empty": "Campaign ID cannot be empty",
//       "string.guid": "Campaign ID must be a valid UUID",
//       "any.required": "Campaign ID is required",
//     }),
//     documentId: Joi.string().uuid().required().messages({
//       "string.base": "Document ID must be a string",
//       "string.empty": "Document ID cannot be empty",
//       "string.guid": "Document ID must be a valid UUID",
//       "any.required": "Document ID is required",
//     }),
//   }),
// };
const deleteDocument = {
  params: Joi.object({
    campaignId: Joi.string().uuid().required().messages({
      "string.base": "Campaign ID must be a string",
      "string.empty": "Campaign ID cannot be empty",
      "string.guid": "Campaign ID must be a valid UUID",
      "any.required": "Campaign ID is required",
    }),
    documentId: Joi.string().uuid().required().messages({
      "string.base": "Document ID must be a string",
      "string.empty": "Document ID cannot be empty",
      "string.guid": "Document ID must be a valid UUID",
      "any.required": "Document ID is required",
    }),
  }),
};

const campaignProcessSchema = {
  body: Joi.object({
    campaignId: Joi.string()
      .required()
      .description("Campaign ID associated with the flow"),
    workflowId: Joi.string().required().description("workflowId is required"),
  }),
};
const createCampaign = {
  body: Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Campaign name is required",
      "string.empty": "Campaign name cannot be empty",
    }),
    description: Joi.string().optional(),
    startDate: Joi.date().required().messages({
      "any.required": "Start date is required",
      "date.base": "Start date must be a valid date",
    }),
    endDate: Joi.date().required().messages({
      "any.required": "End date is required",
      "date.base": "End date must be a valid date",
    }),
    budget: Joi.number().required().messages({
      "any.required": "Budget is required",
      "number.base": "Budget must be a number",
    }),
    budgetSource: Joi.string().required().messages({
      "any.required": "Budget source is required",
      "string.empty": "Budget source cannot be empty",
    }),
    departmentId: Joi.string().uuid().optional().messages({
      "string.guid": "Department ID must be a valid UUID",
    }),

    rateSettingId: Joi.string()
      .uuid({ version: "uuidv4" }) // optional, for specific UUID version
      .required()
      .messages({
        "string.guid": "Rate Setting must be a valid UUID",
        "any.required": "Rate Setting is required",
        "string.empty": "Rate Setting cannot be empty",
      }),
  }).custom((value, helpers) => {
    // Access the request object to determine if user is superAdmin
    const req: any = helpers?.prefs?.context?.req;
    const user = req?.user;

    if (user?.isSuperAdmin && !value.departmentId) {
      return helpers.error("any.custom", {
        message: "SuperAdmin must provide a departmentId1ssss",
      });
    }
    return value;
  }),
};

export default {
  createCampaign,
  deleteDocument,

  campaignProcessSchema,
};
