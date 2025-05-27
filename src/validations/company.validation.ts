import { Level } from "@prisma/client";
import Joi from "joi";

const createCompany = {
  body: Joi.object().keys({
    email: Joi.string().email(),
    organizationName: Joi.string().required(),
    phoneNumber: Joi.string()
      .regex(/^[0-9]{10}$/)
      .messages({
        "string.pattern.base": "Phone number must be 10 digits.",
      })
      .required(),
    companyCode: Joi.string().required(),
    notes: Joi.string(),
    level: Joi.string().valid(Level.MOHHEAD, Level.REGION),
  }),
};
 

const updateCompany = {
  body: Joi.object().keys({
    email: Joi.string().email(),
    organizationName: Joi.string().required(),
    phoneNumber: Joi.string()
      .regex(/^[0-9]{10}$/)
      .messages({
        "string.pattern.base": "Phone number must be 10 digits.",
      })
      .required(),
    companyCode: Joi.string().required(),
    notes: Joi.string(),
    level: Joi.string().valid(Level.MOHHEAD, Level.REGION),
  }),
};
export default {
  createCompany,
  updateCompany
};
