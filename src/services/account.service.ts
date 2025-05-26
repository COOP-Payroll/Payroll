import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";
import { CustomerInfo } from "../types/account";
import axios from "axios";

export type LetterFile = {
  fileName: string;
  filePath: string;
  mimeType?: string;
  size?: number;
};

interface CreateAccountDTO {
  accountNumber: string;
  companyId: string;
  documents?: LetterFile[];
}

interface UpdateAccountDTO {
  accountNumber?: string;
  documents?: LetterFile[];
}

const createAccount = async (data: CreateAccountDTO) => {
  const { accountNumber, companyId, documents } = data;

  if (!accountNumber || !companyId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Missing required fields");
  }
  // **Check uniqueness first**
  const existingAccount = await prisma.account.findFirst({
    where: { companyId, accountNumber },
  });
  if (existingAccount) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Account number ${accountNumber} already exists`
    );
  }

  // Create account with nested documents
  const account = await prisma.account.create({
    data: {
      accountNumber,
      companyId,
      documents:
        documents && documents.length > 0
          ? {
              create: documents.map((doc) => ({
                fileName: doc.fileName,
                filePath: doc.filePath,
                mimeType: doc.mimeType,
                size: doc.size,
              })),
            }
          : undefined,
    },
    include: {
      documents: true,
    },
  });

  return account;
};

const getAllAccounts = async (companyId: string) => {
  return prisma.account.findMany({
    where: { companyId, isActive: true },
    include: { documents: true },
    orderBy: { createdAt: "desc" },
  });
};

const getAccountById = async (id: string, companyId: string) => {
  const account = await prisma.account.findFirst({
    where: { id, companyId },
    include: { documents: true },
  });
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }
  return account;
};

const updateAccount = async (
  id: string,
  companyId: string,
  data: UpdateAccountDTO
) => {
  const existing = await prisma.account.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }

  const { accountNumber, documents } = data;

  const account = await prisma.account.update({
    where: { id },
    data: {
      ...(accountNumber != null && { accountNumber }),
      documents:
        documents && documents.length > 0
          ? {
              create: documents.map((doc) => ({
                fileName: doc.fileName,
                filePath: doc.filePath,
                mimeType: doc.mimeType,
                size: doc.size,
              })),
            }
          : undefined,
    },
    include: { documents: true },
  });

  return account;
};

const deleteAccount = async (id: string, companyId: string) => {
  const existing = await prisma.account.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }
  return prisma.account.update({
    where: { id },
    data: { isActive: false },
  });
};

const assignMasterAccount = async (
  id: string,
  companyId: string,
  documents?: LetterFile[]
) => {
  const account = await prisma.account.findFirst({
    where: { id, companyId },
  });
  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }
  if (account.isMaster) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account is already the master");
  }

  // Ensure no other master exists
  const existingMaster = await prisma.account.findFirst({
    where: { companyId, isMaster: true },
  });
  if (existingMaster && existingMaster.id !== id) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Another account is already set as master. Unassign it first."
    );
  }

  const updateData: any = { isMaster: true };

  if (documents && documents.length > 0) {
    updateData.documents = {
      create: documents.map((doc) => ({
        fileName: doc.fileName,
        filePath: doc.filePath,
        mimeType: doc.mimeType,
        size: doc.size,
      })),
    };
  }

  const updated = await prisma.account.update({
    where: { id },
    data: updateData,
    include: { documents: true },
  });

  return updated;
};

export const verifyAccountById = async (
  accountId: string
): Promise<CustomerInfo> => {
  // 1. Fetch account by internal ID
  const account = await prisma.account.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }

  const accountNumber = account.accountNumber;
  if (!accountNumber) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Account number is missing in account record"
    );
  }

  // 2. External verification
  const url = "http://10.1.245.150:7081/v1/cbo/";
  const payload = {
    AccountDetailsRequest: {
      ESBHeader: {
        serviceCode: "180000",
        channel: "USSD",
        Service_name: "accountEnquiryMC",
        Message_Id: Date.now().toString(),
      },
      ACCTCOMPANYVIEWType: [{ criteriaValue: accountNumber }],
    },
  };

  let response;
  try {
    response = await axios.post(url, payload);
  } catch (err) {
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Failed to connect to account verification service"
    );
  }

  const status = response?.data?.AccountDetailsResponse?.ESBStatus?.Status;
  if (status === "Failure") {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      `External verification failed for account number: ${accountNumber}`
    );
  }

  const info = response.data.AccountDetailsResponse.CustomerInfo;
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Invalid response from external verification service"
    );
  }

  return info as CustomerInfo;
};



export default {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  assignMasterAccount,
  verifyAccountById,
};
