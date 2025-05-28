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
exports.updateCompany = void 0;
const company_service_1 = __importDefault(require("../services/company.service"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const http_status_1 = __importDefault(require("http-status"));
const registerCompany = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizationName, phoneNumber, companyCode, email, notes } = req.body;
    const company = yield company_service_1.default.createCompany(organizationName, phoneNumber, companyCode, email, notes);
    res
        .status(http_status_1.default.CREATED)
        .send({ data: company, message: "Company created successfully!" });
}));
// const getCompany = catchAsync(async (req, res) => {
//     const user = req.user as User;
//     const company = await companyService.getCompanyById(user.id);
//     if (!user) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Company not found');
//   }
//     res.status(httpStatus.OK).send({data: company, message: "Company retrieved successfully"})
// })
// const updateCompany = catchAsync(async (req, res) => {
//   const user = await companyService.updateCompanyById(req.params.userId, req.body);
//   res.send(user);
// });
const getCompany = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!(user === null || user === void 0 ? void 0 : user.companyId)) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "User has no company assigned");
    }
    const company = yield company_service_1.default.getCompanyProfile(user.companyId);
    if (!company) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Company not found");
    }
    res.status(http_status_1.default.OK).send({
        data: company,
        message: "Company retrieved successfully",
    });
}));
exports.updateCompany = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user.companyId)
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "No company assigned");
    // const updates = req.body;
    const _a = req.body, { companyCode } = _a, updates = __rest(_a, ["companyCode"]);
    const company = yield company_service_1.default.updateCompanyProfile(user.companyId, updates);
    res.status(http_status_1.default.OK).json({
        message: "Company updated successfully",
        data: company,
    });
}));
exports.default = {
    registerCompany,
    getCompany,
    updateCompany: exports.updateCompany,
};
