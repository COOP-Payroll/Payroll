"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaign = void 0;
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const http_status_1 = __importDefault(require("http-status"));
const campaign_service_1 = __importDefault(require("../services/campaign.service"));
const client_1 = __importDefault(require("../client"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
const api_error_1 = __importDefault(require("../utils/api-error"));
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
exports.createCampaign = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const files = req.files;
    // Map multer files into our DTO shape
    const documents = (files || []).map((file) => ({
        fileName: file.originalname,
        filePath: path_1.default.basename(file.path),
        mimeType: file.mimetype || mime_types_1.default.lookup(file.originalname) || undefined,
        size: file.size,
    }));
    const dto = {
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
    const campaign = yield campaign_service_1.default.createCampaign(dto);
    res.status(http_status_1.default.CREATED).json({
        message: "Campaign created successfully",
        data: campaign,
    });
}));
const getAllCampaigns = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const campaigns = yield campaign_service_1.default.getAllCampaigns(user.companyId);
    res.status(http_status_1.default.OK).json({ data: campaigns });
}));
const updateCampaign = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const user = req.user;
    const campaignId = req.params.id;
    // Handle uploaded documents if any
    if ((_a = req.files) === null || _a === void 0 ? void 0 : _a.length) {
        const files = req.files;
        const documentCreations = files.map((file) => client_1.default.document.create({
            data: {
                fileName: file.originalname,
                filePath: file.path,
                mimeType: file.mimetype,
                size: file.size,
                campaignId: campaignId,
            },
        }));
        yield Promise.all(documentCreations);
    }
    // Extract and process form fields from req.body
    const { name, description, startDate, endDate, budget, budgetSource } = req.body;
    const updateData = Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (description && { description })), (startDate && { startDate: new Date(startDate) })), (endDate && { endDate: new Date(endDate) })), (budget && { budget: parseFloat(budget) })), (budgetSource && { budgetSource }));
    const updatedCampaign = yield campaign_service_1.default.updateCampaign(campaignId, user.companyId, updateData);
    res.status(http_status_1.default.OK).json({
        message: "Campaign updated successfully",
        data: updatedCampaign,
    });
}));
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
const deleteCampaign = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // First get campaign documents
    const documents = yield client_1.default.document.findMany({
        where: { campaignId: req.params.id },
    });
    // Delete campaign and related documents
    const updated = yield campaign_service_1.default.deleteCampaign(req.params.id, user.companyId);
    res.status(http_status_1.default.OK).json({
        message: "Campaign and associated files deleted",
        data: updated,
    });
}));
const getCampaignById = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const campaign = yield campaign_service_1.default.getCampaignById(req.params.id, user.companyId);
    res.status(http_status_1.default.OK).json({
        message: "Campaign fetched successfully",
        data: campaign,
    });
}));
const deleteDocumentsByQuery = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const campaignId = req.params.id;
    const docIdsParam = req.query.docIds;
    if (!docIdsParam) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "No document IDs provided");
    }
    const docIds = docIdsParam.split(",").map((id) => id.trim());
    const deletedDocs = yield campaign_service_1.default.deleteDocumentsByIds(docIds, campaignId);
    res.status(http_status_1.default.OK).json({
        message: "Documents deleted successfully",
        deletedDocuments: deletedDocs,
    });
}));
const processCampaign = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const campaignId = req.params.id;
    const campaign = yield campaign_service_1.default.processCampaign(campaignId, user.companyId);
    res.status(http_status_1.default.OK).json({
        message: "Campaign processed successfully",
        data: campaign,
    });
}));
const getCampaignsByStatus = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { status } = req.query;
    if (!status) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Status query parameter is required");
    }
    const campaigns = yield campaign_service_1.default.getCampaignsByStatus(user.companyId, status);
    res.status(http_status_1.default.OK).json({ data: campaigns });
}));
exports.default = {
    createCampaign: exports.createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    processCampaign,
    getCampaignsByStatus,
};
