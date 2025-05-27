import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

const createParticipant = async (data: {
  fullName: string;
  gender: "MALE" | "FEMALE";
  phoneNumber: string;
  address?: string;
  detail?: string;
  isVerified?: boolean;
  paymentMethod: "PHONENUMBER" | "ACCOUNTNUMBER";

  companyId: string;
}) => {
  const {
    fullName,
    gender,
    address,
    detail,
    phoneNumber,
    paymentMethod,
    companyId,
  } = data;

  if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Full name is required");
  }

  if (!["MALE", "FEMALE"].includes(gender)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Gender must be MALE or FEMALE");
  }

  return prisma.participant.create({
    data: {
      fullName: fullName.trim(),
      gender,
      phoneNumber,
      paymentMethod,
      address: address?.trim() || undefined,
      detail: detail?.trim() || undefined,
      companyId,
    },
  });
};

const getAllParticipants = async (companyId: string) => {
  return prisma.participant.findMany({
    where: { companyId: companyId },
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
    detail: string;
    isActive: boolean;
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
    data: { isActive: false },
  });
};

export default {
  createParticipant,
  getAllParticipants,
  getParticipantById,
  updateParticipant,
  deleteParticipant,
};
