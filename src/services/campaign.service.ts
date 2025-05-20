import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";

const createCampaign = async (data: {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  budgetSource: string;
  documents?: { fileName: string; filePath: string }[];
  createdById: string;
  companyId: string;
}) => {
  const {
    name,
    description,
    startDate,
    endDate,
    budget,
    budgetSource,
    documents = [],
    createdById,
    companyId,
  } = data;

  if (
    !name ||
    !budget ||
    !startDate ||
    !endDate ||
    !budgetSource ||
    !companyId ||
    !createdById
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Missing required campaign fields"
    );
  }

  return await prisma.campaign.create({
    data: {
      name,
      description,
      startDate,
      endDate,
      budget,
      budgetSource,
      createdById,
      companyId,
      documents: {
        create: documents, // Nested document creation
      },
    },
    include: {
      documents: true,
    },
  });
};



const getAllCampaigns = async () => {
  return await prisma.campaign.findMany({
    where: { isActive: true },
    include: {
      company: true,
      documents: true,
      createdBy: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getCampaignById = async (id: string) => {
  return await prisma.campaign.findUnique({
    where: { id },
    include: {
      documents: true,
      company: true,
      createdBy: true,
    },
  });
};

const updateCampaign = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    budgetSource: string;
    isActive: boolean;
  }>
) => {
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");
  }

  return await prisma.campaign.update({
    where: { id },
    data,
  });
};

const deleteCampaign = async (id: string) => {
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");
  }

  return await prisma.campaign.update({
    where: { id },
    data: { isActive: false },
  });
};

export default {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};
