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
// const createCampaign = catchAsync(async (req: Request, res: Response) => {
//   const files = req.files as Express.Multer.File[];
//   const user = req.user as AuthUser;
//   // First create the campaign without documents
//   const campaign = await campaignService.createCampaign({
//     ...req.body,
//     startDate: new Date(req.body.startDate),
//     endDate: new Date(req.body.endDate),
//     budget: parseFloat(req.body.budget),
//     createdById: user.id,
//     companyId: user.companyId,
//   });

//   if (files?.length > 0) {
//     await Promise.all(
//       files.map((file) =>
//         prisma.document.create({
//           data: {
//             fileName: file.originalname,
//             filePath: path.basename(file.path),
//             mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
//             size: file.size,
//             campaign: {
//               connect: { id: campaign.id },
//             },
//           },
//         })
//       )
//     );
//   }
//   // Fetch the campaign with documents
//   const campaignWithDocuments = await prisma.campaign.findUnique({
//     where: { id: campaign.id },
//     include: { documents: true },
//   });

//   res.status(httpStatus.CREATED).json({
//     message: "Campaign created",
//     data: campaignWithDocuments,
//   });
// });

export interface CreateCampaignDTO {
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  budgetSource: string;
  createdById: string;
  companyId: string;
  departmentId: string;
  documents?: {
    fileName: string;
    filePath: string;
    mimeType?: string;
    size?: number;
  }[];
}
// export const createCampaign = catchAsync(async (req: Request, res: Response) => {
//   const user = req.user as AuthUser;
//   const files = req.files as Express.Multer.File[];

//   // 1️⃣ Step 1: Create the campaign row
//   const dto: CreateCampaignDTO = {
//     name: req.body.name,
//     description: req.body.description,
//     startDate: new Date(req.body.startDate),
//     endDate: new Date(req.body.endDate),
//     budget: parseFloat(req.body.budget),
//     budgetSource: req.body.budgetSource,
//     createdById: user.id,
//     companyId: user.companyId,
//   };
//   const campaign = await campaignService.createCampaign(dto);

//   // 2️⃣ Step 2: If any files were uploaded, create Document rows
//   if (files && files.length > 0) {
//     await Promise.all(
//       files.map((file) =>
//         prisma.document.create({
//           data: {
//             fileName: file.originalname,
//             filePath: path.basename(file.path),
//             mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
//             size: file.size,
//             campaign: { connect: { id: campaign.id } },
//           },
//         })
//       )
//     );
//   }

//   // 3️⃣ Fetch back the campaign including its documents
//   const campaignWithDocuments = await prisma.campaign.findUnique({
//     where: { id: campaign.id },
//     include: { documents: true },
//   });

//   // 4️⃣ Return to client
//   res.status(httpStatus.CREATED).json({
//     message: "Campaign created successfully",
//     data: campaignWithDocuments,
//   });
// });

export const createCampaign = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const files = req.files as Express.Multer.File[];

    console.log("BODY:", req.body);
    console.log("FILES:", req.files);

    // Map multer files into our DTO shape
    const documents = (files || []).map((file) => ({
      fileName: file.originalname,
      filePath: file?.filename,
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
      departmentId: req.body.departmentId,
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
  //fetch by department
  const campaigns = await campaignService.getAllCampaigns({
    companyId: user.companyId,
    departmentId: user.departmentId,
    isSuperAdmin: user.isSuperAdmin,
  });
  res.status(httpStatus.OK).json({ data: campaigns });
});

const fetchAllCampaigns = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  //fetch by department
  const campaigns = await campaignService.fetchAllCampaigns({
    companyId: user.companyId,
    // departmentId: user.departmentId,
    // isSuperAdmin: user.isSuperAdmin,
  });
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
          filePath: file.filename,
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

const processCampaign = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as AuthUser;
  const campaignId = req.params.id;

  console.log(">> processCampaign called");
  console.log(">> User:", user?.id, "Company:", user?.companyId);
  console.log(">> Campaign ID:", campaignId);

  const files = req.files as Express.Multer.File[];
  const remarks = req?.body?.remarks;

  if (!remarks) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Remarks is required");
  }
  if (!files || files.length === 0) {
    console.warn(">> No documents provided");
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Documents are required for processing campaign"
    );
  }

  console.log(">> Mapping uploaded documents");
  let documents;
  try {
    documents = files.map((file) => ({
      fileName: file.originalname,
      filePath: path.basename(file.path),
      mimeType: file.mimetype || mime.lookup(file.originalname) || undefined,
      size: file.size,
    }));
  } catch (err) {
    console.error(">> Error while mapping files:", err);
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      "Failed to process uploaded files"
    );
  }

  console.log(">> Calling campaignService.processCampaign");

  let campaign;
  try {
    campaign = await campaignService.processCampaign(
      campaignId,
      user?.companyId,
      remarks,
      user.id,
      documents
    );
  } catch (err) {
    console.error(">> Error in campaignService.processCampaign1:", err);
    throw new ApiError(
      httpStatus.SERVICE_UNAVAILABLE,
      `${err instanceof Error ? err.message : String(err)}`
    );
  }

  console.log(">> Campaign processed successfully");

  res.status(httpStatus.OK).json({
    message: "Campaign processed successfully",
    data: campaign,
  });
});

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
    {
      companyId: user.companyId,
      status: status as string,
      departmentId: user.departmentId,
    }
    // user.companyId,
    // status as string
  );
  res.status(httpStatus.OK).json({ data: campaigns });
});
//fetchcampaign by status
const fetchCampaignsByStatus = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user as AuthUser;
    const { status } = req.query;

    if (!status) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Status query parameter is required"
      );
    }

    const campaigns = await campaignService.getCampaignsByStatus(
      {
        companyId: user.companyId,
        status: status as string,
        // departmentId: user.departmentId,
      }
      // user.companyId,
      // status as string
    );
    res.status(httpStatus.OK).json({ data: campaigns });
  }
);
const deleteDocumentsByQuery = catchAsync(
  async (req: Request, res: Response) => {
    const campaignId = req.params.campaignId;
    const docIdsParam = req.query.documentId as string;

    console.log("dkdfddjjdjdjdj", docIdsParam);
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
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  processCampaign,
  getCampaignsByStatus,
  deleteDocumentsByQuery,
  fetchCampaignsByStatus,
  fetchAllCampaigns,
};
