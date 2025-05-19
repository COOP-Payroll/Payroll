import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

const createParticipant = async (data: {
  fullName: string;
  gender: "MALE" | "FEMALE";
  address?: string;
  phoneNumber?: string;
  accountNumber?: string;
  paymentMethod: "PHONENUMBER" | "ACCOUNTNUMBER";
  detail?: string;
  isVerified?: boolean;
  companyId: string
}) => {
  const {
    fullName,
    gender,
    address,
    phoneNumber,
    accountNumber,
    paymentMethod,
    detail,
    isVerified,
    companyId
  } = data;

  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Full name is required");
  }

  if (!["MALE", "FEMALE"].includes(gender)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Gender must be MALE or FEMALE");
  }

  if (!["PHONENUMBER", "ACCOUNTNUMBER"].includes(paymentMethod)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Payment method must be PHONENUMBER or ACCOUNTNUMBER"
    );
  }

  return prisma.participant.create({
    data: {
      fullName: fullName.trim(),
      gender,
      address: address?.trim() || undefined,
      phoneNumber: phoneNumber?.trim() || undefined,
      accountNumber: accountNumber?.trim() || undefined,
      paymentMethod,
      detail: detail?.trim() || undefined,
      isVerified: isVerified ?? false,
      companyId: companyId
    },
  });
};

const getAllParticipants = async () => {
  return prisma.participant.findMany({
    // where: { isVerified: true },
    orderBy: { createdAt: "desc" },
  });
};

const getParticipantById = async (id: string) => {
  const participant = await prisma.participant.findUnique({ where: { id } });

  if (!participant) {
    throw new ApiError(httpStatus.NOT_FOUND, "Participant not found");
  }

  return participant;
};

const updateParticipant = async (
  id: string,
  data: Partial<{
    fullName: string;
    gender: "MALE" | "FEMALE";
    address: string;
    phoneNumber: string;
    accountNumber: string;
    paymentMethod: "PHONENUMBER" | "ACCOUNTNUMBER";
    detail: string;
    isVerified: boolean;
  }>
) => {
  const existing = await prisma.participant.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Participant not found");
  }

  return prisma.participant.update({
    where: { id },
    data,
  });
};

const deleteParticipant = async (id: string) => {
  const existing = await prisma.participant.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Participant not found");
  }

  return prisma.participant.update({
    where: { id },
    data: { isVerified: false },
  });
};

export default {
  createParticipant,
  getAllParticipants,
  getParticipantById,
  updateParticipant,
  deleteParticipant,
};
