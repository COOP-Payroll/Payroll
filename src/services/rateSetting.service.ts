import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

// const createRateSetting = async (
//   data: {
//     urbanRate: number | string;
//     ruralRate: number | string;
//     name:String;
//   },
//   companyId: string
// ) => {
//   const urbanRate = Number(data.urbanRate);
//   const ruralRate = Number(data.ruralRate);

//   if (isNaN(urbanRate) || isNaN(ruralRate)) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "urbanRate and ruralRate must be valid numbers"
//     );
//   }

//   // // Deactivate existing active RateSetting for the company (if any)
//   // await prisma.rateSetting.updateMany({
//   //   where: {
//   //     companyId,
//   //     isActive: true,
//   //   },
//   //   data: {
//   //     isActive: false,
//   //   },
//   // });

//   // Create new RateSetting with isActive: true
//   return prisma.rateSetting.create({
//     data: {
//       name:name,
//       urbanRate,
//       ruralRate,
//       companyId,
//       isActive: true,
//     },
//   });
// };

const createRateSetting = async (
  data: {
    urbanRate: number | string;
    ruralRate: number | string;
    name: string;
  },
  companyId: string
) => {
  const urbanRate = Number(data.urbanRate);
  const ruralRate = Number(data.ruralRate);
  const name = data.name.trim();

  if (isNaN(urbanRate) || isNaN(ruralRate)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "urbanRate and ruralRate must be valid numbers"
    );
  }

  // Check for uniqueness of name within the company
  const existingSetting = await prisma.rateSetting.findFirst({
    where: {
      companyId,
      name: {
        equals: name,
        mode: "insensitive", // Optional: for case-insensitive matching
      },
    },
  });

  if (existingSetting) {
    throw new ApiError(
      httpStatus.CONFLICT,
      `Rate setting with name ${name} already exists for this company.`
    );
  }

  // Create new RateSetting with isActive: true
  return prisma.rateSetting.create({
    data: {
      name,
      urbanRate,
      ruralRate,
      companyId,
      isActive: true,
    },
  });
};

const getAllRateSettings = async (companyId: string) => {
  return prisma.rateSetting.findMany({
    where: {
      companyId,
      // isActive: true,
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

// const updateRateSetting = async (
//   companyId: string,
//   id: string,
//   data: Partial<{
//     urbanRate: GLfloat;
//     ruralRate: GLfloat;
//     name : String
//   }>
// ) => {
//   const existing = await prisma.rateSetting.findUnique({
//     where: { id, companyId },
//   });

//   if (!existing) {
//     throw new ApiError(httpStatus.NOT_FOUND, "RateSetting not found");
//   }

//   // Deactivate the current setting
//   await prisma.rateSetting.update({
//     where: { id },
//     data: { isActive: false },
//   });

//   // Create a new active setting with the updated data
//   return prisma.rateSetting.create({
//     data: {
//       name: data.name,
//       urbanRate: data.urbanRate ?? existing.urbanRate,
//       ruralRate: data.ruralRate ?? existing.ruralRate,
//       companyId,
//       isActive: true,
//     },
//   });
// };

const updateRateSetting = async (
  companyId: string,
  id: string,
  data: Partial<{
    urbanRate: GLfloat;
    ruralRate: GLfloat;
    name: string;
  }>
) => {
  const existing = await prisma.rateSetting.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "RateSetting not found");
  }

  const newName = data.name?.trim();

  // If the name is being changed, check for uniqueness
  if (newName && newName !== existing.name) {
    const duplicate = await prisma.rateSetting.findFirst({
      where: {
        companyId,
        name: {
          equals: newName,
          mode: "insensitive",
        },
        NOT: { id }, // Exclude current record
      },
    });

    if (duplicate) {
      throw new ApiError(
        httpStatus.CONFLICT,
        `Rate setting with name "${newName}" already exists for this company.`
      );
    }
  }

  // Update the existing setting directly
  return prisma.rateSetting.update({
    where: { id },
    data: {
      name: newName ?? existing.name,
      urbanRate: data.urbanRate ?? existing.urbanRate,
      ruralRate: data.ruralRate ?? existing.ruralRate,
    },
  });
};

const deleteRateSetting = async (companyId: string, id: string) => {
  const existing = await prisma.rateSetting.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "RateSetting not found");
  }

  // Hard delete
  return prisma.rateSetting.delete({
    where: { id },
  });
};

export default {
  createRateSetting,
  getAllRateSettings,

  updateRateSetting,
  deleteRateSetting,
};
