import Joi from "joi";

const deleteDocument = {
  query: Joi.object({
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

export default {
  deleteDocument,
};
