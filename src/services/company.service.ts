import httpStatus from "http-status";
import prisma from "../client";
import ApiError from "../utils/api-error";
import { Company, Level } from "@prisma/client";

/**
 * Create a company
 * @param {Object} companyCode
 * @returns {Promise<User>}
 */
const createCompany = async (
  organizationName: string,
  phoneNumber: string,
  companyCode: string,
  email?: string,
  level: Level = Level.REGION
): Promise<Company> => {
  if (email && (await getCompanyByEmail(email))) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  return prisma.company.create({
    data: {
      organizationName,
      phoneNumber,
      companyCode,
      email,
      level,
    },
  });
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getCompanyById = async <Key extends keyof Company>(
  id: string,
  keys: Key[] = [
    "id",
    "organizationName",
    "phoneNumber",
    "companyCode",
    "email",
    "createdAt",
    "updatedAt",
  ] as Key[]
): Promise<Pick<Company, Key> | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Company, Key> | null>;
};

/**
 * Get company by email
 * @param {string} email
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Company, Key> | null>}
 */
const getCompanyByEmail = async <Key extends keyof Company>(
  email: string,
  keys: Key[] = [
    "id",
    "email",
    "organizationName",
    "phoneNumber",
    "companyCode",
    "createdAt",
    "updatedAt",
  ] as Key[]
): Promise<Pick<Company, Key> | null> => {
  return prisma.company.findFirst({
    where: { email },
    select: keys.reduce((obj, k) => ({ ...obj, [k]: true }), {}),
  }) as Promise<Pick<Company, Key> | null>;
};

const getCompanyProfile = async (companyId: string) => {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });

  if (!company) {
    throw new ApiError(httpStatus.NOT_FOUND, "Company not found");
  }

  return company;
};

export default { createCompany, getCompanyById, getCompanyProfile };
