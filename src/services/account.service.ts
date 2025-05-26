import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

type LetterFile = {
  fileName: string;
  filePath: string;
  mimeType?: string;
  size?: number;
};

// CREATE account with letter (optional)
const createAccount = async (data: {
  accountNumber: string;
  companyId: string;
  letter?: LetterFile;
}) => {
  const { accountNumber, companyId, letter } = data;

  if (!accountNumber || !companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
  }

  let letterId: string | undefined = undefined;

  if (letter) {
    const createdLetter = await prisma.document.create({
      data: {
        fileName: letter.fileName,
        filePath: letter.filePath,
        mimeType: letter.mimeType,
        size: letter.size,
      },
    });
    letterId = createdLetter.id;
  }

  return prisma.account.create({
    data: {
      accountNumber,
      companyId,
      letterId,
    },
    include: {
      letter: true,
    },
  });
};

// GET all accounts for a company
const getAllAccounts = async (companyId: string) => {
  return prisma.account.findMany({
    where: { companyId, isActive: true },
    include: { letter: true },
  });
};

// GET one account by id
const getAccountById = async (id: string, companyId: string) => {
  const account = await prisma.account.findFirst({
    where: { id, companyId },
    include: { letter: true },
  });

  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }

  return account;
};

// UPDATE accountNumber and/or letter
const updateAccount = async (
  id: string,
  companyId: string,
  data: Partial<{
    accountNumber: string;
    letter: LetterFile;
  }>
) => {
  const existing = await prisma.account.findFirst({
    where: { id, companyId },
    include: { letter: true },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }

  let letterId = existing.letterId;

  if (data.letter) {
    const letterDoc = await prisma.document.create({
      data: {
        fileName: data.letter.fileName,
        filePath: data.letter.filePath,
        mimeType: data.letter.mimeType,
        size: data.letter.size,
      },
    });
    letterId = letterDoc.id;
  }

  const { letter, ...accountData } = data;

  return prisma.account.update({
    where: { id },
    data: {
      ...accountData,
      letterId,
    },
    include: { letter: true },
  });
};

// "SOFT DELETE": Mark isActive = false
const deleteAccount = async (id: string, companyId: string) => {
  const existing = await prisma.account.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }

  return prisma.account.update({
    where: { id },
    data: {
      isActive: false,
    },
  });
};

export default {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
};
