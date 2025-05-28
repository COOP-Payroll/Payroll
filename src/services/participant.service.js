"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../client"));
const http_status_1 = __importDefault(require("http-status"));
const api_error_1 = __importDefault(require("../utils/api-error"));
// const createParticipant = async (data: {
//   fullName: string;
//   gender: "MALE" | "FEMALE";
//   address?: string;
//   phoneNumber?: string;
//   accountNumber?: string;
//   paymentMethod: "PHONENUMBER" | "ACCOUNTNUMBER";
//   detail?: string;
//   isVerified?: boolean;
//   companyId: string
// }) => {
//   const {
//     fullName,
//     gender,
//     address,
//     // phoneNumber,
//     // accountNumber,
//     // paymentMethod,
//     detail,
//     // isVerified,
//     companyId
//   } = data;
//   if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Full name is required");
//   }
//   if (!["MALE", "FEMALE"].includes(gender)) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Gender must be MALE or FEMALE");
//   }
//   if (!["PHONENUMBER", "ACCOUNTNUMBER"].includes(paymentMethod)) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Payment method must be PHONENUMBER or ACCOUNTNUMBER"
//     );
//   }
//   return prisma.participant.create({
//     data: {
//       fullName: fullName.trim(),
//       gender,
//       address: address?.trim() || undefined,
//       phoneNumber: phoneNumber?.trim() || undefined,
//       accountNumber: accountNumber?.trim() || undefined,
//       paymentMethod,
//       detail: detail?.trim() || undefined,
//       isVerified: isVerified ?? false,
//       companyId: companyId
//     },
//   });
// };
const createParticipant = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { fullName, gender, address, detail, companyId } = data;
    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Full name is required");
    }
    if (!["MALE", "FEMALE"].includes(gender)) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Gender must be MALE or FEMALE");
    }
    return client_1.default.participant.create({
        data: {
            fullName: fullName.trim(),
            gender,
            address: (address === null || address === void 0 ? void 0 : address.trim()) || undefined,
            detail: (detail === null || detail === void 0 ? void 0 : detail.trim()) || undefined,
            companyId,
        },
    });
});
const getAllParticipants = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.default.participant.findMany({
        where: { companyId: companyId },
        orderBy: { createdAt: "desc" },
    });
});
const getParticipantById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const participant = yield client_1.default.participant.findUnique({ where: { id } });
    if (!participant) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Participant not found");
    }
    return participant;
});
const updateParticipant = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.participant.findUnique({ where: { id } });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Participant not found");
    }
    return client_1.default.participant.update({
        where: { id },
        data,
    });
});
const deleteParticipant = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.participant.findUnique({ where: { id } });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Participant not found");
    }
    return client_1.default.participant.update({
        where: { id },
        data: { isActive: false },
    });
});
exports.default = {
    createParticipant,
    getAllParticipants,
    getParticipantById,
    updateParticipant,
    deleteParticipant,
};
