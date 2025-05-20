import { Request, Response } from "express";
import catchAsync from "../utils/catch-async";
import httpStatus from "http-status";
import campaignService from "../services/campaign.service";
import prisma from "../client";
import fs from "fs/promises";
import path from "path";
import mime from "mime-types";
const createCampaign = catchAsync(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];

  // First create the campaign without documents
  const campaign = await campaignService.createCampaign({
    ...req.body,
    startDate: new Date(req.body.startDate),
    endDate: new Date(req.body.endDate),
    budget: parseFloat(req.body.budget),
    createdById: req.body.createdById,
    companyId: req.body.companyId,
  });

  // Then create and connect documents
  if (files?.length) {
    await Promise.all(
      files.map(async (file) => {
        await prisma.document.create({
          data: {
            fileName: file.originalname,
            filePath: path.basename(file.path),
            mimeType:
              file.mimetype || mime.lookup(file.originalname) || undefined,
            size: file.size,
            campaign: {
              connect: { id: campaign.id },
            },
          },
        });
      })
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

const getAllCampaigns = catchAsync(async (_req: Request, res: Response) => {
  const campaigns = await campaignService.getAllCampaigns();
  res.status(httpStatus.OK).json({ data: campaigns });
});

const updateCampaign = catchAsync(async (req: Request, res: Response) => {
  // Handle file updates if needed
  if (req.files?.length) {
    const files = req.files as Express.Multer.File[];
    const documentCreations = files.map(async (file) => {
      return await prisma.document.create({
        data: {
          fileName: file.originalname,
          filePath: file.path,
          mimeType: file.mimetype,
          size: file.size,
          campaignId: req.params.id,
        },
      });
    });
    await Promise.all(documentCreations);
  }

  const campaign = await campaignService.updateCampaign(
    req.params.id,
    req.body
  );
  res
    .status(httpStatus.OK)
    .json({ message: "Campaign updated", data: campaign });
});

const deleteCampaign = catchAsync(async (req: Request, res: Response) => {
  // First get campaign documents
  const documents = await prisma.document.findMany({
    where: { campaignId: req.params.id },
  });

  // Delete campaign and related documents
  const updated = await campaignService.deleteCampaign(req.params.id);

  res.status(httpStatus.OK).json({
    message: "Campaign and associated files deleted",
    data: updated,
  });
});

export default {
  createCampaign,
  getAllCampaigns,
  updateCampaign,
  deleteCampaign,
};
