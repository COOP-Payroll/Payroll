import Joi from "joi";

const createParticipant = {
  body: Joi.object({
    fullName: Joi.string().trim().required().messages({
      "any.required": "Full name is required",
      "string.empty": "Full name cannot be empty",
    }),
    gender: Joi.string().valid("MALE", "FEMALE").required().messages({
      "any.only": "Gender must be either MALE or FEMALE",
      "any.required": "Gender is required",
    }),
    address: Joi.string().allow(null, "").optional(),
   
    detail: Joi.string().allow(null, "").optional(),
  
  }),
};

const updateParticipant = {
  body: Joi.object({
    fullName: Joi.string().trim().optional(),
    gender: Joi.string().valid("MALE", "FEMALE").optional(),
    address: Joi.string().allow(null, "").optional(),
    phoneNumber: Joi.string().allow(null, "").optional(),
    accountNumber: Joi.string().allow(null, "").optional(),
    paymentMethod: Joi.string()
      .valid("CASH", "BANK_TRANSFER", "MOBILE_MONEY")
      .optional(),
    detail: Joi.string().allow(null, "").optional(),
    isVerified: Joi.boolean().optional(),
  }),
};

export default {
  createParticipant,
  updateParticipant,
};
