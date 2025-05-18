
import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

const createPosition = async (data: {
  positionName: string;
  description?: string;
  companyId: number;
}) => {
  const { positionName, description, companyId } = data;

  if (!positionName || typeof positionName !== "string") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Position name is required");
  }

  if (!companyId || typeof companyId !== "number") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Valid companyId is required");
  }

  const existing = await prisma.position.findFirst({
    where: {
      positionName: data.positionName,
      companyId: data.companyId,
    },
  });

  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Position already exists in this company"
    );
  }

  return prisma.position.create({ data });
};

const getAllPositions = async () => {
  return prisma.position.findMany({
    // where: { isActive: true },
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getPositionById = async (id: number) => {
  return prisma.position.findUnique({
    where: { id },
    include: {
      company: true,
      userPositions: true,
    },
  });
};

const updatePosition = async (
  id: number,
  data: Partial<{
    positionName: string;
    description?: string;
    companyId?: number;
    isActive?: boolean;
  }>
) => {
  if (data.positionName) {
    const duplicate = await prisma.position.findFirst({
      where: {
        positionName: data.positionName,
        NOT: { id },
      },
    });
    if (duplicate) {
      throw new ApiError(httpStatus.CONFLICT, "Position name must be unique");
    }
  }

  const existing = await prisma.position.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Position not found");
  }

  return prisma.position.update({
    where: { id },
    data,
  });
};

// const deletePosition = async (id: number) => {
//   return prisma.position.delete({ where: { id } });
// };



const deletePosition = async (id: number) => {
  const existing = await prisma.position.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  return prisma.position.update({
    where: { id },
    data: { isActive: false },
  });
};
export default {
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  deletePosition,
};
