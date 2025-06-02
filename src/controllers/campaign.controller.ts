import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import campaignService from "../services/campaign.service";
import prisma from "../client";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";
import { AuthUser } from "../types/express";
import ApiError from "../utils/api-error";

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

export const createCampaign = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const files = req.files as Express.Multer.File[];

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // Map multer files into our DTO shape
    const documents = (files || []).map((file) => ({
      fileName: file.originalname,
      filePath: path.basename(file.path),
      mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
      size: file.size,
    }));

    const dto: CreateCampaignDTO = {
      name: req.body.name,
      description: req.body.description,
      startDate: new Date(req.body.startDate),
      endDate: new Date(req.body.endDate),
      budget: parseFloat(req.body.budget),
      budgetSource: req.body.budgetSource,
      createdById: user.id,
      companyId: user.companyId,
      documents, // nested create
    };

    const campaign = await campaignService.createCampaign(dto);

    res.status(httpStatus.CREATED).json({
      message: "Campaign created successfully",
      data: campaign,
    });
  }
);
const getAllCampaigns = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const campaigns = await campaignService.getAllCampaigns(user.companyId);
  res.status(httpStatus.OK).json({ data: campaigns });
});

const updateCampaign = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const campaignId = req.params.id;

  // Handle uploaded documents if any
  if (req.files?.length) {
    const files = req.files as Express.Multer.File[];

    const documentCreations = files.map((file) =>
      prisma.document.create({
        data: {
          fileName: file.originalname,
          filePath: file.path,
          mimeType: file.mimetype,
          size: file.size,
          campaignId: campaignId,
        },
      })
    );

    await Promise.all(documentCreations);
  }

  // Extract and process form fields from req.body
  const { name, description, startDate, endDate, budget, budgetSource } =
    req.body;

  const updateData = {
    ...(name && { name }),
    ...(description && { description }),
    ...(startDate && { startDate: new Date(startDate) }),
    ...(endDate && { endDate: new Date(endDate) }),
    ...(budget && { budget: parseFloat(budget) }),
    ...(budgetSource && { budgetSource }),
  };

  const updatedCampaign = await campaignService.updateCampaign(
    campaignId,
    user.companyId,
    updateData
  );

  res.status(httpStatus.OK).json({
    message: "Campaign updated successfully",
    data: updatedCampaign,
  });
});

// const updateCampaign = catchAsync(async (req: Request, res: Response) => {
//   const user = req.user as AuthUser;
//   // Handle file updates if needed
//   if (req.files?.length) {
//     const files = req.files as Express.Multer.File[];
//     const documentCreations = files.map(async (file) => {
//       return await prisma.document.create({
//         data: {
//           fileName: file.originalname,
//           filePath: file.path,
//           mimeType: file.mimetype,
//           size: file.size,
//           campaignId: req.params.id,
//         },
//       });
//     });
//     await Promise.all(documentCreations);
//   }

//   const campaign = await campaignService.updateCampaign(
//     req.params.id,
//     user.companyId,
//     req.body
//   );
//   res
//     .status(httpStatus.OK)
//     .json({ message: "Campaign updated", data: campaign });
// });

const deleteCampaign = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  // First get campaign documents
  const documents = await prisma.document.findMany({
    where: { campaignId: req.params.id },
  });

  // Delete campaign and related documents
  const updated = await campaignService.deleteCampaign(
    req.params.id,
    user.companyId
  );

  res.status(httpStatus.OK).json({
    message: "Campaign and associated files deleted",
    data: updated,
  });
});

const getCampaignById = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const campaign = await campaignService.getCampaignById(
    req.params.id,
    user.companyId
  );

  res.status(httpStatus.OK).json({
    message: "Campaign fetched successfully",
    data: campaign,
  });
});

const deleteDocumentsByQuery = catchAsync(
  async (req: Request, res: Response) => {
    const campaignId = req.params.id;
    const docIdsParam = req.query.docIds as string;

    if (!docIdsParam) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No document IDs provided");
    }

    const docIds = docIdsParam.split(",").map((id) => id.trim());

    const deletedDocs = await campaignService.deleteDocumentsByIds(
      docIds,
      campaignId
    );

    res.status(httpStatus.OK).json({
      message: "Documents deleted successfully",
      deletedDocuments: deletedDocs,
    });
  }
);

const processCampaign = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const campaignId = req.params.id;

  const files = req.files as Express.Multer.File[];
  const remarks = req?.body?.remarks; // Get remarks from request body

  if (!files || files.length === 0) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Documents are required for processing campaign"
    );
  }

  // Map multer files into our DTO shape
  const documents = files.map((file) => ({
    fileName: file.originalname,
    filePath: path.basename(file.path),
    mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
    size: file.size,
  }));

  const campaign = await campaignService.processCampaign(
    campaignId,
    user?.companyId,
    remarks, // Pass remarks to service
    documents
  );

  res.status(httpStatus.OK).json({
    message: "Campaign processed successfully",
    data: campaign,
  });
});

// const processCampaign = catchAsync(async (req: Request, res: Response) => {
//   try {
//     console.log("Processing campaign request");

//     const user = req.user as AuthUser;
//     const campaignId = req.params.id;
//     const files = req.files as Express.Multer.File[];
//     const remarks = req.body.remarks;

//     console.log("User:", user?.id);
//     console.log("Campaign ID:", campaignId);
//     console.log("Files received:", files?.length);
//     console.log("Remarks:", remarks);

//     if (!files || files.length === 0) {
//       throw new ApiError(httpStatus.BAD_REQUEST, "Documents are required");
//     }

//     const documents = files.map((file) => ({
//       fileName: file.originalname,
//       filePath: path.basename(file.path),
//       mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
//       size: file.size,
//     }));

//     const result = await campaignService.processCampaign(
//       campaignId,
//       user.companyId,
//       remarks,
//       documents
//     );

//     res.status(httpStatus.OK).json({
//       message: "Campaign processed successfully",
//       data: result,
//     });
//   } catch (error) {
//     console.error("Error processing campaign:", error);
//     res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
//       message: "Server error during campaign processing",
//       error: error,
//     });
//   }
// });

const getCampaignsByStatus = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const { status } = req.query;

  if (!status) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Status query parameter is required"
    );
  }

  const campaigns = await campaignService.getCampaignsByStatus(
    user.companyId,
    status as string
  );
  res.status(httpStatus.OK).json({ data: campaigns });
});

const deleteDocument = catchAsync(async (req: Request, res: Response) => {
  // const campaignId = req.params.id;
  const campaignId = req.query.campaignId as string;
  const documentId = req.query.documentId as string;

  if (!documentId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Document ID is required");
  }
  if (!campaignId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Campaign ID is required");
  }

  const deletedDoc = await campaignService.deleteDocumentsByIds(
    [documentId],
    campaignId
  );

  res.status(httpStatus.OK).json({
    message: "Document deleted successfully",
    data: deletedDoc[0],
  });
});

export default {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  processCampaign,
  getCampaignsByStatus,
  deleteDocument,
  deleteDocumentsByQuery,
};
