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
const client_1 = __importDefault(require("../client"));
const http_status_1 = __importDefault(require("http-status"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const createDepartment = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const { deptName, location, shorthandRepresentation, companyId } = data;
    // Validate deptName
    if (!deptName || typeof deptName !== "string" || !deptName.trim()) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Department name is required");
    }
    // Validate shorthandRepresentation
    // Validate companyId
    if (!companyId || typeof companyId !== "string") {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Valid companyId is required");
    }
    // Check for duplicate department in the same company
    const existing = yield client_1.default.department.findFirst({
        where: {
            deptName: deptName.trim(),
            companyId,
        },
    });
    if (existing) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "Department already exists in this company");
    }
    // Create the department
    return client_1.default.department.create({
        data: {
            deptName: deptName.trim(),
            shorthandRepresentation: shorthandRepresentation === null || shorthandRepresentation === void 0 ? void 0 : shorthandRepresentation.trim(),
            location: (location === null || location === void 0 ? void 0 : location.trim()) || undefined,
            companyId,
        },
    });
});
const getAllDepartments = (companyId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield client_1.default.department.findMany({
        where: {
            companyId: companyId,
            isActive: true,
        }, // or true, depending on your needs
        include: {
            company: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
});
const getDepartmentById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return client_1.default.department.findUnique({
        where: { id },
        include: {
            company: true,
            departmentUsers: true,
        },
    });
});
const updateDepartment = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    //   if (data.deptName) {
    //     const duplicate = await prisma.department.findFirst({
    //       where: {
    //         deptName: data.deptName,
    //         NOT: { id }, // exclude current department
    //       },
    //     });
    //     if (duplicate) {
    //       throw new ApiError(httpStatus.CONFLICT, "Department name must be unique");
    //     }
    //   }
    const existing = yield client_1.default.department.findUnique({ where: { id } });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Department not found");
    }
    return client_1.default.department.update({
        where: { id },
        data,
    });
});
const deleteDepartment = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const existing = yield client_1.default.department.findUnique({ where: { id } });
    if (!existing) {
        throw new api_error_1.default(http_status_1.default.NOT_FOUND, "Department not found");
    }
    return client_1.default.department.update({
        where: { id },
        data: { isActive: false },
    });
});
exports.default = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
};
