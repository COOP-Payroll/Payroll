import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

const createDepartment = async (data: {
  deptName: string;
  location?: string;
  shorthandRepresentation: string;
  companyId: string;
}) => {
  const { deptName, location, shorthandRepresentation, companyId } = data;
  // Manual checks for required fields
  if (!deptName || typeof deptName !== "string") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Department name is required");
  }

  if (!shorthandRepresentation || typeof shorthandRepresentation !== "string") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Shorthand representation is required"
    );
  }

  if (!companyId || typeof companyId !== "number") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Valid companyId is required");
  }

  const existing = await prisma.department.findFirst({
    where: {
      deptName: data.deptName,
      companyId: data.companyId,
    },
  });
  console.log(data);
  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Department already exists in this company"
    );
  }

  return prisma.department.create({ data });
};

const getAllDepartments = async () => {
  return await prisma.department.findMany({
    where: { isActive: true }, // or true, depending on your needs
    include: {
      company: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getDepartmentById = async (id: string) => {
  return prisma.department.findUnique({
    where: { id },
    include: {
      company: true,
      departmentUsers: true,
    },
  });
};

const updateDepartment = async (
  id: string,
  data: Partial<{
    deptName: string;
    location: string;
    shorthandRepresentation: string;
    companyId: string;
  }>
) => {
//   if (data.deptName) {
//     const duplicate = await prisma.department.findFirst({
//       where: {
//         deptName: data.deptName,
//         NOT: { id }, // exclude current department
//       },
//     });
//     if (duplicate) {
//       throw new ApiError(httpStatus.CONFLICT, "Department name must be unique");
//     }
//   }
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  return prisma.department.update({
    where: { id },
    data,
  });
};

const deleteDepartment = async (id: string) => {
  const existing = await prisma.department.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Department not found");
  }

  return prisma.department.update({
    where: { id },
    data: { isActive: false },
  });
};

export default {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};
