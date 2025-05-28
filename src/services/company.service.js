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
exports.updateCompanyProfile = void 0;
const http_status_1 = __importDefault(require("http-status"));
const client_1 = __importDefault(require("../client"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const client_2 = require("@prisma/client");
/**
 * Create a company
 * @param {Object} companyCode
 * @returns {Promise<User>}
 */
const createCompany = (organizationName_1, phoneNumber_1, companyCode_1, email_1, notes_1, ...args_1) => __awaiter(void 0, [organizationName_1, phoneNumber_1, companyCode_1, email_1, notes_1, ...args_1], void 0, function* (organizationName, phoneNumber, companyCode, email, notes, level = client_2.Level.REGION) {
    if (email && (yield getCompanyByEmail(email))) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Email already taken");
    }
    return client_1.default.company.create({
        data: {
            organizationName,
            phoneNumber,
            companyCode,
            email,
            notes,
            level,
        },
    });
});
/**
 * Get user by id
 * @param {ObjectId} id
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<User, Key> | null>}
 */
const getCompanyById = (id_1, ...args_1) => __awaiter(void 0, [id_1, ...args_1], void 0, function* (id, keys = [
    "id",
    "organizationName",
    "phoneNumber",
    "companyCode",
    "email",
    "createdAt",
    "updatedAt",
]) {
    return client_1.default.user.findUnique({
        where: { id },
        select: keys.reduce((obj, k) => (Object.assign(Object.assign({}, obj), { [k]: true })), {}),
    });
});
/**
 * Get company by email
 * @param {string} email
 * @param {Array<Key>} keys
 * @returns {Promise<Pick<Company, Key> | null>}
 */
const getCompanyByEmail = (email_1, ...args_1) => __awaiter(void 0, [email_1, ...args_1], void 0, function* (email, keys = [
    "id",
    "email",
    "organizationName",
    "phoneNumber",
    "companyCode",
    "createdAt",
    "updatedAt",
]) {
    return client_1.default.company.findFirst({
        where: { email },
        select: keys.reduce((obj, k) => (Object.assign(Object.assign({}, obj), { [k]: true })), {}),
    });
});
const getCompanyProfile = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    const company = yield client_1.default.company.findUnique({
        where: { id: companyId },
    });
    if (!company) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Company not found");
    }
    return company;
});
const updateCompanyProfile = (companyId, updates) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.company.findUnique({
        where: { id: companyId },
    });
    if (!existing)
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Company not found");
    if (updates.email && updates.email !== existing.email) {
        if (yield client_1.default.company.findFirst({ where: { email: updates.email } })) {
            throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Email already taken");
        }
    }
    // 3. Destructure to remove any companyCode property
    const /* companyCode, */ allowedUpdates = __rest(updates, []);
    return client_1.default.company.update({
        where: { id: companyId },
        data: updates,
    });
});
exports.updateCompanyProfile = updateCompanyProfile;
exports.default = {
    createCompany,
    getCompanyById,
    getCompanyProfile,
    updateCompanyProfile: exports.updateCompanyProfile,
};
