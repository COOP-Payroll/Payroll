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
const createCampaign = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const user = req.user as AuthUser;
  // First create the campaign without documents
  const campaign = await campaignService.createCampaign({
    ...req.body,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    budget: parseFloat(req.body.budget),
    createdById: user.id,
    companyId: user.companyId,
  });

  // Then create and connect documents
  // if (files?.length) {
  //   await Promise.all(
  //     files.map(async (file) => {
  //       await prisma.document.create({
  //         data: {
  //           fileName: file.originalname,
  //           filePath: path.basename(file.path),
  //           mimeType:
  //             file.mimetype || mime.lookup(file.originalname) || undefined,
  //           size: file.size,
  //           campaign: {
  //             connect: { id: campaign.id },
  //           },
  //         },
  //       });
  //     })
  //   );
  // }


    // Step 2: Attach uploaded documents (if any)
  if (files?.length) {
    await Promise.all(
      files.map((file) =>
        prisma.document.create({
          data: {
            fileName: file.originalname,
            filePath: path.basename(file.path),
            mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
            size: file.size,
            campaign: {
              connect: { id: campaign.id },
            },
          },
        })
      )
    );
  }
  // Fetch the campaign with documents
  const campaignWithDocuments = await prisma.campaign.findUnique({
    where: { id: campaign.id },
    include: { documents: true },
  });

  res.status(httpStatus.CREATED).json({
    message: "Campaign created",
    data: campaignWithDocuments,
  });
});

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

export default {
  createCampaign,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
  getCampaignById,
  deleteDocumentsByQuery,
};
