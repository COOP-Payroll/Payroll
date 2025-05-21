import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

const createRateSetting = async (
  data: {
    urbanRate: number;
    ruralRate: number;
  },
  companyId: string
) => {
  const { urbanRate, ruralRate } = data;

  console.log("djhdjfdjfhdjjs");
  console.log(companyId);
  // Check if a RateSetting already exists for the company
  const existing = await prisma.rateSetting.findUnique({
    where: { companyId },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "RateSetting already exists for this company"
    );
  }

  return prisma.rateSetting.create({
    data: {
      urbanRate,
      ruralRate,
      companyId,
    },
  });
};

const getAllRateSettings = async (companyId: string) => {
  return prisma.rateSetting.findMany({
    where: {
      companyId,
    },
    // include: {
    //   company: true,
    // },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getRateSettingByCompanyId = async (companyId: string) => {
  return prisma.rateSetting.findUnique({
    where: { companyId },
    include: { company: true },
  });
};

const updateRateSetting = async (
  companyId: string,
  data: Partial<{
    urbanRate: number;
    ruralRate: number;
  }>
) => {
  const existing = await prisma.rateSetting.findUnique({
    where: { companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "RateSetting not found");
  }

  return prisma.rateSetting.update({
    where: { companyId },
    data,
  });
};

export default {
  createRateSetting,
  getAllRateSettings,
  getRateSettingByCompanyId,
  updateRateSetting,
};
