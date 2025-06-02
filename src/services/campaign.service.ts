import prisma from "../client";
import httpStatus from "http-status";
import ApiError from "../utils/api-error";
import fs from "fs/promises";
import { CampaignStatus, Prisma, StageStatus } from "@prisma/client";

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  budgetSource: string;
  createdById: string;
  companyId: string;
  documents?: {
    fileName: string;
    filePath: string;
    mimeType?: string;
    size?: number;
  }[];
}

export const createCampaign = async (data: CreateCampaignDTO) => {
  const {
    name,
    description,
    startDate,
    endDate,
    budget,
    budgetSource,
    createdById,
    companyId,
    documents,
  } = data;

  if (
    !name ||
    !startDate ||
    !endDate ||
    !budgetSource ||
    !createdById ||
    !companyId
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Missing required campaign fields"
    );
  }

  // Prevent duplicate name per company
  const exists = await prisma.campaign.findFirst({
    where: { name, companyId },
  });
  if (exists) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Campaign named "${name}" already exists.`
    );
  }

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
      documents:
        documents && documents.length
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
      remarks: true,
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

// const processCampaign = async (
//   campaignId: string,
//   companyId: string,
//   remarks: string,
//   documents: {
//     fileName: string;
//     filePath: string;
//     mimeType?: string;
//     size?: number;
//   }[]
// ) => {
//   const campaign = await prisma.campaign.findUnique({
//     where: { id: campaignId, companyId },
//     include: { documents: true },
//   });

//   if (!campaign) {
//     throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");
//   }

//   // Create documents for the campaign
//   await Promise.all(
//     documents.map((doc) =>
//       prisma.document.create({
//         data: {
//           fileName: doc.fileName,
//           filePath: doc.filePath,
//           mimeType: doc.mimeType,
//           size: doc.size,
//           campaign: {
//             connect: { id: campaignId },
//           },
//         },
//       })
//     )
//   );

//   const workflow = await prisma.approvalWorkflow.findFirst({
//     where: {
//       companyId: campaign.companyId,
//     },
//     include: {
//       stages: {
//         orderBy: { order: "asc" },
//       },
//     },
//   });

//   if (!workflow || workflow.stages.length === 0) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "Approval workflow or stages not found for this company"
//     );
//   }

//   const firstStage = workflow.stages.find((stage) => stage.order === 1);
//   if (!firstStage) {
//     throw new ApiError(
//       httpStatus.BAD_REQUEST,
//       "No initial approval stage found"
//     );
//   }

//   const approvalInstance = await prisma.campaignApprovalInstance.create({
//     data: {
//       campaignId: campaign.id,
//       workflowId: workflow.id,
//       status: "PENDING",
//       currentStageId: firstStage.id,
//     },
//   });

//   console.log("----instance", approvalInstance);

//   // TODO: send notification to the first approval

//   const campaignStageStatus = workflow.stages.map((stage) => ({
//     instanceId: approvalInstance.id,
//     stageId: stage.id,
//     status:
//       stage.id === firstStage.id
//         ? StageStatus["PENDING"]
//         : StageStatus["WAITING"],
//   }));

//   await prisma.campaignStageStatus.createMany({
//     data: campaignStageStatus,
//   });

//   return prisma.campaign.update({
//     where: { id: campaignId },
//     data: {
//       status: "PROCESSED",
//       remarks: remarks,
//     },
//     include: {
//       documents: true,
//     },
//   });
// };

const processCampaign = async (
  campaignId: string,
  companyId: string,
  remarks: string,
  workflowId: string,
  documents: {
    fileName: string;
    filePath: string;
    mimeType?: string;
    size?: number;
  }[]
) => {
  return await prisma.$transaction(async (tx) => {
    const campaign = await tx.campaign.findUnique({
      where: { id: campaignId, companyId },
      include: { documents: true, approvalInstances: true },
    });

    const workflow = await tx.approvalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        stages: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!workflow || workflow.stages.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Approval workflow or stages not found for this company"
      );
    }

    const firstStage = workflow.stages.find((stage) => stage.order === 1);
    if (!firstStage) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "No initial approval stage found"
      );
    }

    if (!campaign) {
      throw new ApiError(httpStatus.NOT_FOUND, "Campaign not found");
    }

    if (campaign.approvalInstances)
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Campaign is already submitted for approval"
      );

    if (campaign.status === "PROCESSED" || campaign.status === "CLOSED") {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Campaign is already processed or closed"
      );
    }
    // Create documents for the campaign
    await Promise.all(
      documents.map((doc) =>
        tx.document.create({
          data: {
            fileName: doc.fileName,
            filePath: doc.filePath,
            mimeType: doc.mimeType,
            size: doc.size,
            campaign: {
              connect: { id: campaignId },
            },
          },
        })
      )
    );

    // const workflow = await tx.approvalWorkflow.findFirst({
    //   where: {
    //     companyId: campaign.companyId,
    //   },
    //   include: {
    //     stages: {
    //       orderBy: { order: "asc" },
    //     },
    //   },
    // });

    const approvalInstance = await tx.campaignApprovalInstance.create({
      data: {
        campaignId: campaign.id,
        workflowId: workflow.id,
        status: "PENDING",
        currentStageId: firstStage.id,
      },
    });

    const campaignStageStatus = workflow.stages.map((stage) => ({
      instanceId: approvalInstance.id,
      stageId: stage.id,
      status:
        stage.id === firstStage.id
          ? StageStatus["PENDING"]
          : StageStatus["WAITING"],
    }));

    await tx.campaignStageStatus.createMany({
      data: campaignStageStatus,
    });

    return tx.campaign.update({
      where: { id: campaignId },
      data: {
        status: "PROCESSED",
        remarks: remarks,
      },
      include: {
        documents: true,
      },
    });
  });
};

const getCampaignsByStatus = async (companyId: string, status: string) => {
  // Validate status
  const validStatuses = ["ACTIVE", "PROCESSED", "APPROVED", "CLOSED"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`
    );
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      isActive: true,
      companyId,
      status: status as CampaignStatus,
    },
    select: {
      id: true,
      name: true,
      description: true,
      startDate: true,
      endDate: true,
      budget: true,
      budgetSource: true,
      status: true,
      remarks: true,
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

  return campaigns;
};
const updateCampaignStatus = async (
  campaignId: string,
  status: CampaignStatus
) => {
  try {
    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
    });
    return updatedCampaign;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Campaign not found");
    }
    throw error;
  }
};

export default {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  deleteDocumentsByIds,
  processCampaign,
  getCampaignsByStatus,
  updateCampaignStatus,
};
