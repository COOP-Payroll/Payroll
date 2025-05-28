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
exports.verifyAccountController = exports.assignMasterAccount = void 0;
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const http_status_1 = __importDefault(require("http-status"));
const account_service_1 = __importDefault(require("../services/account.service"));
const path_1 = __importDefault(require("path"));
const mime_types_1 = __importDefault(require("mime-types"));
// Helper to map multer files to LetterFile[]
function mapFilesToLetterFiles(files = []) {
    return files.map((file) => ({
        fileName: file.originalname,
        filePath: path_1.default.basename(file.path),
        mimeType: file.mimetype || mime_types_1.default.lookup(file.originalname) || undefined,
        size: file.size,
    }));
}
const createAccount = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const files = req.files; // upload.array("documents")
    const documents = mapFilesToLetterFiles(files);
    const account = yield account_service_1.default.createAccount({
        accountNumber: req.body.accountNumber,
        companyId: user.companyId,
        documents,
    });
    res.status(http_status_1.default.CREATED).json({
        message: "Account created",
        data: account,
    });
}));
const getAllAccounts = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const accounts = yield account_service_1.default.getAllAccounts(user.companyId);
    res.status(http_status_1.default.OK).json({ data: accounts });
}));
const getAccountById = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const account = yield account_service_1.default.getAccountById(req.params.id, user.companyId);
    res.status(http_status_1.default.OK).json({ data: account });
}));
const updateAccount = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const files = req.files;
    const documents = mapFilesToLetterFiles(files);
    const account = yield account_service_1.default.updateAccount(req.params.id, user.companyId, {
        accountNumber: req.body.accountNumber,
        documents: documents.length ? documents : undefined,
    });
    res.status(http_status_1.default.OK).json({
        message: "Account updated successfully",
        data: account,
    });
}));
const deleteAccount = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const deleted = yield account_service_1.default.deleteAccount(req.params.id, user.companyId);
    res.status(http_status_1.default.OK).json({
        message: "Account deleted (soft)",
        data: deleted,
    });
}));
exports.assignMasterAccount = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // 1) Ensure multer ran and gave you files
    // if (!req.files || !(req.files as Express.Multer.File[]).length) {
    //   throw new ApiError(
    //     httpStatus.BAD_REQUEST,
    //     "At least one document file must be uploaded"
    //   );
    // }
    const files = req.files;
    // 2) Map to your DTO
    const documents = files.map((file) => ({
        fileName: file.originalname,
        filePath: path_1.default.basename(file.path),
        mimeType: file.mimetype || mime_types_1.default.lookup(file.originalname) || undefined,
        size: file.size,
    }));
    // 3) Call service (no need to guard again—you're guaranteed docs exist)
    const account = yield account_service_1.default.assignMasterAccount(req.params.id, user.companyId, documents);
    res.status(http_status_1.default.OK).json({
        message: "Master account assigned successfully",
        data: account,
    });
}));
exports.verifyAccountController = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accountNumber } = req.body;
    const customerInfo = yield account_service_1.default.verifyAccountByNumber(accountNumber);
    res.status(200).json({
        success: true,
        message: "Valid account number",
        data: customerInfo,
    });
}));
const updateAccountVerification = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const { isVerified } = req.body;
    const account = yield account_service_1.default.updateAccountVerification(req.params.id, user.companyId, isVerified);
    res.status(http_status_1.default.OK).json({
        message: "Account verification status updated successfully",
        data: account,
    });
}));
exports.default = {
    createAccount,
    getAllAccounts,
    getAccountById,
    updateAccount,
    deleteAccount,
    assignMasterAccount: exports.assignMasterAccount,
    verifyAccountController: exports.verifyAccountController,
    updateAccountVerification,
};
