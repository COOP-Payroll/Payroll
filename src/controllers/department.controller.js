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
const catch_async_1 = __importDefault(require("../utils/catch-async"));
const http_status_1 = __importDefault(require("http-status"));
const department_service_1 = __importDefault(require("../services/department.service"));
const api_error_1 = __importDefault(require("../utils/api-error"));
const createDepartment = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (!user.companyId) {
        throw new api_error_1.default(http_status_1.default.BAD_REQUEST, "User must be associated with a company to create departments");
    }
    const department = yield department_service_1.default.createDepartment(Object.assign(Object.assign({}, req.body), { companyId: user.companyId }));
    res
        .status(http_status_1.default.CREATED)
        .send({ message: "Department created", data: department });
}));
const getAllDepartments = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    // Filter departments by user's company if not admin/super-admin
    const departments = yield department_service_1.default.getAllDepartments(user.companyId);
    res.json({
        data: departments,
        count: departments.length,
    });
}));
const getDepartmentById = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const department = yield department_service_1.default.getDepartmentById(id);
    if (!department) {
        res.status(http_status_1.default.NOT_FOUND).send({ message: "Department not found" });
        return; // return void here to satisfy TS
    }
    res.send({ data: department });
    return; // also return void here
}));
const updateDepartment = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const department = yield department_service_1.default.updateDepartment(id, req.body);
    res.send({ message: "Department updated", data: department });
}));
const deleteDepartment = (0, catch_async_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const updated = yield department_service_1.default.deleteDepartment(id);
    res
        .status(http_status_1.default.OK)
        .send({ message: "Department deactivated", data: updated });
}));
exports.default = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
};
