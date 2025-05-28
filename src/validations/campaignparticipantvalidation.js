"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateParticipants = void 0;
const fs_1 = __importDefault(require("fs"));
const http_status_1 = __importDefault(require("http-status"));
const api_error_1 = __importDefault(require("../utils/api-error"));
// src/validations/account.schema.ts (recommended new file)
const joi_1 = __importDefault(require("joi"));
const updateAccountVerificationSchema = {
    params: joi_1.default.object().keys({
        id: joi_1.default.string().uuid().required().label("Account ID"),
    }),
    body: joi_1.default.object().keys({
        isVerified: joi_1.default.boolean().required().label("Verification Status"),
    }),
};
exports.default = {
    updateAccountVerificationSchema,
};
// Use keyof Participant to get string-safe keys
const requiredFields = [
    "fullName",
    "gender",
    "address",
    "phoneNumber",
    "accountNumber",
    "paymentMethod",
    "numberOfDaysInUrban",
    "numberOfDaysInRural",
];
const validateParticipants = (participants, filePath) => {
    for (const [index, participant] of participants.entries()) {
        for (const field of requiredFields) {
            // Check if the field is missing or empty
            if (participant[field] === undefined ||
                participant[field] === null ||
                participant[field] === "") {
                fs_1.default.unlinkSync(filePath);
                throw new api_error_1.default(http_status_1.default.BAD_REQUEST, `Missing '${field}' in row ${index + 2}`);
            }
        }
        // Gender validation
        if (!["MALE", "FEMALE"].includes(participant.gender)) {
            fs_1.default.unlinkSync(filePath);
            throw new api_error_1.default(http_status_1.default.BAD_REQUEST, `Invalid gender in row ${index + 2}. Must be MALE or FEMALE.`);
        }
        // Payment Method validation
        if (!["PHONENUMBER", "ACCOUNTNUMBER"].includes(participant.paymentMethod)) {
            fs_1.default.unlinkSync(filePath);
            throw new api_error_1.default(http_status_1.default.BAD_REQUEST, `Invalid payment method in row ${index + 2}.`);
        }
    }
};
exports.validateParticipants = validateParticipants;
