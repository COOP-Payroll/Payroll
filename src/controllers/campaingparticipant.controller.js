"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.registerBulkCampaignParticipants = exports.downloadParticipantTemplate = exports.updateCampaignParticipant = void 0;
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const http_status_1 = __importDefault(require("http-status"));
const campaignparticipant_service_1 = __importDefault(require("../services/campaignparticipant.service"));
const exceljs_1 = __importDefault(require("exceljs"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const XLSX = __importStar(require("xlsx"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const registerCampaignParticipant = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const user = req.user;
    const { campaignId, numberOfDaysInUrban, numberOfDaysInRural, fullName, gender, address, phoneNumber, accountNumber, paymentMethod, isVerified, detail, } = req.body;
    const data = yield campaignparticipant_service_1.default.registerCampaignParticipant({
        campaignId,
        numberOfDaysInUrban: Number(numberOfDaysInUrban),
        numberOfDaysInRural: Number(numberOfDaysInRural),
        fullName,
        gender,
        address,
        phoneNumber,
        accountNumber,
        paymentMethod,
        companyId: user.companyId,
        detail,
        isVerified,
        files,
    });
    res.status(http_status_1.default.CREATED).json({
        message: "Campaign participant registered successfully",
        data,
    });
}));
exports.updateCampaignParticipant = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const user = req.user;
    const companyId = user.companyId;
    const files = req.files;
    const { numberOfDaysInUrban, numberOfDaysInRural, fullName, gender, address, phoneNumber, accountNumber, paymentMethod, detail, } = req.body;
    const parsedNumberOfDaysInUrban = parseInt(numberOfDaysInUrban, 10);
    const parsedNumberOfDaysInRural = parseInt(numberOfDaysInRural, 10);
    if (isNaN(parsedNumberOfDaysInUrban) || isNaN(parsedNumberOfDaysInRural)) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            message: "Invalid number format for urban or rural days",
        });
    }
    const data = yield campaignparticipant_service_1.default.updateCampaignParticipant(id, companyId, {
        numberOfDaysInUrban: parsedNumberOfDaysInUrban,
        numberOfDaysInRural: parsedNumberOfDaysInRural,
        fullName,
        gender,
        address,
        phoneNumber,
        accountNumber,
        paymentMethod,
        detail,
        files,
    });
    res.status(http_status_1.default.OK).json({
        message: "Campaign participant updated successfully",
        data,
    });
}));
const getParticipantsByCampaignId = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const campaignId = req.query.campaignId;
    if (!campaignId) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            message: "campaignId query parameter is required",
        });
    }
    const participants = yield campaignparticipant_service_1.default.getParticipantsByCampaignId(campaignId);
    res.status(http_status_1.default.OK).json({ data: participants });
}));
const getAllPublishedCampaigns = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const campaignId = req.query.campaignId;
    if (!campaignId) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            message: "campaignId query parameter is required",
        });
    }
    const campaigns = yield campaignparticipant_service_1.default.getAllPublishedCampaigns(campaignId);
    res.status(http_status_1.default.OK).json({ data: campaigns });
}));
const getAllApprovedCampaigns = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const campaignId = req.query.campaignId;
    if (!campaignId) {
        return res.status(http_status_1.default.BAD_REQUEST).json({
            message: "campaignId query parameter is required",
        });
    }
    const campaigns = yield campaignparticipant_service_1.default.getAllApprovedCampaigns(campaignId);
    res.status(http_status_1.default.OK).json({ data: campaigns });
}));
const downloadParticipantTemplate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const workbook = new exceljs_1.default.Workbook();
    const worksheet = workbook.addWorksheet("Campaign Participants");
    // Define column headers
    worksheet.columns = [
        { header: "Full Name", key: "fullName", width: 40 },
        { header: "Gender", key: "gender", width: 20 },
        { header: "Address", key: "address", width: 40 },
        { header: "Phone Number", key: "phoneNumber", width: 35 },
        { header: "Account Number", key: "accountNumber", width: 35 },
        { header: "Payment Method", key: "paymentMethod", width: 30 },
        {
            header: "Number of Days in Urban",
            key: "numberOfDaysInUrban",
            width: 35,
        },
        {
            header: "Number of Days in Rural",
            key: "numberOfDaysInRural",
            width: 35,
        },
        { header: "Detail", key: "detail", width: 40 },
    ];
    // Bold and center header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = {
        name: "Calibri",
        size: 12,
        bold: true,
        color: { argb: "FFFFFFFF" }, // white text
    };
    headerRow.alignment = { horizontal: "center" };
    headerRow.eachCell((cell) => {
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF305496" },
        };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
        };
    });
    // Create dropdowns for Gender (B column) and PaymentMethod (F column)
    for (let i = 2; i <= 100; i++) {
        worksheet.getCell(`B${i}`).dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: ['"MALE,FEMALE"'],
            showErrorMessage: true,
            errorStyle: "error",
            errorTitle: "Invalid Gender",
            error: "Please select either MALE or FEMALE from the dropdown.",
        };
        worksheet.getCell(`F${i}`).dataValidation = {
            type: "list",
            allowBlank: false,
            formulae: ['"PHONENUMBER,ACCOUNTNUMBER"'],
            showErrorMessage: true,
            errorStyle: "error",
            errorTitle: "Invalid Payment Method",
            error: "Please select either PHONENUMBER or ACCOUNTNUMBER from the dropdown.",
        };
    }
    // Set headers for download
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="campaign-participants-template.xlsx"');
    yield workbook.xlsx.write(res);
    res.end();
});
exports.downloadParticipantTemplate = downloadParticipantTemplate;
exports.registerBulkCampaignParticipants = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!(user === null || user === void 0 ? void 0 : user.companyId)) {
        throw new api_error_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized access");
    }
    const campaignId = req.params.id;
    if (!campaignId) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Campaign ID is required");
    }
    const file = req.file;
    if (!file) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "No Excel file uploaded");
    }
    const filePath = path_1.default.resolve(file.path);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // const participants: any[] = XLSX.utils.sheet_to_json(sheet);
    const rawParticipants = XLSX.utils.sheet_to_json(sheet, {
        defval: "",
    });
    const participants = rawParticipants.map((row, index) => {
        var _a, _b, _c, _d, _e, _f, _g;
        return ({
            fullName: (_a = row["Full Name"]) === null || _a === void 0 ? void 0 : _a.toString().trim(),
            gender: (_b = row["Gender"]) === null || _b === void 0 ? void 0 : _b.toString().trim().toUpperCase(),
            address: (_c = row["Address"]) === null || _c === void 0 ? void 0 : _c.toString().trim(),
            phoneNumber: (_d = row["Phone Number"]) === null || _d === void 0 ? void 0 : _d.toString().trim(),
            accountNumber: (_e = row["Account Number"]) === null || _e === void 0 ? void 0 : _e.toString().trim(),
            paymentMethod: (_f = row["Payment Method"]) === null || _f === void 0 ? void 0 : _f.toString().trim().toUpperCase(),
            numberOfDaysInUrban: row["Number of Days in Urban"],
            numberOfDaysInRural: row["Number of Days in Rural"],
            detail: ((_g = row["Detail"]) === null || _g === void 0 ? void 0 : _g.toString().trim()) || "",
        });
    });
    if (!participants.length) {
        fs_1.default.unlinkSync(filePath);
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Excel file is empty");
    }
    const requiredFields = [
        "fullName",
        "gender",
        "address",
        "phoneNumber",
        "accountNumber",
        "paymentMethod",
        "numberOfDaysInUrban",
        "numberOfDaysInRural",
    ];
    const result = yield campaignparticipant_service_1.default.registerBulkCampaignParticipants({
        participants: participants.map((p) => (Object.assign({}, p))),
        companyId: user.companyId,
        campaignId,
    });
    fs_1.default.unlinkSync(filePath); // Cleanup file
    res.status(http_status_1.default.CREATED).json({
        message: "Participants registered successfully",
        count: result.length,
        data: result,
    });
}));
const updateAccountVerification = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { isVerified } = req.body;
    const account = yield campaignparticipant_service_1.default.updateAccountVerification(req.params.id, user.companyId, isVerified);
    res.status(http_status_1.default.OK).json({
        message: "Account verification status updated successfully",
        data: account,
    });
}));
exports.default = {
    registerCampaignParticipant,
    downloadParticipantTemplate: exports.downloadParticipantTemplate,
    getParticipantsByCampaignId,
    getAllPublishedCampaigns,
    getAllApprovedCampaigns,
    updateCampaignParticipant: exports.updateCampaignParticipant,
    registerBulkCampaignParticipants: exports.registerBulkCampaignParticipants,
    updateAccountVerification,
};
