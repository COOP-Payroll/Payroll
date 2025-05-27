import fs from "fs";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

// src/validations/account.schema.ts (recommended new file)
import Joi from "joi";

const updateAccountVerificationSchema = {
  params: Joi.object().keys({
    id: Joi.string().uuid().required().label("Account ID"),
  }),
  body: Joi.object().keys({
    isVerified: Joi.boolean().required().label("Verification Status"),
  }),
};

export default {
  updateAccountVerificationSchema,
};

interface Participant {
  fullName: string;
  gender: string;
  address: string;
  phoneNumber: string;
  accountNumber: number;
  paymentMethod: string;
  numberOfDaysInUrban: number;
  numberOfDaysInRural: number;
  detail: string;
}

// Use keyof Participant to get string-safe keys
const requiredFields: (keyof Participant)[] = [
  "fullName",
  "gender",
  "address",
  "phoneNumber",
  "accountNumber",
  "paymentMethod",
  "numberOfDaysInUrban",
  "numberOfDaysInRural",
];

export const validateParticipants = (
  participants: Participant[],
  filePath: string
) => {
  for (const [index, participant] of participants.entries()) {
    for (const field of requiredFields) {
      // Check if the field is missing or empty
      if (
        participant[field] === undefined ||
        participant[field] === null ||
        participant[field] === ""
      ) {
        fs.unlinkSync(filePath);
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          `Missing '${field}' in row ${index + 2}`
        );
      }
    }

    // Gender validation
    if (!["MALE", "FEMALE"].includes(participant.gender)) {
      fs.unlinkSync(filePath);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid gender in row ${index + 2}. Must be MALE or FEMALE.`
      );
    }

    // Payment Method validation
    if (!["PHONENUMBER", "ACCOUNTNUMBER"].includes(participant.paymentMethod)) {
      fs.unlinkSync(filePath);
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Invalid payment method in row ${index + 2}.`
      );
    }
  }
};
