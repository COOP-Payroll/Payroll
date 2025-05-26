import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";
import fs from "fs/promises";

// const createCampaign = async (data: {
//   name: string;
//   description?: string;
//   startDate: Date;
//   endDate: Date;
//   budget: number;
//   budgetSource: string;
//   documents?: { fileName: string; filePath: string }[];
//   createdById: string;
//   companyId: string;
// }) => {
//   const {
//     name,
//     description,
//     startDate,
//     endDate,
//     budget,
//     budgetSource,
//     documents = [],
//     createdById,
//     companyId,
//   } = data;

//   if (
//     !name ||
//     !budget ||
//     !startDate ||
//     !endDate ||
//     !budgetSource ||
//     !companyId ||
//     !createdById
//   ) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Missing required campaign fields"
//     );
//   }

//   // ✅ Check for existing campaign with the same name in the company
//   const existingCampaign = await prisma.campaign.findFirst({
//     where: {
//       name,
//       companyId,
//     },
//   });

//   if (existingCampaign) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       `Campaign with name ${name} already exists.`
//     );
//   }

//   return await prisma.campaign.create({
//     data: {
//       name,
//       description,
//       startDate,
//       endDate,
//       budget,
//       budgetSource,
//       createdById,
//       companyId,
//       documents: {
//         create: documents, // Nested document creation
//       },
//     },
//     include: {
//       documents: true,
//     },
//   });
// };

interface CreateCampaignDTO {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  budgetSource: string;
  createdById: string;
  companyId: string;
}

const createCampaign = async (data: CreateCampaignDTO) => {
  const {
    name,
    description,
    startDate,
    endDate,
    budget,
    budgetSource,
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

  // Check for existing campaign with same name in this company
  const existing = await prisma.campaign.findFirst({
    where: { name, companyId },
  });
  if (existing) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Campaign with name "${name}" already exists.`
    );
  }

  // Create the campaign row only—no documents here
  return prisma.campaign.create({
    data: {
      name,
      description,
      startDate,
      endDate,
      budget,
      budgetSource,
      createdById,
      companyId,
    },
  });
};

const getAllCampaigns = async (companyId: string) => {
  const campaigns = await prisma.campaign.findMany({
    where: { isActive: true, companyId },
    select: {
      id: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      budget: true,
      budgetSource: true,
      status: true,
      company: {
        select: {
          id: true,
          organizationName: true,
        },
      },
      documents: {
        select: {
          id: true,
          fileName: true,
          filePath: true,
          mimeType: true,
          size: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          department: {
            select: {
              deptName: true,
              shorthandRepresentation: true,
            },
          },
          position: {
            select: {
              positionName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return campaigns.map((campaign) => {
    const { createdBy, ...rest } = campaign;
    const flattenedCreatedBy = {
      id: createdBy.id,
      name: createdBy.name,
      deptName: createdBy.department?.deptName,
      shorthandRepresentation: createdBy.department?.shorthandRepresentation,
      positionName: createdBy.position?.positionName,
    };

    return {
      ...rest,
      createdBy: flattenedCreatedBy,
    };
  });
};

const getCampaignById = async (id: string, companyId: string) => {
  const campaign = await prisma.campaign.findUnique({
    where: { id, companyId },
    include: {
      documents: true,
      company: {
        select: {
          id: true,
          organizationName: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          department: {
            select: {
              deptName: true,
              shorthandRepresentation: true,
            },
          },
          position: {
            select: {
              positionName: true,
            },
          },
        },
      },
    },
  });

  if (!campaign) {
    throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");
  }

  // Flatten the nested objects into createdBy
  const { createdBy, ...rest } = campaign;
  const flattenedCreatedBy = {
    id: createdBy.id,
    name: createdBy.name,
    deptName: createdBy.department?.deptName,
    shorthandRepresentation: createdBy.department?.shorthandRepresentation,
    positionName: createdBy.position?.positionName,
  };

  return {
    ...rest,
    createdBy: flattenedCreatedBy,
  };
};

const updateCampaign = async (
  id: string,
  companyId: string,
  data: Partial<{
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    budget: number;
    budgetSource: string;
  }>
) => {
  const existing = await prisma.campaign.findFirst({
    where: { id, companyId },
  });

  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");
  }

  // Explicitly prevent isActive or other protected fields from being updated
  const { name, description, startDate, endDate, budget, budgetSource } = data;

  return await prisma.campaign.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description && { description }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(budget !== undefined && { budget }),
      ...(budgetSource && { budgetSource }),
    },
  });
};

const deleteCampaign = async (id: string, companyId: string) => {
  const existing = await prisma.campaign.findUnique({
    where: { id, companyId, isActive: true },
  });
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");
  }

  return await prisma.campaign.update({
    where: { id },
    data: { isActive: false },
  });
};

const deleteDocumentsByIds = async (docIds: string[], campaignId: string) => {
  // Optional: Validate each document belongs to the campaign
  const docs = await prisma.document.findMany({
    where: {
      id: { in: docIds },
      campaignId,
    },
  });

  if (docs.length !== docIds.length) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Some documents not found or do not belong to the campaign"
    );
  }

  // Optional: Delete files from disk
  for (const doc of docs) {
    try {
      await fs.unlink(doc.filePath);
    } catch (err) {
      console.warn(`Failed to delete file: ${doc.filePath}`, err);
    }
  }

  await prisma.document.deleteMany({
    where: {
      id: { in: docIds },
      campaignId,
    },
  });

  return docs;
};

export default {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  deleteDocumentsByIds,
};
