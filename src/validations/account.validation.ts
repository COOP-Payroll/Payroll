// src/validations/account.schema.ts (recommended new file)
import Joi from "joi";

const assignMasterAccountSchema = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().label("Account ID"),
  }),
};

const updateAccountVerificationSchema = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().label("Account ID"),
  }),
  body: Joi.object().keys({
    isVerified: Joi.boolean().required().label("Verification Status"),
  }),
};

// const verifyAccountInputSchema = {
//   body: Joi.object({
//     accountNumber: Joi.string().required().label("Account Number"),
//     fullName: Joi.string().min(3).required().label("Submitted Full Name"),
//   }),
// };

const verifyAccountInputSchema = {
  body: Joi.object({
    accountNumber: Joi.string().required().label("Account Number"),

    paymentMethod: Joi.string()
      .valid("ACCOUNTNUMBER", "PHONENUMBER")
      .required()
      .label("Payment Method"),

    // fullName: Joi.string()
    //   .min(3)
    //   .when("paymentMethod", {
    //     is: "ACCOUNTNUMBER",
    //     then: Joi.required(),
    //     otherwise: Joi.forbidden(),
    //   })
    //   .label("Submitted Full Name"),
    fullName: Joi.string()
      .min(3)
      .when("paymentMethod", {
        is: "ACCOUNTNUMBER",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .label("Submitted Full Name"),
    phoneNumber: Joi.string()
      // .length(10)
      // .pattern(/^\d+$/)
      .when("paymentMethod", {
        is: "PHONENUMBER",
        then: Joi.required(),
        otherwise: Joi.optional(),
      })
      .label("Phone Number"),
  }),
};

export default {
  assignMasterAccountSchema,
  verifyAccountInputSchema,
  updateAccountVerificationSchema,
};
