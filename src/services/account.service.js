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
exports.verifyAccountByNumber = void 0;
const client_1 = __importDefault(require("../client"));
const http_status_1 = __importDefault(require("http-status"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const axios_1 = __importDefault(require("axios"));
const createAccount = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountNumber, companyId, documents } = data;
    if (!accountNumber || !companyId) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Missing required fields");
    }
    // **Check uniqueness first**
    const existingAccount = yield client_1.default.account.findFirst({
        where: { companyId, accountNumber },
    });
    if (existingAccount) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, `Account number ${accountNumber} already exists`);
    }
    // Create account with nested documents
    const account = yield client_1.default.account.create({
        data: {
            accountNumber,
            companyId,
            documents: documents && documents.length > 0
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
    return account;
});
const getAllAccounts = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.default.account.findMany({
        where: { companyId, isActive: true },
        include: { documents: true },
        orderBy: { createdAt: "desc" },
    });
});
const getAccountById = (id, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield client_1.default.account.findFirst({
        where: { id, companyId },
        include: { documents: true },
    });
    if (!account) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Account not found");
    }
    return account;
});
const updateAccount = (id, companyId, data) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.account.findFirst({
        where: { id, companyId },
    });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Account not found");
    }
    const { accountNumber, documents } = data;
    const account = yield client_1.default.account.update({
        where: { id },
        data: Object.assign(Object.assign({}, (accountNumber != null && { accountNumber })), { documents: documents && documents.length > 0
                ? {
                    create: documents.map((doc) => ({
                        fileName: doc.fileName,
                        filePath: doc.filePath,
                        mimeType: doc.mimeType,
                        size: doc.size,
                    })),
                }
                : undefined }),
        include: { documents: true },
    });
    return account;
});
const deleteAccount = (id, companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.account.findFirst({
        where: { id, companyId },
    });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Account not found");
    }
    return client_1.default.account.update({
        where: { id },
        data: { isActive: false },
    });
});
const assignMasterAccount = (id, companyId, documents) => __awaiter(void 0, void 0, void 0, function* () {
    const account = yield client_1.default.account.findFirst({
        where: { id, companyId },
    });
    if (!account) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Account not found");
    }
    if (account.isMaster) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Account is already the master");
    }
    // Ensure no other master exists
    const existingMaster = yield client_1.default.account.findFirst({
        where: { companyId, isMaster: true },
    });
    if (existingMaster && existingMaster.id !== id) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Another account is already set as master. Unassign it first.");
    }
    const updateData = { isMaster: true };
    if (documents && documents.length > 0) {
        updateData.documents = {
            create: documents.map((doc) => ({
                fileName: doc.fileName,
                filePath: doc.filePath,
                mimeType: doc.mimeType,
                size: doc.size,
            })),
        };
    }
    const updated = yield client_1.default.account.update({
        where: { id },
        data: updateData,
        include: { documents: true },
    });
    return updated;
});
const verifyAccountByNumber = (accountNumber) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    if (!accountNumber) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Account number is required");
    }
    const url = "http://10.1.245.150:7081/v1/cbo/";
    const payload = {
        AccountDetailsRequest: {
            ESBHeader: {
                serviceCode: "180000",
                channel: "USSD",
                Service_name: "accountEnquiryMC",
                Message_Id: Date.now().toString(),
            },
            ACCTCOMPANYVIEWType: [{ criteriaValue: accountNumber }],
        },
    };
    let response;
    try {
        response = yield axios_1.default.post(url, payload);
    }
    catch (err) {
        throw new api_error_1.default(http_status_1.default.SERVICE_UNAVAILABLE, "Failed to connect to account verification service");
    }
    const status = (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.AccountDetailsResponse) === null || _b === void 0 ? void 0 : _b.ESBStatus) === null || _c === void 0 ? void 0 : _c.Status;
    if (status === "Failure") {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, `External verification failed for account number: ${accountNumber}`);
    }
    const info = response.data.AccountDetailsResponse.CustomerInfo;
    if (!info) {
        throw new api_error_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, "Invalid response from external verification service");
    }
    return info;
});
exports.verifyAccountByNumber = verifyAccountByNumber;
const updateAccountVerification = (id, companyId, isVerified) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.account.findFirst({
        where: { id, companyId },
    });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Account not found");
    }
    if (existing.isVerified) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Account already verified");
    }
    const account = yield client_1.default.account.update({
        where: { id },
        data: { isVerified },
        include: { documents: true },
    });
    return account;
});
exports.default = {
    createAccount,
    getAllAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
    assignMasterAccount,
    verifyAccountByNumber: exports.verifyAccountByNumber,
    updateAccountVerification,
};
