import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

// const createRateSetting = async (
//   data: {
//     urbanRate: number;
//     ruralRate: number;
//   },
//   companyId: string
// ) => {

//   const { urbanRate, ruralRate } = data;

//   console.log("djhdjfdjfhdjjs");
//   console.log(companyId);
//   // Check if a RateSetting already exists for the company
//   const existing = await prisma.rateSetting.findUnique({
//     where: { companyId },
//   });

//   if (existing) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "RateSetting already exists for this company"
//     );
//   }

//   return prisma.rateSetting.create({
//     data: {
//       urbanRate,
//       ruralRate,
//       companyId,
//     },
//   });
// };

const createRateSetting = async (
  data: {
    urbanRate: number | string;
    ruralRate: number | string;
  },
  companyId: string
) => {
  const urbanRate = Number(data.urbanRate);
  const ruralRate = Number(data.ruralRate);

  if (isNaN(urbanRate) || isNaN(ruralRate)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "urbanRate and ruralRate must be valid numbers"
    );
  }

  // Deactivate existing active RateSetting for the company (if any)
  await prisma.rateSetting.updateMany({
    where: {
      companyId,
      isActive: true,
    },
    data: {
      isActive: false,
    },
  });

  // Create new RateSetting with isActive: true
  return prisma.rateSetting.create({
    data: {
      urbanRate,
      ruralRate,
      companyId,
      isActive: true,
    },
  });
};

const getAllRateSettings = async (companyId: string) => {
  return prisma.rateSetting.findFirst({
    where: {
      companyId,
      isActive: true,
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
  await prisma.rateSetting.findFirst({
    where: { companyId, isActive: true },
  });
};

const updateRateSetting = async (
  companyId: string,
  id: string,
  data: Partial<{
    urbanRate: GLfloat;
    ruralRate: GLfloat;
  }>
) => {
  const existing = await prisma.rateSetting.findUnique({
    where: { id, companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "RateSetting not found");
  }

  // Deactivate the current setting
  await prisma.rateSetting.update({
    where: { id },
    data: { isActive: false },
  });

  // Create a new active setting with the updated data
  return prisma.rateSetting.create({
    data: {
      urbanRate: data.urbanRate ?? existing.urbanRate,
      ruralRate: data.ruralRate ?? existing.ruralRate,
      companyId,
      isActive: true,
    },
  });
};

export default {
  createRateSetting,
  getAllRateSettings,

  updateRateSetting,
};
