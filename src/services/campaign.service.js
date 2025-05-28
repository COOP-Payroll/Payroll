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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaign = void 0;
const client_1 = __importDefault(require("../client"));
const http_status_1 = __importDefault(require("http-status"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const promises_1 = __importDefault(require("fs/promises"));
const client_2 = require("@prisma/client");
const createCampaign = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, description, startDate, endDate, budget, budgetSource, createdById, companyId, documents, } = data;
    if (!name ||
        !startDate ||
        !endDate ||
        !budgetSource ||
        !createdById ||
        !companyId) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Missing required campaign fields");
    }
    // Prevent duplicate name per company
    const exists = yield client_1.default.campaign.findFirst({
        where: { name, companyId },
    });
    if (exists) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, `Campaign named "${name}" already exists.`);
    }
    return client_1.default.campaign.create({
        data: {
            name,
            description,
            startDate,
            endDate,
            budget,
            budgetSource,
            createdById,
            companyId,
            documents: documents && documents.length
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
});
exports.createCampaign = createCampaign;
const getAllCampaigns = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const campaigns = yield client_1.default.campaign.findMany({
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
        var _a, _b, _c;
        const { createdBy } = campaign, rest = __rest(campaign, ["createdBy"]);
        const flattenedCreatedBy = {
            id: createdBy.id,
            name: createdBy.name,
            deptName: (_a = createdBy.department) === null || _a === void 0 ? void 0 : _a.deptName,
            shorthandRepresentation: (_b = createdBy.department) === null || _b === void 0 ? void 0 : _b.shorthandRepresentation,
            positionName: (_c = createdBy.position) === null || _c === void 0 ? void 0 : _c.positionName,
        };
        return Object.assign(Object.assign({}, rest), { createdBy: flattenedCreatedBy });
    });
});
const getCampaignById = (id, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const campaign = yield client_1.default.campaign.findUnique({
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
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Campaign not found");
    }
    // Flatten the nested objects into createdBy
    const { createdBy } = campaign, rest = __rest(campaign, ["createdBy"]);
    const flattenedCreatedBy = {
        id: createdBy.id,
        name: createdBy.name,
        deptName: (_a = createdBy.department) === null || _a === void 0 ? void 0 : _a.deptName,
        shorthandRepresentation: (_b = createdBy.department) === null || _b === void 0 ? void 0 : _b.shorthandRepresentation,
        positionName: (_c = createdBy.position) === null || _c === void 0 ? void 0 : _c.positionName,
    };
    return Object.assign(Object.assign({}, rest), { createdBy: flattenedCreatedBy });
});
const updateCampaign = (id, companyId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.campaign.findFirst({
        where: { id, companyId },
    });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Campaign not found");
    }
    // Explicitly prevent isActive or other protected fields from being updated
    const { name, description, startDate, endDate, budget, budgetSource } = data;
    return yield client_1.default.campaign.update({
        where: { id },
        data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name })), (description && { description })), (startDate && { startDate })), (endDate && { endDate })), (budget !== undefined && { budget })), (budgetSource && { budgetSource })),
    });
});
const deleteCampaign = (id, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.campaign.findUnique({
        where: { id, companyId, isActive: true },
    });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Campaign not found");
    }
    return yield client_1.default.campaign.update({
        where: { id },
        data: { isActive: false },
    });
});
const deleteDocumentsByIds = (docIds, campaignId) => __awaiter(void 0, void 0, void 0, function* () {
    // Optional: Validate each document belongs to the campaign
    const docs = yield client_1.default.document.findMany({
        where: {
            id: { in: docIds },
            campaignId,
        },
    });
    if (docs.length !== docIds.length) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Some documents not found or do not belong to the campaign");
    }
    // Optional: Delete files from disk
    for (const doc of docs) {
        try {
            yield promises_1.default.unlink(doc.filePath);
        }
        catch (err) {
            console.warn(`Failed to delete file: ${doc.filePath}`, err);
        }
    }
    yield client_1.default.document.deleteMany({
        where: {
            id: { in: docIds },
            campaignId,
        },
    });
    return docs;
});
const processCampaign = (campaignId, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const campaign = yield client_1.default.campaign.findUnique({
        where: { id: campaignId, companyId },
    });
    if (!campaign) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Campaign not found");
    }
    return client_1.default.campaign.update({
        where: { id: campaignId },
        data: { status: "PROCESSED" },
        include: {
            documents: true,
        },
    });
});
const getCampaignsByStatus = (companyId, status) => __awaiter(void 0, void 0, void 0, function* () {
    // Validate status
    const validStatuses = ["ACTIVE", "PROCESSED", "APPROVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }
    const campaigns = yield client_1.default.campaign.findMany({
        where: {
            isActive: true,
            companyId,
            status: status,
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
});
const updateCampaignStatus = (campaignId, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updatedCampaign = yield client_1.default.campaign.update({
            where: { id: campaignId },
            data: { status },
        });
        return updatedCampaign;
    }
    catch (error) {
        if (error instanceof client_2.Prisma.PrismaClientKnownRequestError &&
            error.code === "P2025") {
            throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Campaign not found");
        }
        throw error;
    }
});
exports.default = {
    createCampaign: exports.createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    deleteDocumentsByIds,
    processCampaign,
    getCampaignsByStatus,
    updateCampaignStatus,
};
