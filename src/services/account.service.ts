import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";
// import { CustomerInfo } from "../types/account";
import axios from "axios";
import stringSimilarity from "string-similarity";
import jaroWinkler from "jaro-winkler";

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
//DELETEACCOUNT
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
//ASSIGN MASTERACCOUNT
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
interface CustomerInfo {
  FULLNAME: string;
  ACCOUNTNUMBER: string;
  PHONENUMBER?: string;
  BIRTHDATE?: string;
  CATEGORY?: string;
  MARITAL?: string;
  EMAIL?: any;
  UnquieCustomerId?: string;
  // add other fields as needed
}
interface VerificationResult {
  similarity: string;
  status: "Approved" | "Rejected" | "Review";
  reason: string;
}

interface VerifyAccountResponse {
  customerInfo: CustomerInfo;
  verification: VerificationResult;
}

export const verifyAccountByNumber = async (
  accountNumber: string,
  submittedName: string
): Promise<VerifyAccountResponse> => {
  if (!accountNumber) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account number is required");
  }

  const url = "http://10.1.230.6:7081/v1/cbo/";
  const payload = {
    AccountDetailsRequest: {
      ESBHeader: {
        // serviceCode: "180000",
        // channel: "USSD",
        // Service_name: "accountEnquiryMC",
        // Message_Id: Date.now().toString(),

        serviceCode: "990000",
        channel: "USSD",
        Service_name: "accountEnquiryMC",
        Message_Id: "6255726662",
      },
      ACCTCOMPANYVIEWType: [{ criteriaValue: accountNumber }],
    },
  };

  let response;
  try {
    console.log("kdkdkkdk", payload);
    response = await axios.post(url, payload);
  } catch (err) {
    console.log("gemechu ", err);
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Failed to connect to account verification service"
    );
  }

  const status = response?.data?.AccountDetailsResponse?.ESBStatus?.Status;
  if (status === "Failure") {
    throw new ApiError(
      httpStatus.OK,
      `Account verification failed. Please check the account number and try again`
    );
  }
  console.log("djjddjdddjjjjjjffffjjjf", response.status, response.data);
  const info = response.data.AccountDetailsResponse.CustomerInfo;
  if (!info) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Invalid response from external verification service"
    );
  }

  const officialName = info.FULLNAME;
  const matchResult = matchNameTokens(submittedName, officialName);

  return {
    customerInfo: info as CustomerInfo,
    verification: matchResult,
  };
  // return info as CustomerInfo;
  // return matchResult;
};
function matchNameTokens(
  submittedName: string,
  officialName: string
): VerificationResult {
  const submittedTokens = submittedName.toLowerCase().trim().split(/\s+/);
  const officialTokens = officialName.toLowerCase().trim().split(/\s+/);

  if (submittedTokens.length < 2) {
    return {
      similarity: "0.00",
      status: "Rejected",
      reason: "First name only is not allowed",
    };
  }

  let totalScore = 0;

  for (const submittedToken of submittedTokens) {
    const match = stringSimilarity.findBestMatch(
      submittedToken,
      officialTokens
    );
    // Only count the match if similarity is high enough (>= 0.7)
    const tokenScore =
      match.bestMatch.rating >= 0.7 ? match.bestMatch.rating : 0;
    totalScore += tokenScore;
  }

  const averageScore = totalScore / submittedTokens.length;
  const similarity = (averageScore * 100).toFixed(2);

  if (averageScore >= 0.9) {
    return {
      similarity,
      status: "Approved",
      reason: "High name similarity",
    };
  } else if (averageScore >= 0.7) {
    return {
      similarity,
      status: "Review",
      reason: "Partial name similarity",
    };
  } else {
    return {
      similarity,
      status: "Rejected",
      reason: "Name mismatch",
    };
  }
}

// function matchNameTokens(
//   submittedName: string,
//   officialName: string
// ): VerificationResult {
//   const submittedTokens = submittedName.toLowerCase().trim().split(/\s+/);
//   const officialTokens = officialName.toLowerCase().trim().split(/\s+/);

//   if (submittedTokens.length < 2) {
//     return {
//       similarity: "0.00",
//       status: "Rejected",
//       reason: "First name only is not allowed",
//     };
//   }

//   let totalScore = 0;

//   for (const submittedToken of submittedTokens) {
//     const match = stringSimilarity.findBestMatch(
//       submittedToken,
//       officialTokens
//     );
//     totalScore += match.bestMatch.rating;
//   }

//   const averageScore = totalScore / submittedTokens.length;
//   const similarity = (averageScore * 100).toFixed(2); // gives values like 78.51, 82.34, etc.

//   if (averageScore >= 0.9) {
//     return {
//       similarity,
//       status: "Approved",
//       reason: "High name similarity",
//     };
//   } else if (averageScore >= 0.7) {
//     return {
//       similarity,
//       status: "Review",
//       reason: "Partial name similarity",
//     };
//   } else {
//     return {
//       similarity,
//       status: "Rejected",
//       reason: "Name mismatch",
//     };
//   }
// }

const updateAccountVerification = async (
  id: string,
  companyId: string,
  isVerified: boolean
) => {
  const existing = await prisma.account.findFirst({
    where: { id, companyId },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Account not found");
  }

  if (existing.isVerified) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Account already verified");
  }
  const account = await prisma.account.update({
    where: { id },
    data: { isVerified },
    include: { documents: true },
  });

  return account;
};

const verifyPhoneNumber = async (
  accountNumber: string,
  submittedPhone: string
) => {
  // Just check if it's 10 digits for now
  const isValid = /^\d{10}$/.test(submittedPhone);

  return {
    customerInfo: {} as CustomerInfo, // Placeholder; you'll fetch this later
    verification: {
      similarity: isValid ? "100.00" : "0.00",
      status: isValid ? "Approved" : "Rejected",
      reason: isValid
        ? "Phone number format is valid"
        : "Phone number must be exactly 10 digits",
    },
  };
};

export default {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccount,
  deleteAccount,
  assignMasterAccount,
  verifyAccountByNumber,
  verifyPhoneNumber,
  updateAccountVerification,
};
